import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModuleOptions } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }
}

export const throttlerConfig = (): ThrottlerModuleOptions => [
  {
    name: 'global',
    ttl: 60 * 1000, // 1 minute
    limit: process.env.NODE_ENV === 'production' ? 100 : 1000,
  },
  {
    name: 'auth',
    ttl: 15 * 60 * 1000, // 15 minutes
    limit: 5, // 5 login attempts per 15 minutes
  },
  {
    name: 'upload',
    ttl: 60 * 60 * 1000, // 1 hour
    limit: 50, // 50 uploads per hour
  },
];
