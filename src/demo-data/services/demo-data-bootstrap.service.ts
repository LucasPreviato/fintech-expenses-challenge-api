import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  buildDemoTransactions,
  CATEGORY_DEFINITIONS,
  DEMO_USER,
  toCategoryNameMap,
} from '../lib/demo-data.factory';

@Injectable()
export class DemoDataBootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoDataBootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
      this.logger.log(
        'Bootstrap de dados demo ignorado durante a execucao de testes.',
      );
      return;
    }

    const existingDemoUser = await this.prisma.user.findFirst({
      where: {
        email: DEMO_USER.email,
      },
      select: {
        id: true,
      },
    });

    if (existingDemoUser) {
      this.logger.log(
        `Usuario demo ${DEMO_USER.email} ja existe. Aplicacao iniciada sem recriar a massa demo.`,
      );
      return;
    }

    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: DEMO_USER.name,
        email: DEMO_USER.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const categories = await Promise.all(
      CATEGORY_DEFINITIONS.map((categoryDefinition) =>
        this.prisma.category.create({
          data: {
            userId: user.id,
            name: categoryDefinition.name,
            description: categoryDefinition.description,
          },
          select: {
            id: true,
            name: true,
          },
        }),
      ),
    );

    const transactions = buildDemoTransactions(
      user.id,
      toCategoryNameMap(categories),
    );

    await this.prisma.transaction.createMany({
      data: transactions,
    });

    this.logger.log(
      `Usuario demo ${user.email} criado com ${categories.length} categorias e ${transactions.length} movimentacoes.`,
    );
  }
}
