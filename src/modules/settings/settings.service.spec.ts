import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../../config/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { BadRequestException } from '@nestjs/common';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: any;
  let audit: any;

  const activeKwh = {
    id: '1',
    key: 'KWH_PRICE',
    value: '0.90',
    description: 'foo',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const activeFio = {
    id: '2',
    key: 'FIO_B_PERCENTAGE',
    value: '33.3',
    description: 'bar',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      systemSettings: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      consumer: { count: jest.fn() },
      representative: { count: jest.fn() },
      commission: {
        count: jest.fn(),
        aggregate: jest.fn(),
      },
    };

    audit = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(() => jest.resetAllMocks());

  describe('getCurrentKwhPrice', () => {
    it('returns default when no setting', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(null);
      const result = await service.getCurrentKwhPrice();
      expect(result).toBe(0.90);
    });

    it('parses existing setting value', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(activeKwh);
      const result = await service.getCurrentKwhPrice();
      expect(result).toBe(0.90);
    });
  });

  describe('setKwhPrice', () => {
    it('throws for nonpositive price', async () => {
      await expect(service.setKwhPrice(0, 'user')).rejects.toThrow(BadRequestException);
    });

    it('creates new setting when none exists', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(null);
      prisma.systemSettings.create.mockResolvedValue(activeKwh);

      const out = await service.setKwhPrice(1.23, 'user1');
      expect(prisma.systemSettings.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ key: 'KWH_PRICE', value: '1.23' }),
      }));
      expect(audit.log).toHaveBeenCalled();
      expect(out.value).toBe(1.23);
    });

    it('updates existing setting', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(activeKwh);
      prisma.systemSettings.update.mockResolvedValue({ ...activeKwh, value: '2.50' });

      const out = await service.setKwhPrice(2.5, 'user1');
      expect(prisma.systemSettings.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ value: '2.5' }),
      }));
      expect(out.value).toBe(2.5);
    });
  });

  describe('getKwhPriceHistory', () => {
    it('returns list of settings', async () => {
      prisma.systemSettings.findMany.mockResolvedValue([activeKwh]);
      const hist = await service.getKwhPriceHistory();
      expect(hist[0].value).toBe(0.90);
    });
  });

  // --- fio b percentage tests ---
  describe('getCurrentFioBPercentage', () => {
    it('defaults to 0 when unset', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(null);
      const r = await service.getCurrentFioBPercentage();
      expect(r).toBe(0);
    });

    it('returns parsed value when set', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(activeFio);
      const r = await service.getCurrentFioBPercentage();
      expect(r).toBe(33.3);
    });
  });

  describe('setFioBPercentage', () => {
    it('rejects out of range', async () => {
      await expect(service.setFioBPercentage(-1, 'u')).rejects.toThrow(BadRequestException);
      await expect(service.setFioBPercentage(101, 'u')).rejects.toThrow(BadRequestException);
    });

    it('creates new when missing', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(null);
      prisma.systemSettings.create.mockResolvedValue(activeFio);
      const out = await service.setFioBPercentage(10, 'u');
      expect(prisma.systemSettings.create).toHaveBeenCalled();
      expect(out.value).toBe(33.3); // returned object is from mocked record
    });

    it('updates when exists', async () => {
      prisma.systemSettings.findFirst.mockResolvedValue(activeFio);
      prisma.systemSettings.update.mockResolvedValue({ ...activeFio, value: '50' });
      const out = await service.setFioBPercentage(50, 'u');
      expect(prisma.systemSettings.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ value: '50' }),
      }));
      expect(out.value).toBe(50);
    });
  });

  describe('getFioBPercentageHistory', () => {
    it('returns list', async () => {
      prisma.systemSettings.findMany.mockResolvedValue([activeFio]);
      const hist = await service.getFioBPercentageHistory();
      expect(hist[0].value).toBe(33.3);
    });
  });

  describe('getSystemStats', () => {
    it('includes fio and kwh values', async () => {
      prisma.consumer.count.mockResolvedValue(1);
      prisma.representative.count.mockResolvedValue(2);
      prisma.commission.count.mockResolvedValue(3);
      prisma.commission.aggregate.mockResolvedValue({ _sum: { commissionValue: 100 } });
      jest.spyOn(service, 'getCurrentKwhPrice').mockResolvedValue(0.5);
      jest.spyOn(service, 'getCurrentFioBPercentage').mockResolvedValue(12.34);

      const stats = await service.getSystemStats();
      expect(stats.currentKwhPrice).toBe(0.5);
      expect(stats.currentFioBPercentage).toBe(12.34);
    });
  });
});
