import { PrismaService } from '../../config/prisma.service';
import { CreateGeneratorDto } from './dto/create-generator.dto';
import { UpdateGeneratorDto } from './dto/update-generator.dto';
export declare class GeneratorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createGeneratorDto: CreateGeneratorDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateGeneratorDto: UpdateGeneratorDto): Promise<any>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getByState(state: string): Promise<any[]>;
    getBySourceType(sourceType: string): Promise<any[]>;
    getStatistics(): Promise<{
        total: number;
        underAnalysis: number;
        awaitingAllocation: number;
        totalInstalledPower: number;
        totalAllocatedCapacity: number;
        availableCapacity: number;
        allocationRate: number;
        distributionByState: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.GeneratorGroupByOutputType, "state"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                installedPower: number | null;
            };
        })[];
        distributionBySourceType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.GeneratorGroupByOutputType, "sourceType"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                installedPower: number | null;
            };
        })[];
    }>;
    private calculateAllocationPercentages;
}
