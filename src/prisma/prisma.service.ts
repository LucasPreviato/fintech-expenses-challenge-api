import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL nao foi definida no ambiente.');
    }

    const poolMax = Number(process.env.PRISMA_POOL_MAX ?? 10);
    const connectionTimeoutMillis = Number(
      process.env.PRISMA_CONNECTION_TIMEOUT_MS ?? 5_000,
    );
    const idleTimeoutMillis = Number(
      process.env.PRISMA_IDLE_TIMEOUT_MS ?? 300_000,
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
