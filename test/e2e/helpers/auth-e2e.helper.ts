import { INestApplication } from '@nestjs/common';
import request, { type Test } from 'supertest';
import { buildUserPayload } from './factories-e2e.helper';

type RegisterUserInput = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export function registerUser(
  app: INestApplication,
  overrides: RegisterUserInput = {},
): Test {
  return request(app.getHttpServer())
    .post('/auth/register')
    .send(buildUserPayload(overrides));
}

export function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Test {
  return request(app.getHttpServer()).post('/auth/login').send({
    email,
    password,
  });
}

export function authHeader(accessToken: string): string {
  return `Bearer ${accessToken}`;
}
