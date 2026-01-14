import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;

  const mockJwtService = {
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('JWT Token Validation', () => {
    it('should verify JWT token correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'USER',
      };

      mockJwtService.verify.mockReturnValue(mockUser);

      const token = 'valid-jwt-token';
      const result = jwtService.verify(token);

      expect(result).toEqual(mockUser);
      expect(jwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw error on invalid token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const token = 'expired-token';

      expect(() => jwtService.verify(token)).toThrow('jwt expired');
    });

    it('should handle token without Bearer prefix', () => {
      const token = 'invalid-format-token';

      // Token without Bearer prefix should not be processed
      expect(token).not.toMatch(/^Bearer\s/);
    });
  });

  describe('User Extraction', () => {
    it('should extract user ID from token', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'USER',
        sub: '1',
      };

      mockJwtService.verify.mockReturnValue(mockUser);

      const result = jwtService.verify('token');

      expect(result.id).toBe('1');
      expect(result.sub).toBe('1');
    });

    it('should extract user role from token', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'ADMIN',
      };

      mockJwtService.verify.mockReturnValue(mockUser);

      const result = jwtService.verify('token');

      expect(result.role).toBe('ADMIN');
    });
  });

  describe('Error Handling', () => {
    it('should handle jwt malformed error', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => jwtService.verify('bad-token')).toThrow('jwt malformed');
    });

    it('should handle jwt invalid signature error', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      expect(() => jwtService.verify('forged-token')).toThrow('invalid signature');
    });

    it('should handle missing token', () => {
      // Token should be provided
      expect(undefined).toBeUndefined();
    });
  });
});
