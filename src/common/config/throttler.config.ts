import { Injectable } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModuleOptions } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }
}

export const throttlerConfig = (): ThrottlerModuleOptions => [
  {
    name: "global",
    ttl: 60 * 1000, // 1 minute
    limit: process.env.NODE_ENV === "production" ? 5000 : 10000, // Aumentado para uso interno
  },
  {
    name: "auth",
    ttl: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Aumentado para funcionários internos
  },
  {
    name: "upload",
    ttl: 60 * 60 * 1000, // 1 hour
    limit: 500, // Aumentado para 500 uploads por hora
  },
];
