/// <reference types="jest" />
import request from 'supertest';
import {
  E2eTestContext,
  closeE2eTestContext,
  createE2eTestContext,
} from './helpers/app-e2e.helper';
import { registerUser } from './helpers/auth-e2e.helper';
import { clearDatabase } from './helpers/database-e2e.helper';
import { buildCategoryPayload } from './helpers/factories-e2e.helper';

describe('Categories (e2e)', () => {
  let context: E2eTestContext;

  beforeEach(async () => {
    context = await createE2eTestContext();
    await clearDatabase(context.prisma);
  });

  afterEach(async () => {
    await closeE2eTestContext(context);
  });

  it('creates a category for an authenticated user', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    });

    const response = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken as string}`)
      .send(
        buildCategoryPayload({
          name: 'Office',
          description: 'Office related expenses',
        }),
      );

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Office');
    expect(response.body.description).toBe('Office related expenses');
  });

  it('does not list categories without a token', async () => {
    const response = await request(context.app.getHttpServer()).get('/categories');

    expect(response.status).toBe(401);
  });
});
