import { Test, TestingModule } from '@nestjs/testing';
import { ConsumersService } from './consumers.service';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CommissionsService } from '../commissions/commissions.service';
import { SupabaseStorageService } from '../../common/services/supabase-storage.service';
import { OcrService } from '../../common/services/ocr.service';
import { ConsumerChangeRequestsService } from './consumer-change-requests.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConsumerApprovalStatus, ConsumerType, PhaseType } from '../../common/enums';

describe('ConsumersService', () => {
  let service: ConsumersService;
  let prismaService: PrismaService;
  let auditService: AuditService;

  // Helper to create valid CreateConsumerDto
  const createValidConsumerDto = (overrides = {}) => ({
    cpfCnpj: '12345678900',
    name: 'Test Consumer',
    email: 'consumer@example.com',
    phone: '1122222222',
    birthDate: '1990-01-01',
    arrivalDate: '2023-01-01',
    concessionaire: 'CELESC',
    ucNumber: '12345678',
    consumerType: ConsumerType.RESIDENTIAL,
    phase: PhaseType.MONOPHASIC,
    averageMonthlyConsumption: 350.5,
    discountOffered: 15.5,
    city: 'Test City',
    state: 'SC',
    ...overrides,
  });

  const mockConsumer = {
    id: '1',
    cpfCnpj: '12345678900',
    name: 'Test Consumer',
    email: 'consumer@example.com',
    phone: '1122222222',
    status: 'ACTIVE',
    approvalStatus: ConsumerApprovalStatus.APPROVED,
    representativeId: null,
    generatorId: '1',
    birthDate: new Date('1990-01-01'),
    arrivalDate: new Date('2023-01-01'),
    submittedByRepresentativeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepresentative = {
    id: 'rep-1',
    name: 'Test Representative',
    email: 'rep@example.com',
    cpfCnpj: '98765432100',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockGenerator = {
    id: '1',
    name: 'Test Generator',
    cpfCnpj: '11111111111',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    consumer: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    representative: {
      findUnique: jest.fn(),
    },
    generator: {
      findUnique: jest.fn(),
    },
  };

  const mockAuditService = {
    logCreate: jest.fn(),
    logUpdate: jest.fn(),
    logDelete: jest.fn(),
    log: jest.fn(),
    logRepresentativeCreate: jest.fn(),
  };

  const mockCommissionsService = {
    calculateConsumerCommission: jest.fn(),
  };

  const mockSupabaseStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockOcrService = {
    extractDocumentInfo: jest.fn(),
  };

  const mockChangeRequestsService = {
    create: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: CommissionsService,
          useValue: mockCommissionsService,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
        {
          provide: OcrService,
          useValue: mockOcrService,
        },
        {
          provide: ConsumerChangeRequestsService,
          useValue: mockChangeRequestsService,
        },
      ],
    }).compile();

    service = module.get<ConsumersService>(ConsumersService);
    prismaService = module.get<PrismaService>(PrismaService);
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a consumer through admin panel', async () => {
      const createConsumerDto = createValidConsumerDto({ generatorId: '1' });

      mockPrismaService.generator.findUnique.mockResolvedValue(mockGenerator);
      mockPrismaService.consumer.create.mockResolvedValue(mockConsumer);

      const result = await service.create(createConsumerDto);

      expect(result).toEqual(mockConsumer);
      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.APPROVED);
      expect(mockPrismaService.consumer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          cpfCnpj: createConsumerDto.cpfCnpj,
          approvalStatus: ConsumerApprovalStatus.APPROVED,
          submittedByRepresentativeId: null,
        }),
        include: expect.any(Object),
      });
    });

    it('should throw error if generator not found', async () => {
      const createConsumerDto = createValidConsumerDto({ generatorId: 'invalid-id' });

      mockPrismaService.generator.findUnique.mockResolvedValue(null);

      await expect(service.create(createConsumerDto)).rejects.toThrow(
        new NotFoundException('Gerador não encontrado'),
      );
    });

    it('should create consumer without generator if not specified', async () => {
      const createConsumerDto = createValidConsumerDto();
      delete (createConsumerDto as any).generatorId;

      const consumerWithoutGenerator = { ...mockConsumer, generatorId: null };
      mockPrismaService.consumer.create.mockResolvedValue(consumerWithoutGenerator);

      const result = await service.create(createConsumerDto);

      expect(result.generatorId).toBeNull();
    });
  });

  describe('createAsRepresentative', () => {
    it('should successfully create consumer as representative with pending approval', async () => {
      const representativeId = 'rep-1';
      const createConsumerDto = createValidConsumerDto({ generatorId: '1' });

      const pendingConsumer = {
        ...mockConsumer,
        representativeId,
        approvalStatus: ConsumerApprovalStatus.PENDING,
        submittedByRepresentativeId: representativeId,
      };

      mockPrismaService.representative.findUnique.mockResolvedValue(mockRepresentative);
      mockPrismaService.generator.findUnique.mockResolvedValue(mockGenerator);
      mockPrismaService.consumer.create.mockResolvedValue(pendingConsumer);

      const result = await service.createAsRepresentative(createConsumerDto, representativeId);

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.PENDING);
      expect(result.representativeId).toBe(representativeId);
      expect(result.submittedByRepresentativeId).toBe(representativeId);
    });

    it('should throw error if representative not found', async () => {
      const representativeId = 'invalid-rep';
      const createConsumerDto = createValidConsumerDto();

      mockPrismaService.representative.findUnique.mockResolvedValue(null);

      await expect(service.createAsRepresentative(createConsumerDto, representativeId)).rejects.toThrow(
        new NotFoundException('Representante não encontrado'),
      );
    });

    it('should throw error if representative is not active', async () => {
      const representativeId = 'rep-1';
      const createConsumerDto = createValidConsumerDto();

      const inactiveRepresentative = { ...mockRepresentative, status: 'INACTIVE' };
      mockPrismaService.representative.findUnique.mockResolvedValue(inactiveRepresentative);

      await expect(service.createAsRepresentative(createConsumerDto, representativeId)).rejects.toThrow(
        new BadRequestException('Representante não está ativo'),
      );
    });

    it('should throw error if generator not found when specified by representative', async () => {
      const representativeId = 'rep-1';
      const createConsumerDto = createValidConsumerDto({ generatorId: 'invalid-id' });

      mockPrismaService.representative.findUnique.mockResolvedValue(mockRepresentative);
      mockPrismaService.generator.findUnique.mockResolvedValue(null);

      await expect(service.createAsRepresentative(createConsumerDto, representativeId)).rejects.toThrow(
        new NotFoundException('Gerador não encontrado'),
      );
    });
  });

  describe('findOne', () => {
    it('should return a consumer by id', async () => {
      mockPrismaService.consumer.findUnique.mockResolvedValue(mockConsumer);

      const result = await service.findOne('1');

      expect(result).toEqual(mockConsumer);
      expect(mockPrismaService.consumer.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should throw error if consumer not found', async () => {
      mockPrismaService.consumer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all approved consumers', async () => {
      const consumers = [mockConsumer];
      mockPrismaService.consumer.findMany.mockResolvedValue(consumers);

      const result = await service.findAll();

      expect(result).toEqual(consumers);
      expect(mockPrismaService.consumer.findMany).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should filter out unapproved consumers', async () => {
      const approvedConsumers = [mockConsumer];
      mockPrismaService.consumer.findMany.mockResolvedValue(approvedConsumers);

      const result = await service.findAll();

      expect(result).toEqual(approvedConsumers);
    });

    it('should return empty array when no consumers found', async () => {
      mockPrismaService.consumer.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should fix invoice URLs in response', async () => {
      const consumerWithInvoice = {
        ...mockConsumer,
        invoiceUrl: 'https://old-domain.com/invoice.pdf',
        invoiceFileName: 'invoice.pdf',
      };
      mockPrismaService.consumer.findMany.mockResolvedValue([consumerWithInvoice]);

      const result = await service.findAll();

      expect(result[0].invoiceUrl).toContain('/consumers/');
      expect(result[0].invoiceUrl).toContain('/invoice');
    });
  });

  describe('update', () => {
    it('should successfully update a consumer', async () => {
      const consumerId = '1';
      const updateConsumerDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedConsumer = { ...mockConsumer, ...updateConsumerDto };
      mockPrismaService.consumer.findUnique.mockResolvedValue(mockConsumer);
      mockPrismaService.consumer.update.mockResolvedValue(updatedConsumer);

      const result = await service.update(consumerId, updateConsumerDto);

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('updated@example.com');
      expect(mockPrismaService.consumer.update).toHaveBeenCalledWith({
        where: { id: consumerId },
        data: expect.objectContaining(updateConsumerDto),
        include: expect.any(Object),
      });
    });

    it('should throw error if consumer not found during update', async () => {
      const consumerId = 'invalid-id';
      const updateConsumerDto = { name: 'Updated Name' };

      mockPrismaService.consumer.findUnique.mockResolvedValue(null);

      await expect(service.update(consumerId, updateConsumerDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete a consumer', async () => {
      const consumerId = '1';
      mockPrismaService.consumer.findUnique.mockResolvedValue(mockConsumer);
      mockPrismaService.consumer.delete.mockResolvedValue(mockConsumer);

      const result = await service.remove(consumerId);

      expect(result).toHaveProperty('message');
      expect(mockPrismaService.consumer.delete).toHaveBeenCalledWith({
        where: { id: consumerId },
      });
    });

    it('should throw error if consumer not found during deletion', async () => {
      const consumerId = 'invalid-id';
      mockPrismaService.consumer.findUnique.mockResolvedValue(null);

      await expect(service.remove(consumerId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('linkToRepresentative', () => {
    it('should find consumer by representative', async () => {
      const representativeId = 'rep-1';
      const representativeConsumers = [mockConsumer];

      mockPrismaService.consumer.findMany.mockResolvedValue(representativeConsumers);

      const result = await service.findByRepresentative(representativeId);

      expect(result).toEqual(representativeConsumers);
      expect(mockPrismaService.consumer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            representativeId,
          }),
        }),
      );
    });

    it('should return empty array if representative has no consumers', async () => {
      mockPrismaService.consumer.findMany.mockResolvedValue([]);

      const result = await service.findByRepresentative('rep-1');

      expect(result).toEqual([]);
    });

    it('should find specific representative consumer', async () => {
      const representativeId = 'rep-1';
      const consumerId = '1';
      const representativeConsumer = { ...mockConsumer, representativeId };

      mockPrismaService.consumer.findFirst.mockResolvedValue(representativeConsumer);

      const result = await service.findRepresentativeConsumer(representativeId, consumerId);

      expect(result).toBeDefined();
    });

    it('should throw error if representative consumer not found', async () => {
      mockPrismaService.consumer.findFirst.mockResolvedValue(null);

      await expect(service.findRepresentativeConsumer('rep-1', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPending', () => {
    it('should find pending consumers with pagination', async () => {
      const pendingConsumer = { ...mockConsumer, approvalStatus: ConsumerApprovalStatus.PENDING };
      const pendingConsumers = [pendingConsumer];

      mockPrismaService.consumer.findMany.mockResolvedValue(pendingConsumers);
      mockPrismaService.consumer.count.mockResolvedValue(1);

      const result = await service.findPending({});

      expect(result.consumers).toEqual(pendingConsumers);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter pending consumers by representative', async () => {
      const representativeId = 'rep-1';
      const pendingConsumer = {
        ...mockConsumer,
        representativeId,
        approvalStatus: ConsumerApprovalStatus.PENDING,
      };

      mockPrismaService.consumer.findMany.mockResolvedValue([pendingConsumer]);
      mockPrismaService.consumer.count.mockResolvedValue(1);

      const result = await service.findPending({ representativeId });

      expect(result.consumers[0].representativeId).toBe(representativeId);
    });

    it('should return pagination metadata for pending consumers', async () => {
      mockPrismaService.consumer.findMany.mockResolvedValue([]);
      mockPrismaService.consumer.count.mockResolvedValue(0);

      const result = await service.findPending({});

      expect(result.pagination).toHaveProperty('page');
      expect(result.pagination).toHaveProperty('limit');
      expect(result.pagination).toHaveProperty('total');
    });
  });

  describe('approveConsumer', () => {
    it('should approve a pending consumer', async () => {
      const consumerId = '1';
      const pendingConsumer = { ...mockConsumer, approvalStatus: ConsumerApprovalStatus.PENDING };
      const approvedConsumer = { ...pendingConsumer, approvalStatus: ConsumerApprovalStatus.APPROVED };

      mockPrismaService.consumer.findUnique.mockResolvedValue(pendingConsumer);
      mockPrismaService.consumer.update.mockResolvedValue(approvedConsumer);

      const result = await service.approveConsumer(consumerId);

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.APPROVED);
    });

    it('should throw error if consumer not found during approval', async () => {
      const consumerId = '1';
      mockPrismaService.consumer.findUnique.mockResolvedValue(null);

      await expect(service.approveConsumer(consumerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('rejectConsumer', () => {
    it('should reject a pending consumer', async () => {
      const consumerId = '1';
      const userId = 'user-1';
      const reason = 'Invalid documents';
      const pendingConsumer = { ...mockConsumer, approvalStatus: ConsumerApprovalStatus.PENDING };
      const rejectedConsumer = { ...pendingConsumer, approvalStatus: ConsumerApprovalStatus.REJECTED };

      mockPrismaService.consumer.findUnique.mockResolvedValue(pendingConsumer);
      mockPrismaService.consumer.update.mockResolvedValue(rejectedConsumer);

      const result = await service.rejectConsumer(consumerId, userId, reason);

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.REJECTED);
    });

    it('should throw error if consumer not found', async () => {
      mockPrismaService.consumer.findUnique.mockResolvedValue(null);

      await expect(service.rejectConsumer('1', 'user-1', 'reason')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('rejectConsumer - specific tests', () => {
    it('should include reason in rejection', async () => {
      const consumerId = '1';
      const reason = 'Invalid documents';
      const userId = 'user-1';
      const pendingConsumer = { ...mockConsumer, approvalStatus: ConsumerApprovalStatus.PENDING };
      const rejectedConsumer = { ...pendingConsumer, approvalStatus: ConsumerApprovalStatus.REJECTED };

      mockPrismaService.consumer.findUnique.mockResolvedValue(pendingConsumer);
      mockPrismaService.consumer.update.mockResolvedValue(rejectedConsumer);

      const result = await service.rejectConsumer(consumerId, userId, reason);

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.REJECTED);
    });
  });
});
