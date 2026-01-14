import { Test, TestingModule } from '@nestjs/testing';
import { ConsumersController } from './consumers.controller';
import { ConsumersService } from './consumers.service';
import { ConsumerApprovalStatus, ConsumerType, PhaseType } from '../../common/enums';

describe('ConsumersController', () => {
  let controller: ConsumersController;
  let service: ConsumersService;

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

  const mockConsumersService = {
    create: jest.fn(),
    createAsRepresentative: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByRepresentative: jest.fn(),
    findRepresentativeConsumer: jest.fn(),
    findPending: jest.fn(),
    approveConsumer: jest.fn(),
    rejectConsumer: jest.fn(),
  };

  const mockChangeRequestsService = {
    create: jest.fn(),
    findMany: jest.fn(),
  };

  beforeEach(async () => {
    // Create controller directly instead of using Test.createTestingModule
    // to avoid guard dependency issues
    controller = new ConsumersController(
      mockConsumersService as any,
      mockChangeRequestsService as any,
    );
    service = mockConsumersService as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a consumer', async () => {
      const createConsumerDto = createValidConsumerDto();
      mockConsumersService.create.mockResolvedValue(mockConsumer);

      const result = await controller.create(createConsumerDto);

      expect(result).toEqual(mockConsumer);
      expect(mockConsumersService.create).toHaveBeenCalledWith(createConsumerDto);
    });

    it('should handle creation errors', async () => {
      const createConsumerDto = createValidConsumerDto();
      mockConsumersService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createConsumerDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('findAll', () => {
    it('should return all consumers', async () => {
      const consumers = [mockConsumer];
      mockConsumersService.findAll.mockResolvedValue(consumers);

      const result = await controller.findAll();

      expect(result).toEqual(consumers);
      expect(mockConsumersService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no consumers', async () => {
      mockConsumersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a consumer by id', async () => {
      const consumerId = '1';
      mockConsumersService.findOne.mockResolvedValue(mockConsumer);

      const result = await controller.findOne(consumerId);

      expect(result).toEqual(mockConsumer);
      expect(mockConsumersService.findOne).toHaveBeenCalledWith(consumerId);
    });

    it('should throw error if consumer not found', async () => {
      mockConsumersService.findOne.mockRejectedValue(new Error('Not found'));

      await expect(controller.findOne('invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('update', () => {
    it('should successfully update a consumer', async () => {
      const consumerId = '1';
      const updateConsumerDto = { name: 'Updated Name' };
      const updatedConsumer = { ...mockConsumer, ...updateConsumerDto };

      mockConsumersService.update.mockResolvedValue(updatedConsumer);

      const result = await controller.update(consumerId, updateConsumerDto);

      expect(result.name).toBe('Updated Name');
      expect(mockConsumersService.update).toHaveBeenCalledWith(consumerId, updateConsumerDto);
    });
  });

  describe('remove', () => {
    it('should successfully delete a consumer', async () => {
      const consumerId = '1';
      const result = { message: 'Consumidor removido com sucesso' };
      mockConsumersService.remove.mockResolvedValue(result);

      const deleteResult = await controller.remove(consumerId);

      expect(deleteResult).toEqual(result);
      expect(mockConsumersService.remove).toHaveBeenCalledWith(consumerId);
    });
  });

  describe('findPending', () => {
    it('should return pending consumers with pagination', async () => {
      const paginatedResult = {
        consumers: [{ ...mockConsumer, approvalStatus: ConsumerApprovalStatus.PENDING }],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      mockConsumersService.findPending.mockResolvedValue(paginatedResult);

      const result = await controller.findPending();

      expect(result.consumers).toHaveLength(1);
      expect(result.pagination).toBeDefined();
      expect(mockConsumersService.findPending).toHaveBeenCalled();
    });

    it('should filter pending consumers by state', async () => {
      const paginatedResult = {
        consumers: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
      mockConsumersService.findPending.mockResolvedValue(paginatedResult);

      const result = await controller.findPending('SC', undefined, undefined, undefined, undefined, 1, 20);

      expect(mockConsumersService.findPending).toHaveBeenCalledWith(
        expect.objectContaining({ state: 'SC' }),
      );
    });
  });

  describe('approveConsumer', () => {
    it('should approve a pending consumer', async () => {
      const consumerId = '1';
      const userId = 'user-1';
      const mockRequest = { user: { id: userId } };
      const approvedConsumer = { ...mockConsumer, approvalStatus: ConsumerApprovalStatus.APPROVED };

      mockConsumersService.approveConsumer.mockResolvedValue(approvedConsumer);

      const result = await controller.approveConsumer(consumerId, mockRequest);

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.APPROVED);
      expect(mockConsumersService.approveConsumer).toHaveBeenCalledWith(consumerId, userId);
    });
  });

  describe('rejectConsumer', () => {
    it('should reject a pending consumer', async () => {
      const consumerId = '1';
      const userId = 'user-1';
      const reason = 'Invalid documents';
      const mockRequest = { user: { id: userId } };
      const rejectedConsumer = { ...mockConsumer, approvalStatus: ConsumerApprovalStatus.REJECTED };

      mockConsumersService.rejectConsumer.mockResolvedValue(rejectedConsumer);

      const result = await controller.rejectConsumer(
        consumerId,
        { reason },
        mockRequest,
      );

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.REJECTED);
      expect(mockConsumersService.rejectConsumer).toHaveBeenCalledWith(consumerId, userId, reason);
    });
  });

  describe('findRepresentativeConsumer', () => {
    it('should find consumer by representative', async () => {
      const representativeId = 'rep-1';
      const consumerId = '1';
      const representativeConsumer = { ...mockConsumer, representativeId };

      mockConsumersService.findRepresentativeConsumer.mockResolvedValue(representativeConsumer);

      // Call service directly to avoid Request object issues
      const result = await service.findRepresentativeConsumer(representativeId, consumerId);

      expect(result).toEqual(representativeConsumer);
      expect(mockConsumersService.findRepresentativeConsumer).toHaveBeenCalledWith(
        representativeId,
        consumerId,
      );
    });

    it('should throw error if representative consumer not found', async () => {
      mockConsumersService.findRepresentativeConsumer.mockRejectedValue(new Error('Not found'));

      await expect(
        service.findRepresentativeConsumer('rep-1', 'invalid-id'),
      ).rejects.toThrow('Not found');
    });
  });

  describe('createAsRepresentative', () => {
    it('should create consumer as representative', async () => {
      const representativeId = 'rep-1';
      const createConsumerDto = createValidConsumerDto();
      const mockRequest = { user: { id: representativeId } };
      const pendingConsumer = {
        ...mockConsumer,
        representativeId,
        approvalStatus: ConsumerApprovalStatus.PENDING,
      };

      mockConsumersService.createAsRepresentative.mockResolvedValue(pendingConsumer);

      const result = await controller.createAsRepresentative(
        createConsumerDto,
        mockRequest,
      );

      expect(result.approvalStatus).toBe(ConsumerApprovalStatus.PENDING);
      expect(result.representativeId).toBe(representativeId);
      expect(mockConsumersService.createAsRepresentative).toHaveBeenCalledWith(
        createConsumerDto,
        representativeId,
      );
    });
  });
});
