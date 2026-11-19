import request from 'supertest';
import { createApp } from '../app';

const app = createApp();

const uniqueEmail = () => `user-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.com`;

describe('Authentication API', () => {
  it('registers a new account and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test Athlete',
        email: uniqueEmail(),
        password: 'StrongPass1',
        confirmPassword: 'StrongPass1',
        dateOfBirth: '1995-04-12',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBeDefined();
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(JSON.stringify(res.body.data.user)).not.toContain('password');
  });

  it('rejects duplicate registration with 409', async () => {
    const email = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Alpha Athlete', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' })
      .expect(201);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Beta Athlete', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' });
    expect(res.status).toBe(409);
  });

  it('rejects mismatched passwords with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Alpha Athlete', email: uniqueEmail(), password: 'StrongPass1', confirmPassword: 'Other1234' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    const email = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Login Test', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' })
      .expect(201);

    const ok = await request(app).post('/api/auth/login').send({ email, password: 'StrongPass1' });
    expect(ok.status).toBe(200);
    expect(ok.body.data.accessToken).toBeDefined();

    const bad = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass1' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('refreshes tokens with rotation and rejects reused tokens', async () => {
    const email = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Refresh Test', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' })
      .expect(201);
    const login = await request(app).post('/api/auth/login').send({ email, password: 'StrongPass1' });
    const refreshToken = login.body.data.refreshToken as string;

    const r1 = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(r1.status).toBe(200);
    expect(r1.body.data.refreshToken).not.toBe(refreshToken);

    const reuse = await request(app).post('/api/auth/refresh').send({ refreshToken });
    expect(reuse.status).toBe(401);
  });

  it('supports forgot/reset password flow in development', async () => {
    const email = uniqueEmail();
    await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Reset Test', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' })
      .expect(201);

    const forgot = await request(app).post('/api/auth/forgot-password').send({ email });
    expect(forgot.status).toBe(200);
    const token = forgot.body.data.devResetToken;
    expect(token).toBeDefined();

    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: 'NewPass123', confirmPassword: 'NewPass123' });
    expect(reset.status).toBe(200);

    await request(app).post('/api/auth/login').send({ email, password: 'NewPass123' }).expect(200);
    await request(app).post('/api/auth/login').send({ email, password: 'StrongPass1' }).expect(401);
  });
});

describe('Protected routes', () => {
  it('rejects missing token with 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('rejects malformed token with 401', async () => {
    const res = await request(app).get('/api/users/me').set('Authorization', 'Bearer not-a-token');
    expect(res.status).toBe(401);
  });

  it('returns current user with valid token', async () => {
    const email = uniqueEmail();
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Me Test', email, password: 'StrongPass1', confirmPassword: 'StrongPass1' });
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${reg.body.data.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(email);
    expect(res.body.data.profile).toBeTruthy();
  });
});
