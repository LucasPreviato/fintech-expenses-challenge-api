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

  it('blocks cross-user access on legacy routes that accepted user id in the URL', async () => {
    const attackerRegisterResponse = await registerUser(context.app, {
      name: 'Attacker User',
      email: 'attacker@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    }).expect(201);

    const victimRegisterResponse = await registerUser(context.app, {
      name: 'Victim User',
      email: 'victim@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    }).expect(201);

    const attackerAccessToken = attackerRegisterResponse.body
      .accessToken as string;
    const victimUserId = victimRegisterResponse.body.user.id as string;

    await request(context.app.getHttpServer())
      .get(`/users/${victimUserId}`)
      .set('Authorization', authHeader(attackerAccessToken))
      .expect(404);

    await request(context.app.getHttpServer())
      .patch(`/users/${victimUserId}`)
      .set('Authorization', authHeader(attackerAccessToken))
      .send({
        name: 'Compromised Victim',
      })
      .expect(404);

    await request(context.app.getHttpServer())
      .delete(`/users/${victimUserId}`)
      .set('Authorization', authHeader(attackerAccessToken))
      .expect(404);

    const victimProfileResponse = await request(context.app.getHttpServer())
      .get('/users/me')
      .set(
        'Authorization',
        authHeader(victimRegisterResponse.body.accessToken as string),
      )
      .expect(200);

    expect(victimProfileResponse.body.name).toBe('Victim User');
    expect(victimProfileResponse.body.email).toBe('victim@example.com');
    expect(victimProfileResponse.body.deletedAt).toBeNull();
  });

  it('updates the password when confirmPassword matches', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Update User',
      email: 'update@example.com',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
    }).expect(201);

    const accessToken = registerResponse.body.accessToken as string;

    const updateResponse = await request(context.app.getHttpServer())
      .patch('/users/me')
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

    const accessToken = registerResponse.body.accessToken as string;

    const response = await request(context.app.getHttpServer())
      .patch('/users/me')
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

    const accessToken = registerResponse.body.accessToken as string;

    const response = await request(context.app.getHttpServer())
      .patch('/users/me')
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
