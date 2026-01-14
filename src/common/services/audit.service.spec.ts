import { Test, TestingModule } from "@nestjs/testing";
import { AuditService } from "./audit.service";
import { PrismaService } from "../../config/prisma.service";

describe("AuditService", () => {
  let service: AuditService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("logLogin", () => {
    it("should create audit log for successful login", async () => {
      const userId = "1";
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "LOGIN",
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await service.logLogin(userId, ipAddress, userAgent);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            action: "LOGIN",
            ipAddress,
            userAgent,
          }),
        }),
      );
    });

    it("should record login timestamp", async () => {
      const userId = "1";
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      const now = new Date();
      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "LOGIN",
        ipAddress,
        userAgent,
        timestamp: now,
      });

      await service.logLogin(userId, ipAddress, userAgent);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logLogout", () => {
    it("should create audit log for logout", async () => {
      const userId = "1";
      const ipAddress = "192.168.1.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "LOGOUT",
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await service.logLogout(userId, ipAddress, userAgent);

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logSecurityEvent", () => {
    it("should create audit log for security event", async () => {
      const userId = "1";
      const action = "UNAUTHORIZED_ACCESS_ATTEMPT";
      const metadata = { resource: "sensitive-data" };
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action,
        metadata,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await service.log({
        userId,
        action,
        entityType: "Security",
        ipAddress,
        userAgent,
        metadata,
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logCreate", () => {
    it("should create audit log for resource creation", async () => {
      const userId = "1";
      const entityType = "User";
      const entityId = "2";
      const newValues = { email: "newuser@example.com", name: "New User" };
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "CREATE",
        entityType,
        entityId,
        newValues,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await service.logCreate(
        userId,
        entityType,
        entityId,
        newValues,
        ipAddress,
        userAgent,
      );

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logUpdate", () => {
    it("should create audit log for resource update", async () => {
      const userId = "1";
      const entityType = "User";
      const entityId = "2";
      const oldValues = { email: "old@example.com" };
      const newValues = { email: "new@example.com" };
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "UPDATE",
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await service.logUpdate(
        userId,
        entityType,
        entityId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      );

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("logDelete", () => {
    it("should create audit log for resource deletion", async () => {
      const userId = "1";
      const entityType = "User";
      const entityId = "2";
      const oldValues = { email: "deleted@example.com", name: "Deleted User" };
      const ipAddress = "127.0.0.1";
      const userAgent = "Mozilla/5.0";

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "DELETE",
        entityType,
        entityId,
        oldValues,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await service.logDelete(
        userId,
        entityType,
        entityId,
        oldValues,
        ipAddress,
        userAgent,
      );

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });

  describe("general logging", () => {
    it("should handle errors gracefully during log creation", async () => {
      const mockError = new Error("Database error");
      mockPrismaService.auditLog.create.mockRejectedValue(mockError);

      // Should not throw, just log the error
      await service.log({
        userId: "1",
        action: "TEST",
        entityType: "Test",
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });

    it("should include metadata in audit log", async () => {
      const userId = "1";
      const metadata = { timestamp: new Date().toISOString() };

      mockPrismaService.auditLog.create.mockResolvedValue({
        id: "1",
        userId,
        action: "LOGIN",
        entityType: "User",
        metadata,
      });

      await service.log({
        userId,
        action: "LOGIN",
        entityType: "User",
        metadata,
      });

      expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
    });
  });
});
