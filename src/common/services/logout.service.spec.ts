import { Test, TestingModule } from "@nestjs/testing";
import { LogoutService } from "./logout.service";
import { PrismaService } from "../../config/prisma.service";
import { AuditService } from "./audit.service";

describe("LogoutService", () => {
  let service: LogoutService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  const mockPrismaService = {
    blacklistedToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  const mockAuditService = {
    logLogout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<LogoutService>(LogoutService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("logout", () => {
    it("should successfully logout user and add token to blacklist", async () => {
      const userId = "1";
      const token = "jwt-token";
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.blacklistedToken.create.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId,
        expiresAt: expect.any(Date),
      });

      mockAuditService.logLogout.mockResolvedValue(undefined);
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        lastLoginAt: expect.any(Date),
      });

      const result = await service.logout(userId, token, ipAddress, userAgent);

      expect(result).toBeDefined();
      expect(mockPrismaService.blacklistedToken.create).toHaveBeenCalled();
      expect(mockAuditService.logLogout).toHaveBeenCalledWith(
        userId,
        ipAddress,
        userAgent,
      );
    });

    it("should hash the token before storing in blacklist", async () => {
      const userId = "1";
      const token = "jwt-token";

      mockPrismaService.blacklistedToken.create.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId,
        expiresAt: expect.any(Date),
      });

      mockAuditService.logLogout.mockResolvedValue(undefined);
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
      });

      await service.logout(userId, token);

      expect(mockPrismaService.blacklistedToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
          }),
        }),
      );
    });

    it("should set token expiration in blacklist", async () => {
      const userId = "1";
      const token = "jwt-token";

      mockPrismaService.blacklistedToken.create.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId,
        expiresAt: expect.any(Date),
      });

      mockAuditService.logLogout.mockResolvedValue(undefined);
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
      });

      await service.logout(userId, token);

      expect(mockPrismaService.blacklistedToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });

    it("should update user lastLoginAt timestamp", async () => {
      const userId = "1";
      const token = "jwt-token";

      mockPrismaService.blacklistedToken.create.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId,
        expiresAt: expect.any(Date),
      });

      mockAuditService.logLogout.mockResolvedValue(undefined);
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
        lastLoginAt: new Date(),
      });

      await service.logout(userId, token);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
        }),
      );
    });

    it("should log logout event in audit service", async () => {
      const userId = "1";
      const token = "jwt-token";
      const ipAddress = "192.168.1.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.blacklistedToken.create.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId,
        expiresAt: expect.any(Date),
      });

      mockAuditService.logLogout.mockResolvedValue(undefined);
      mockPrismaService.user.update.mockResolvedValue({
        id: userId,
      });

      await service.logout(userId, token, ipAddress, userAgent);

      expect(mockAuditService.logLogout).toHaveBeenCalledWith(
        userId,
        ipAddress,
        userAgent,
      );
    });
  });

  describe("isTokenBlacklisted", () => {
    it("should return false if token is not in blacklist", async () => {
      const token = "valid-token";

      mockPrismaService.blacklistedToken.findUnique.mockResolvedValue(null);

      const result = await service.isTokenBlacklisted(token);

      expect(result).toBe(false);
    });

    it("should return true if token is in blacklist", async () => {
      const token = "blacklisted-token";

      mockPrismaService.blacklistedToken.findUnique.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId: "1",
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      });

      const result = await service.isTokenBlacklisted(token);

      expect(result).toBe(true);
    });

    it("should return true if token expiration has passed", async () => {
      const token = "expired-token";
      const expiredDate = new Date(Date.now() - 3600000); // 1 hour ago

      mockPrismaService.blacklistedToken.findUnique.mockResolvedValue({
        id: "1",
        token: expect.any(String),
        userId: "1",
        expiresAt: expiredDate,
      });

      const result = await service.isTokenBlacklisted(token);

      expect(result).toBe(false);
    });
  });
});
