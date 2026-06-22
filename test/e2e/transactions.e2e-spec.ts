/// <reference types="jest" />
import request from 'supertest';
import {
  E2eTestContext,
  closeE2eTestContext,
  createE2eTestContext,
} from './helpers/app-e2e.helper';
import { authHeader, registerUser } from './helpers/auth-e2e.helper';
import { clearDatabase } from './helpers/database-e2e.helper';
import {
  buildCategoryPayload,
  buildTransactionPayload,
} from './helpers/factories-e2e.helper';

describe('Transactions (e2e)', () => {
  let context: E2eTestContext;

  beforeEach(async () => {
    context = await createE2eTestContext();
    await clearDatabase(context.prisma);
  });

  afterEach(async () => {
    await closeE2eTestContext(context);
  });

  it('creates a transaction with an owned category', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Carol Jones',
      email: 'carol@example.com',
      password: 'StrongPass123',
    });
    const accessToken = registerResponse.body.accessToken as string;

    const categoryResponse = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildCategoryPayload({
          name: 'Suppliers',
        }),
      );

    const response = await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Invoice payment',
          amount: '250.75',
          date: '2026-03-15',
          type: 'EXPENSE',
          categoryId: categoryResponse.body.id as string,
        }),
      );

    expect(response.status).toBe(201);
    expect(response.body.type).toBe('EXPENSE');
    expect(response.body.amount).toBe('250.75');
    expect(response.body.category.id).toBe(categoryResponse.body.id);
  });

  it("does not create a transaction with another user's category", async () => {
    const ownerResponse = await registerUser(context.app, {
      name: 'Owner User',
      email: 'owner@example.com',
      password: 'StrongPass123',
    });
    const intruderResponse = await registerUser(context.app, {
      name: 'Intruder User',
      email: 'intruder@example.com',
      password: 'StrongPass123',
    });

    const ownerCategoryResponse = await request(context.app.getHttpServer())
      .post('/categories')
      .set(
        'Authorization',
        authHeader(ownerResponse.body.accessToken as string),
      )
      .send(
        buildCategoryPayload({
          name: 'Private Category',
        }),
      );

    const response = await request(context.app.getHttpServer())
      .post('/transactions')
      .set(
        'Authorization',
        authHeader(intruderResponse.body.accessToken as string),
      )
      .send(
        buildTransactionPayload({
          description: 'Unauthorized expense',
          amount: '99.99',
          date: '2026-04-10',
          type: 'EXPENSE',
          categoryId: ownerCategoryResponse.body.id as string,
        }),
      );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      `Category with id "${ownerCategoryResponse.body.id as string}" not found.`,
    );
  });

  it('lists transactions with pagination and type/date filters', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Filter User',
      email: 'filters@example.com',
      password: 'StrongPass123',
    });
    const accessToken = registerResponse.body.accessToken as string;

    const categoryResponse = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildCategoryPayload({
          name: 'Operations',
        }),
      );
    const categoryId = categoryResponse.body.id as string;

    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Office rent',
          amount: '1200.00',
          date: '2026-01-10',
          type: 'EXPENSE',
          categoryId,
        }),
      )
      .expect(201);
    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Cloud subscription',
          amount: '300.00',
          date: '2026-01-18',
          type: 'EXPENSE',
          categoryId,
        }),
      )
      .expect(201);
    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Client payment',
          amount: '2500.00',
          date: '2026-01-20',
          type: 'INCOME',
          categoryId,
        }),
      )
      .expect(201);
    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'February office rent',
          amount: '1200.00',
          date: '2026-02-10',
          type: 'EXPENSE',
          categoryId,
        }),
      )
      .expect(201);

    const response = await request(context.app.getHttpServer())
      .get('/transactions')
      .set('Authorization', authHeader(accessToken))
      .query({
        type: 'EXPENSE',
        page: 1,
        perPage: 10,
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.meta.total).toBe(2);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.perPage).toBe(10);
    expect(
      response.body.data.map((item: { description: string }) => item.description),
    ).toEqual(['Cloud subscription', 'Office rent']);
  });
});
