import { TransactionType } from '../../../generated/prisma/client';

export const DEMO_USER = {
  name: 'Membro Demo',
  email: 'demo@fintech.local',
  password: 'Demo@123456',
} as const;

export const TOTAL_TRANSACTIONS = 300;
export const SALARY_AMOUNT = '8500.00';
export const SALARY_DAY = 5;
export const MONTH_WINDOW = 12;

export const CATEGORY_DEFINITIONS = [
  {
    name: 'Salário',
    description: 'Entrada mensal fixa do membro demo.',
  },
  {
    name: 'Freelance',
    description: 'Receitas extras ocasionais para variar os periodos.',
  },
  {
    name: 'Alimentação',
    description: 'Mercado, restaurantes e pequenas compras do dia a dia.',
  },
  {
    name: 'Transporte',
    description: 'Combustivel, app de mobilidade e deslocamentos recorrentes.',
  },
  {
    name: 'Moradia',
    description: 'Aluguel, condominio e contas estruturais da casa.',
  },
  {
    name: 'Saúde',
    description: 'Consultas, farmacia e custos de bem-estar.',
  },
  {
    name: 'Lazer',
    description: 'Cinema, bares, streaming especial e programas sociais.',
  },
  {
    name: 'Assinaturas',
    description: 'Ferramentas, streaming e servicos recorrentes.',
  },
  {
    name: 'Compras',
    description: 'Compras de ticket medio e itens pontuais.',
  },
  {
    name: 'Educação',
    description: 'Cursos, livros e treinamentos ao longo do ano.',
  },
  {
    name: 'Impostos e Taxas',
    description: 'Tarifas bancarias, impostos e pequenas cobrancas fixas.',
  },
  {
    name: 'Reserva/Investimento',
    description: 'Aportes mensais para reserva financeira.',
  },
] as const;

const FREELANCE_MONTHS = new Set([0, 1, 3, 4, 6, 7, 8, 9, 10, 11]);
const EDUCATION_MONTHS = new Set([0, 1, 3, 4, 6, 7, 9, 10]);

const FOOD_DESCRIPTIONS = [
  'Mercado do mes',
  'Almoco de trabalho',
  'Padaria',
  'Jantar com amigos',
  'Feira da semana',
  'Cafe e snacks',
  'Delivery da noite',
  'Reposicao da despensa',
] as const;

const TRANSPORT_DESCRIPTIONS = [
  'Uber para reuniao',
  'Abastecimento',
  'Estacionamento',
  'Bilhete de transporte',
  'Corrida para compromisso',
] as const;

const LEISURE_DESCRIPTIONS = [
  'Cinema e jantar',
  'Happy hour',
  'Passeio de fim de semana',
] as const;

const PURCHASE_DESCRIPTIONS = ['Compra planejada', 'Item para casa'] as const;

const MONTH_NAMES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
] as const;

export type CategoryName = (typeof CATEGORY_DEFINITIONS)[number]['name'];

export type DemoTransactionSeedInput = {
  amount: string;
  categoryId: string;
  date: Date;
  description: string;
  type: TransactionType;
  userId: string;
};

export type DemoCategoryRecord = {
  id: string;
  name: string;
};

function mulberry32(seed: number) {
  let value = seed >>> 0;

  return function next() {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ (value >>> 15), value | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function amountFromRange(
  random: () => number,
  min: number,
  max: number,
): string {
  const value = min + random() * (max - min);
  return value.toFixed(2);
}

function buildMonthStarts(): Date[] {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  return Array.from({ length: MONTH_WINDOW }, (_, index) => {
    const month = new Date(currentMonthStart);
    month.setUTCMonth(
      currentMonthStart.getUTCMonth() - (MONTH_WINDOW - 1 - index),
    );
    return month;
  });
}

function createMonthDate(
  monthStart: Date,
  day: number,
  hour: number,
  minute: number,
): Date {
  const lastDay = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const safeDay = Math.min(day, lastDay);

  return new Date(
    Date.UTC(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth(),
      safeDay,
      hour,
      minute,
      0,
      0,
    ),
  );
}

function pushTransaction(
  collection: DemoTransactionSeedInput[],
  transaction: DemoTransactionSeedInput,
) {
  collection.push(transaction);
}

function requireCategoryId(
  categoriesByName: Map<CategoryName, string>,
  categoryName: CategoryName,
): string {
  const categoryId = categoriesByName.get(categoryName);

  if (!categoryId) {
    throw new Error(`Categoria "${categoryName}" nao foi criada no seed.`);
  }

  return categoryId;
}

export function toCategoryNameMap(
  categories: DemoCategoryRecord[],
): Map<CategoryName, string> {
  return new Map(
    categories.map((category) => [category.name as CategoryName, category.id]),
  );
}

export function buildDemoTransactions(
  userId: string,
  categoriesByName: Map<CategoryName, string>,
): DemoTransactionSeedInput[] {
  const transactions: DemoTransactionSeedInput[] = [];
  const monthStarts = buildMonthStarts();

  monthStarts.forEach((monthStart, monthIndex) => {
    const random = mulberry32((monthIndex + 1) * 7919);
    const monthLabel = MONTH_NAMES[monthStart.getUTCMonth()];

    pushTransaction(transactions, {
      userId,
      categoryId: requireCategoryId(categoriesByName, 'Salário'),
      type: TransactionType.INCOME,
      amount: SALARY_AMOUNT,
      date: createMonthDate(monthStart, SALARY_DAY, 9, 0),
      description: `Salario mensal ${monthLabel}/${monthStart.getUTCFullYear()}`,
    });

    pushTransaction(transactions, {
      userId,
      categoryId: requireCategoryId(categoriesByName, 'Moradia'),
      type: TransactionType.EXPENSE,
      amount: amountFromRange(random, 2350, 2680),
      date: createMonthDate(monthStart, 8, 10, 15),
      description: `Moradia ${monthLabel}/${monthStart.getUTCFullYear()}`,
    });

    pushTransaction(transactions, {
      userId,
      categoryId: requireCategoryId(categoriesByName, 'Assinaturas'),
      type: TransactionType.EXPENSE,
      amount: amountFromRange(random, 180, 320),
      date: createMonthDate(monthStart, 12, 8, 30),
      description: `Assinaturas digitais ${monthLabel}/${monthStart.getUTCFullYear()}`,
    });

    pushTransaction(transactions, {
      userId,
      categoryId: requireCategoryId(categoriesByName, 'Reserva/Investimento'),
      type: TransactionType.EXPENSE,
      amount: amountFromRange(random, 950, 1350),
      date: createMonthDate(monthStart, 6, 7, 45),
      description: `Aporte mensal ${monthLabel}/${monthStart.getUTCFullYear()}`,
    });

    if (FREELANCE_MONTHS.has(monthIndex)) {
      pushTransaction(transactions, {
        userId,
        categoryId: requireCategoryId(categoriesByName, 'Freelance'),
        type: TransactionType.INCOME,
        amount: amountFromRange(random, 950, 3200),
        date: createMonthDate(
          monthStart,
          14 + Math.floor(random() * 10),
          14,
          Math.floor(random() * 50),
        ),
        description: `Projeto freelance ${monthLabel}/${monthStart.getUTCFullYear()}`,
      });
    }

    for (let index = 0; index < 8; index += 1) {
      pushTransaction(transactions, {
        userId,
        categoryId: requireCategoryId(categoriesByName, 'Alimentação'),
        type: TransactionType.EXPENSE,
        amount: amountFromRange(random, 24, 145),
        date: createMonthDate(
          monthStart,
          2 + index * 3 + Math.floor(random() * 2),
          12 + (index % 4),
          Math.floor(random() * 55),
        ),
        description: `${FOOD_DESCRIPTIONS[index]} ${monthLabel}/${monthStart.getUTCFullYear()}`,
      });
    }

    for (let index = 0; index < 5; index += 1) {
      pushTransaction(transactions, {
        userId,
        categoryId: requireCategoryId(categoriesByName, 'Transporte'),
        type: TransactionType.EXPENSE,
        amount: amountFromRange(random, 14, 88),
        date: createMonthDate(
          monthStart,
          3 + index * 5 + Math.floor(random() * 2),
          9 + index,
          Math.floor(random() * 55),
        ),
        description: `${TRANSPORT_DESCRIPTIONS[index]} ${monthLabel}/${monthStart.getUTCFullYear()}`,
      });
    }

    for (let index = 0; index < 3; index += 1) {
      pushTransaction(transactions, {
        userId,
        categoryId: requireCategoryId(categoriesByName, 'Lazer'),
        type: TransactionType.EXPENSE,
        amount: amountFromRange(random, 48, 310),
        date: createMonthDate(
          monthStart,
          9 + index * 6 + Math.floor(random() * 3),
          19,
          Math.floor(random() * 55),
        ),
        description: `${LEISURE_DESCRIPTIONS[index]} ${monthLabel}/${monthStart.getUTCFullYear()}`,
      });
    }

    for (
      let index = 0;
      index < (monthIndex % 2 === 0 ? 2 : 1);
      index += 1
    ) {
      pushTransaction(transactions, {
        userId,
        categoryId: requireCategoryId(categoriesByName, 'Compras'),
        type: TransactionType.EXPENSE,
        amount: amountFromRange(random, 120, 980),
        date: createMonthDate(
          monthStart,
          11 + index * 9 + Math.floor(random() * 4),
          16,
          Math.floor(random() * 55),
        ),
        description: `${PURCHASE_DESCRIPTIONS[index]} ${monthLabel}/${monthStart.getUTCFullYear()}`,
      });
    }

    pushTransaction(transactions, {
      userId,
      categoryId: requireCategoryId(categoriesByName, 'Saúde'),
      type: TransactionType.EXPENSE,
      amount: amountFromRange(random, 65, 290),
      date: createMonthDate(
        monthStart,
        18 + Math.floor(random() * 4),
        11,
        Math.floor(random() * 55),
      ),
      description: `Cuidados com saude ${monthLabel}/${monthStart.getUTCFullYear()}`,
    });

    if (EDUCATION_MONTHS.has(monthIndex)) {
      pushTransaction(transactions, {
        userId,
        categoryId: requireCategoryId(categoriesByName, 'Educação'),
        type: TransactionType.EXPENSE,
        amount: amountFromRange(random, 140, 680),
        date: createMonthDate(
          monthStart,
          22 + Math.floor(random() * 4),
          15,
          Math.floor(random() * 55),
        ),
        description: `Curso e aprendizado ${monthLabel}/${monthStart.getUTCFullYear()}`,
      });
    }

    pushTransaction(transactions, {
      userId,
      categoryId: requireCategoryId(categoriesByName, 'Impostos e Taxas'),
      type: TransactionType.EXPENSE,
      amount: amountFromRange(random, 18, 96),
      date: createMonthDate(
        monthStart,
        24 + Math.floor(random() * 3),
        10,
        Math.floor(random() * 55),
      ),
      description: `Taxas operacionais ${monthLabel}/${monthStart.getUTCFullYear()}`,
    });
  });

  if (transactions.length !== TOTAL_TRANSACTIONS) {
    throw new Error(
      `Seed gerou ${transactions.length} movimentacoes em vez de ${TOTAL_TRANSACTIONS}.`,
    );
  }

  return transactions.sort(
    (left, right) => left.date.getTime() - right.date.getTime(),
  );
}
