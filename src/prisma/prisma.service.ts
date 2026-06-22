import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.getOrThrow<string>('DATABASE_URL');
    const poolMax = Number(configService.get<string>('PRISMA_POOL_MAX', '10'));
    const connectionTimeoutMillis = Number(
      configService.get<string>('PRISMA_CONNECTION_TIMEOUT_MS', '5000'),
    );
    const idleTimeoutMillis = Number(
      configService.get<string>('PRISMA_IDLE_TIMEOUT_MS', '300000'),
    );

    super({
      adapter: new PrismaPg({
        connectionString,
        max: Number.isFinite(poolMax) ? poolMax : 10,
        connectionTimeoutMillis: Number.isFinite(connectionTimeoutMillis)
          ? connectionTimeoutMillis
          : 5_000,
        idleTimeoutMillis: Number.isFinite(idleTimeoutMillis)
          ? idleTimeoutMillis
          : 300_000,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
