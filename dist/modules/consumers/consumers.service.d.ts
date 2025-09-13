import { PrismaService } from '../../config/prisma.service';
import { CreateConsumerDto } from './dto/create-consumer.dto';
import { UpdateConsumerDto } from './dto/update-consumer.dto';
export declare class ConsumersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createConsumerDto: CreateConsumerDto): Promise<{
        generator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cpfCnpj: string;
            ucNumber: string;
            concessionaire: string;
            city: string;
            state: string;
            status: import(".prisma/client").$Enums.GeneratorStatus;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
            observations: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    }>;
    createAsRepresentative(createConsumerDto: CreateConsumerDto, representativeId: string): Promise<{
        generator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cpfCnpj: string;
            ucNumber: string;
            concessionaire: string;
            city: string;
            state: string;
            status: import(".prisma/client").$Enums.GeneratorStatus;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
            observations: string | null;
        } | null;
        Representative: {
            email: string;
            name: string;
            id: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    }>;
    findAll(): Promise<({
        generator: {
            id: string;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        generator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cpfCnpj: string;
            ucNumber: string;
            concessionaire: string;
            city: string;
            state: string;
            status: import(".prisma/client").$Enums.GeneratorStatus;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
            observations: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    }>;
    findByCpfCnpj(cpfCnpj: string): Promise<({
        generator: {
            id: string;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    })[]>;
    findByRepresentative(representativeId: string): Promise<({
        generator: {
            id: string;
            status: import(".prisma/client").$Enums.GeneratorStatus;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
        } | null;
        Representative: {
            email: string;
            name: string;
            id: string;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    })[]>;
    update(id: string, updateConsumerDto: UpdateConsumerDto): Promise<{
        generator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cpfCnpj: string;
            ucNumber: string;
            concessionaire: string;
            city: string;
            state: string;
            status: import(".prisma/client").$Enums.GeneratorStatus;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
            observations: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    allocateToGenerator(consumerId: string, generatorId: string, percentage: number): Promise<{
        generator: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            cpfCnpj: string;
            ucNumber: string;
            concessionaire: string;
            city: string;
            state: string;
            status: import(".prisma/client").$Enums.GeneratorStatus;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
            installedPower: number;
            observations: string | null;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    }>;
    deallocate(consumerId: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    }>;
    getByState(state: string): Promise<({
        generator: {
            id: string;
            ownerName: string;
            sourceType: import(".prisma/client").$Enums.SourceType;
        } | null;
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        cpfCnpj: string;
        ucNumber: string;
        concessionaire: string;
        city: string;
        state: string;
        consumerType: import(".prisma/client").$Enums.ConsumerType;
        phase: import(".prisma/client").$Enums.PhaseType;
        averageMonthlyConsumption: number;
        discountOffered: number;
        status: import(".prisma/client").$Enums.ConsumerStatus;
        allocatedPercentage: number | null;
        generatorId: string | null;
        representativeId: string | null;
    })[]>;
    getStatistics(): Promise<{
        total: number;
        allocated: number;
        available: number;
        allocationRate: number;
        totalMonthlyConsumption: number;
        distributionByState: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ConsumerGroupByOutputType, "state"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
}
