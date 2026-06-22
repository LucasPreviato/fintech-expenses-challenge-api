type EnvConfig = Record<string, string | undefined>;

function assertString(env: EnvConfig, key: string): string {
  const value = env[key];

  if (!value || value.trim().length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function assertPositiveNumber(
  env: EnvConfig,
  key: string,
  defaultValue: number,
): number {
  const value = env[key];

  if (value === undefined || value.trim().length === 0) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`${key} must be a positive number.`);
  }

  return parsedValue;
}

function assertJwtExpiresIn(env: EnvConfig, key: string, defaultValue: string): string {
  const value = env[key] ?? defaultValue;

  if (!/^\d+[smhd]$/.test(value)) {
    throw new Error(`${key} must match the pattern <number><s|m|h|d>.`);
  }

  return value;
}

export function validateEnv(env: EnvConfig): EnvConfig {
  assertPositiveNumber(env, 'PORT', 3333);
  assertString(env, 'DATABASE_URL');
  assertString(env, 'JWT_SECRET');
  assertJwtExpiresIn(env, 'JWT_EXPIRES_IN', '15m');
  assertPositiveNumber(env, 'PRISMA_POOL_MAX', 10);
  assertPositiveNumber(env, 'PRISMA_CONNECTION_TIMEOUT_MS', 5000);
  assertPositiveNumber(env, 'PRISMA_IDLE_TIMEOUT_MS', 300000);

  return env;
}
