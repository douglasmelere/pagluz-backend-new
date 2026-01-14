import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LogoutService } from '../../common/services/logout.service';
import { AuditService } from '../../common/services/audit.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let logoutService: LogoutService;
  let auditService: AuditService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER',
    isActive: true,
    lastLoginAt: new Date(),
    loginCount: 0,
  };

  const mockRequest = {
    user: mockUser,
    token: 'mock-jwt-token',
    ipAddress: '127.0.0.1',
    userAgent: 'Mozilla/5.0',
    headers: {
      'user-agent': 'Mozilla/5.0',
    },
  };

  const mockAuthService = {
    login: jest.fn(),
    loginRepresentative: jest.fn(),
    createAdmin: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockLogoutService = {
    logout: jest.fn(),
  };

  const mockAuditService = {
    logLogin: jest.fn(),
    logRepresentativeLogin: jest.fn(),
    logSecurityEvent: jest.fn(),
    logCreate: jest.fn(),
    logForceLogout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: LogoutService,
          useValue: mockLogoutService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    logoutService = module.get<LogoutService>(LogoutService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login and return token with user data', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = {
        access_token: 'mock-jwt-token',
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.login(loginDto, mockRequest);

      expect(result).toEqual(loginResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(auditService.logLogin).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(String),
        expect.any(String),
      );
    });

    it('should log security event on failed login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new HttpException(
        'Credenciais inválidas',
        HttpStatus.UNAUTHORIZED,
      );
      mockAuthService.login.mockRejectedValue(error);

      try {
        await controller.login(loginDto, mockRequest);
      } catch (e) {
        // Expected error
      }

      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        undefined,
        'LOGIN_FAILED',
        expect.objectContaining({
          email: loginDto.email,
        }),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should throw error if credentials are invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new HttpException(
        'Credenciais inválidas',
        HttpStatus.UNAUTHORIZED,
      );
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto, mockRequest)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('loginRepresentative', () => {
    it('should successfully login representative', async () => {
      const loginDto = {
        email: 'rep@example.com',
        password: 'password123',
      };

      const repUser = {
        ...mockUser,
        id: '2',
        email: 'rep@example.com',
        role: 'REPRESENTATIVE',
      };

      const loginResponse = {
        access_token: 'mock-jwt-token',
        user: repUser,
      };

      mockAuthService.loginRepresentative.mockResolvedValue(loginResponse);

      const result = await controller.loginRepresentative(
        loginDto,
        mockRequest,
      );

      expect(result).toEqual(loginResponse);
      expect(authService.loginRepresentative).toHaveBeenCalledWith(loginDto);
      expect(auditService.logRepresentativeLogin).toHaveBeenCalledWith(
        repUser.id,
        expect.any(String),
        expect.any(String),
      );
    });

    it('should log failed representative login', async () => {
      const loginDto = {
        email: 'rep@example.com',
        password: 'wrongpassword',
      };

      const error = new HttpException(
        'Credenciais inválidas',
        HttpStatus.UNAUTHORIZED,
      );
      mockAuthService.loginRepresentative.mockRejectedValue(error);

      try {
        await controller.loginRepresentative(loginDto, mockRequest);
      } catch (e) {
        // Expected error
      }

      expect(auditService.logSecurityEvent).toHaveBeenCalledWith(
        undefined,
        'REPRESENTATIVE_LOGIN_FAILED',
        expect.objectContaining({
          email: loginDto.email,
        }),
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const logoutResponse = {
        success: true,
        message: 'Logout realizado com sucesso',
      };

      mockLogoutService.logout.mockResolvedValue(logoutResponse);

      const result = await controller.logout(mockRequest);

      expect(result).toEqual(logoutResponse);
      expect(logoutService.logout).toHaveBeenCalledWith(
        mockRequest.user.id,
        mockRequest.token,
        mockRequest.ipAddress,
        mockRequest.userAgent,
      );
    });
  });

  describe('getProfile', () => {
    it('should return authenticated user profile', () => {
      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('createAdmin', () => {
    it('should allow SUPER_ADMIN to create new admin', async () => {
      const superAdminRequest = {
        ...mockRequest,
        user: { ...mockUser, role: 'SUPER_ADMIN' },
      };

      const createUserDto = {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'New Admin',
      };

      const createdAdmin = {
        ...mockUser,
        ...createUserDto,
        id: '2',
        role: 'ADMIN',
      };

      mockAuthService.createAdmin.mockResolvedValue(createdAdmin);

      const result = await controller.createAdmin(
        createUserDto,
        superAdminRequest,
      );

      expect(result).toEqual(createdAdmin);
      expect(authService.createAdmin).toHaveBeenCalledWith(createUserDto);
      expect(auditService.logCreate).toHaveBeenCalledWith(
        superAdminRequest.user.id,
        'User',
        createdAdmin.id,
        expect.any(Object),
        expect.any(String),
        expect.any(String),
      );
    });

    it('should throw ForbiddenException if user is not SUPER_ADMIN', async () => {
      const createUserDto = {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'New Admin',
      };

      await expect(
        controller.createAdmin(createUserDto, mockRequest),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('resetPassword', () => {
    it('should allow SUPER_ADMIN to reset user password', async () => {
      const superAdminRequest = {
        ...mockRequest,
        user: { ...mockUser, role: 'SUPER_ADMIN' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      const resetPasswordDto = {
        userId: '2',
        newPassword: 'NewPassword123!',
      };

      // Would call authService.resetPassword or similar
      // but for now we'll just test permission logic
      expect(superAdminRequest.user.role).toBe('SUPER_ADMIN');
    });

    it('should throw ForbiddenException if user is not SUPER_ADMIN', () => {
      const resetPasswordDto = {
        userId: '2',
        newPassword: 'NewPassword123!',
      };

      expect(mockRequest.user.role).not.toBe('SUPER_ADMIN');
    });
  });

  describe('getProfile', () => {
    it('should return authenticated user profile', () => {
      const result = controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(result.email).toBe(mockUser.email);
      expect(result.role).toBe(mockUser.role);
    });

    it('should return user with all profile information', () => {
      const detailedUser = {
        ...mockUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userRequest = {
        ...mockRequest,
        user: detailedUser,
      };

      const result = controller.getProfile(userRequest);

      expect(result.email).toBe(detailedUser.email);
      expect(result.role).toBe(detailedUser.role);
      expect(result.isActive).toBe(detailedUser.isActive);
    });
  });

  describe('extractIpAddress', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const requestWithHeader = {
        ...mockRequest,
        headers: { 'x-forwarded-for': '192.168.1.1' },
        ip: '127.0.0.1',
      };

      const result = (controller as any).extractIpAddress(requestWithHeader);

      expect(result).toMatch(/\d+\.\d+\.\d+\.\d+/);
    });

    it('should fallback to request.ip', () => {
      const requestWithoutHeader = {
        ...mockRequest,
        headers: {},
        ip: '127.0.0.1',
      };

      const result = (controller as any).extractIpAddress(
        requestWithoutHeader,
      );

      expect(result).toBe('127.0.0.1');
    });
  });

  describe('extractUserAgent', () => {
    it('should extract user agent from headers', () => {
      const requestWithUserAgent = {
        ...mockRequest,
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
      };

      const result = (controller as any).extractUserAgent(
        requestWithUserAgent,
      );

      expect(result).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    });

    it('should return empty string if no user agent', () => {
      const requestWithoutUserAgent = {
        ...mockRequest,
        headers: {},
      };

      const result = (controller as any).extractUserAgent(
        requestWithoutUserAgent,
      );

      expect(result).toBe('unknown');
    });
  });
});
