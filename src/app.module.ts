import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthModule } from './auth/modules/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CategoriesModule } from './categories/modules/categories.module';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/modules/dashboard.module';
import { DemoDataModule } from './demo-data/modules/demo-data.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/modules/transactions.module';
import { UsersModule } from './users/modules/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    UsersModule,
    DemoDataModule,
    AuthModule,
    DashboardModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
