type RegisterUserInput = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type CreateCategoryInput = {
  name?: string;
  description?: string;
};

type CreateTransactionInput = {
  description?: string;
  amount?: string;
  date?: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
};

let sequence = 0;

function nextSequence(): number {
  sequence += 1;

  return sequence;
}

export function buildUserPayload(overrides: RegisterUserInput = {}) {
  const currentSequence = nextSequence();
  const password = overrides.password ?? 'Demo@123456';
  const hasConfirmPasswordOverride = Object.prototype.hasOwnProperty.call(
    overrides,
    'confirmPassword',
  );

  return {
    name: overrides.name ?? `Test User ${currentSequence}`,
    email: overrides.email ?? `user${currentSequence}@example.com`,
    password,
    ...(hasConfirmPasswordOverride
      ? { confirmPassword: overrides.confirmPassword }
      : { confirmPassword: password }),
  };
}

export function buildCategoryPayload(overrides: CreateCategoryInput = {}) {
  const currentSequence = nextSequence();

  return {
    name: overrides.name ?? `Category ${currentSequence}`,
    ...(overrides.description !== undefined
      ? { description: overrides.description }
      : {}),
  };
}

export function buildTransactionPayload(
  overrides: CreateTransactionInput = {},
) {
  const currentSequence = nextSequence();

  return {
    description: overrides.description ?? `Transaction ${currentSequence}`,
    amount: overrides.amount ?? '100.00',
    date: overrides.date ?? '2026-01-01',
    type: overrides.type ?? 'EXPENSE',
    categoryId: overrides.categoryId ?? '',
  };
}
