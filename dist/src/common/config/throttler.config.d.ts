import { ThrottlerGuard, ThrottlerModuleOptions } from "@nestjs/throttler";
export declare class CustomThrottlerGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): Promise<string>;
}
export declare const throttlerConfig: () => ThrottlerModuleOptions;
