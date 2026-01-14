import { Test, TestingModule } from "@nestjs/testing";
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../config/prisma.service";
import * as bcrypt from "bcryptjs";

jest.mock("bcryptjs");

describe("AuthService", () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: "1",
    email: "test@example.com",
    password: "$2a$10$hashedpassword",
    name: "Test User",
    role: "USER",
    isActive: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date(),
    loginCount: 0,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    representative: {
      findUnique: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => "mock-jwt-token"),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.role).toBe(mockUser.role);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUser.email,
          sub: mockUser.id,
          role: mockUser.role,
        }),
      );
    });

    it("should throw UnauthorizedException with invalid credentials", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when user not found", async () => {
      const loginDto = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when account is inactive", async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when account is locked", async () => {
      const futureDate = new Date(Date.now() + 60000);
      const lockedUser = { ...mockUser, lockedUntil: futureDate };
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(lockedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should reset failed login attempts on successful login", async () => {
      const userWithFailedAttempts = {
        ...mockUser,
        failedLoginAttempts: 3,
      };
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithFailedAttempts,
      );
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            failedLoginAttempts: 0,
          }),
        }),
      );
    });

    it("should update lastLoginAt and loginCount", async () => {
      const loginDto = {
        email: "test@example.com",
        password: "password123",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            lastLoginAt: expect.any(Date),
            loginCount: { increment: 1 },
          }),
        }),
      );
    });
  });

  describe("validateUser", () => {
    it("should return user if credentials are valid", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        "test@example.com",
        "password123",
      );

      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(
        "nonexistent@example.com",
        "password123",
      );

      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        "test@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });

    it("should increment failed login attempts on invalid password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await service.validateUser("test@example.com", "wrongpassword");

      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it("should lock account after 5 failed attempts", async () => {
      const userWithFailedAttempts = {
        ...mockUser,
        failedLoginAttempts: 4,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(
        userWithFailedAttempts,
      );
      mockPrismaService.user.update.mockResolvedValue(userWithFailedAttempts);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await service.validateUser("test@example.com", "wrongpassword");

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failedLoginAttempts: 5,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe("createAdmin", () => {
    it("should create a new admin user with valid data", async () => {
      const createUserDto = {
        email: "admin@example.com",
        password: "AdminPassword123!",
        name: "Admin User",
        role: "ADMIN",
      };

      const createdUser = {
        ...mockUser,
        ...createUserDto,
        id: "2",
        role: "ADMIN",
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // Email doesn't exist
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      const result = await service.createAdmin(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it("should hash password before creating user", async () => {
      const createUserDto = {
        email: "admin@example.com",
        password: "AdminPassword123!",
        name: "Admin User",
        role: "ADMIN",
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // Email doesn't exist
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      await service.createAdmin(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 12);
    });

    it("should require all mandatory fields", async () => {
      const incompleteDto = {
        email: "admin@example.com",
        password: "AdminPassword123!",
        // missing name and role
      };

      await expect(service.createAdmin(incompleteDto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw error if email already exists", async () => {
      const createUserDto = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
        role: "ADMIN",
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser); // Email exists

      await expect(service.createAdmin(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("createDefaultAdmin", () => {
    it("should create default SUPER_ADMIN if not exists", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: "1",
        email: "douglas@pagluz.com",
        name: "Douglas Melere",
        role: "SUPER_ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");

      const result = await service.createDefaultAdmin();

      expect(result).toBeDefined();
      expect(result.role).toBe("SUPER_ADMIN");
    });

    it("should throw error if SUPER_ADMIN already exists", async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.createDefaultAdmin()).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("validateRepresentative", () => {
    it("should return representative if credentials are valid", async () => {
      const mockRepresentative = {
        id: "2",
        email: "rep@example.com",
        password: "$2a$10$hashedpassword",
        name: "Representative User",
        failedLoginAttempts: 0,
        lockedUntil: null,
      };

      mockPrismaService.representative.findUnique.mockResolvedValue(
        mockRepresentative,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateRepresentative(
        "rep@example.com",
        "password123",
      );

      expect(result).toEqual(mockRepresentative);
    });

    it("should return null if representative not found", async () => {
      mockPrismaService.representative.findUnique.mockResolvedValue(null);

      const result = await service.validateRepresentative(
        "nonexistent@example.com",
        "password123",
      );

      expect(result).toBeNull();
    });

    it("should return null if password is incorrect", async () => {
      const mockRepresentative = {
        id: "2",
        email: "rep@example.com",
        password: "$2a$10$hashedpassword",
      };

      mockPrismaService.representative.findUnique.mockResolvedValue(
        mockRepresentative,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateRepresentative(
        "rep@example.com",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });
  });
});
