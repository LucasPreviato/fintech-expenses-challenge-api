import { PrismaService } from '../../../src/prisma/prisma.service';

export async function clearDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
