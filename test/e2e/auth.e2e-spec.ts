/// <reference types="jest" />
import { E2eTestContext, closeE2eTestContext, createE2eTestContext } from './helpers/app-e2e.helper';
import { clearDatabase } from './helpers/database-e2e.helper';
import { loginUser, registerUser } from './helpers/auth-e2e.helper';

describe('Auth (e2e)', () => {
  let context: E2eTestContext;

  beforeEach(async () => {
    context = await createE2eTestContext();
    await clearDatabase(context.prisma);
  });

  afterEach(async () => {
    await closeE2eTestContext(context);
  });

  it('registers a user successfully', async () => {
    const response = await registerUser(context.app, {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'StrongPass123',
    });

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('alice@example.com');
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('rejects duplicated email registration', async () => {
    await registerUser(context.app, {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'StrongPass123',
    }).expect(201);

    const response = await registerUser(context.app, {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'StrongPass123',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('User with this email already exists.');
  });

  it('logs in successfully with valid credentials', async () => {
    await registerUser(context.app, {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'StrongPass123',
    }).expect(201);

    const response = await loginUser(
      context.app,
      'alice@example.com',
      'StrongPass123',
    );

    expect(response.status).toBe(201);
    expect(response.body.accessToken).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('alice@example.com');
  });

  it('rejects login with invalid password', async () => {
    await registerUser(context.app, {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: 'StrongPass123',
    }).expect(201);

    const response = await loginUser(
      context.app,
      'alice@example.com',
      'WrongPass123',
    );

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid email or password.');
  });
});
