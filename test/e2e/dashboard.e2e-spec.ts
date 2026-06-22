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

describe('Dashboard (e2e)', () => {
  let context: E2eTestContext;

  beforeEach(async () => {
    context = await createE2eTestContext();
    await clearDatabase(context.prisma);
  });

  afterEach(async () => {
    await closeE2eTestContext(context);
  });

  it('calculates balance, totals and top 3 expense categories from the API', async () => {
    const registerResponse = await registerUser(context.app, {
      name: 'Dashboard User',
      email: 'dashboard@example.com',
      password: 'StrongPass123',
    });
    const accessToken = registerResponse.body.accessToken as string;

    const officeCategory = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildCategoryPayload({
          name: 'Office',
        }),
      )
      .expect(201);
    const foodCategory = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildCategoryPayload({
          name: 'Food',
        }),
      )
      .expect(201);
    const travelCategory = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildCategoryPayload({
          name: 'Travel',
        }),
      )
      .expect(201);
    const salesCategory = await request(context.app.getHttpServer())
      .post('/categories')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildCategoryPayload({
          name: 'Sales',
        }),
      )
      .expect(201);

    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Customer contract',
          amount: '1000.00',
          date: '2026-06-01',
          type: 'INCOME',
          categoryId: salesCategory.body.id as string,
        }),
      )
      .expect(201);
    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Office supplies',
          amount: '300.00',
          date: '2026-06-03',
          type: 'EXPENSE',
          categoryId: officeCategory.body.id as string,
        }),
      )
      .expect(201);
    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Team lunch',
          amount: '200.00',
          date: '2026-06-04',
          type: 'EXPENSE',
          categoryId: foodCategory.body.id as string,
        }),
      )
      .expect(201);
    await request(context.app.getHttpServer())
      .post('/transactions')
      .set('Authorization', authHeader(accessToken))
      .send(
        buildTransactionPayload({
          description: 'Flight tickets',
          amount: '150.00',
          date: '2026-06-05',
          type: 'EXPENSE',
          categoryId: travelCategory.body.id as string,
        }),
      )
      .expect(201);

    const response = await request(context.app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', authHeader(accessToken))
      .query({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

    expect(response.status).toBe(200);
    expect(response.body.balance).toBe('350.00');
    expect(response.body.totalIncome).toBe('1000.00');
    expect(response.body.totalExpense).toBe('650.00');
    expect(response.body.topExpenseCategories).toEqual([
      {
        categoryId: officeCategory.body.id,
        categoryName: 'Office',
        totalAmount: '300.00',
      },
      {
        categoryId: foodCategory.body.id,
        categoryName: 'Food',
        totalAmount: '200.00',
      },
      {
        categoryId: travelCategory.body.id,
        categoryName: 'Travel',
        totalAmount: '150.00',
      },
    ]);
  });
});
