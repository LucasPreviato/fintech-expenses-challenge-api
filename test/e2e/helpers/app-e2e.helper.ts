import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/prisma/prisma.service';

export type E2eTestContext = {
  app: INestApplication;
  prisma: PrismaService;
};

export async function createE2eTestContext(): Promise<E2eTestContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return {
    app,
    prisma: app.get(PrismaService),
  };
}

export async function closeE2eTestContext(
  context: E2eTestContext | undefined,
): Promise<void> {
  if (context) {
    await context.app.close();
  }
}
