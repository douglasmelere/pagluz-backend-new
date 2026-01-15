import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { PrismaService } from "../../config/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaService: PrismaService,
  ) {}

  @SkipThrottle()
  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        try {
          await this.prismaService.$queryRaw`SELECT 1`;
          return {
            database: {
              status: "up",
            },
          };
        } catch (error) {
          return {
            database: {
              status: "down",
              error: error.message,
            },
          };
        }
      },
    ]);
  }

  @SkipThrottle()
  @Get("ready")
  @HealthCheck()
  async readiness() {
    return this.health.check([
      async () => {
        try {
          await this.prismaService.$queryRaw`SELECT 1`;
          return {
            database: {
              status: "up",
            },
          };
        } catch (error) {
          return {
            database: {
              status: "down",
              error: error.message,
            },
          };
        }
      },
    ]);
  }

  @SkipThrottle()
  @Get("live")
  liveness() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
