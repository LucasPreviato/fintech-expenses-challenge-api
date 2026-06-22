/// <reference types="jest" />
import request from 'supertest';
import {
  E2eTestContext,
  closeE2eTestContext,
  createE2eTestContext,
} from './helpers/app-e2e.helper';
import { authHeader, registerUser } from './helpers/auth-e2e.helper';
import { clearDatabase } from './helpers/database-e2e.helper';

describe('Users (e2e)', () => {
  let context: E2eTestContext;

  beforeEach(async () => {
    context = await createE2eTestContext();
    await clearDatabase(context.prisma);
  });

  afterEach(async () => {
    await closeE2eTestContext(context);
  });

  it('updates the password when confirmPassword matches', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Update User',
      email: 'update@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    }).expect(201);

    const userId = registerResponse.body.user.id as string;
    const accessToken = registerResponse.body.accessToken as string;

    const updateResponse = await request(context.app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', authHeader(accessToken))
      .send({
        password: 'Demo@654321',
        confirmPassword: 'Demo@654321',
      });

    expect(updateResponse.status).toBe(200);

    const loginResponse = await request(context.app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'update@example.com',
        password: 'Demo@654321',
      });

    expect(loginResponse.status).toBe(201);
    expect(loginResponse.body.user.email).toBe('update@example.com');
  });

  it('rejects password update when confirmPassword is missing', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Update User',
      email: 'update@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    }).expect(201);

    const userId = registerResponse.body.user.id as string;
    const accessToken = registerResponse.body.accessToken as string;

    const response = await request(context.app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', authHeader(accessToken))
      .send({
        password: 'Demo@654321',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      'confirmPassword is required when password is provided',
    );
  });

  it('rejects password update when confirmPassword does not match', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Update User',
      email: 'update@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    }).expect(201);

    const userId = registerResponse.body.user.id as string;
    const accessToken = registerResponse.body.accessToken as string;

    const response = await request(context.app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', authHeader(accessToken))
      .send({
        password: 'Demo@654321',
        confirmPassword: 'Demo@111111',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      'password and confirmPassword must match',
    );
  });
});
