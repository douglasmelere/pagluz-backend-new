import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../../config/prisma.service';
export interface RepresentativeJwtPayload {
    sub: string;
    email: string;
    role: string;
    name: string;
}
declare const RepresentativeJwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class RepresentativeJwtStrategy extends RepresentativeJwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: RepresentativeJwtPayload): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        status: "ACTIVE";
        specializations: string[];
        city: string;
        state: string;
    }>;
}
export {};
