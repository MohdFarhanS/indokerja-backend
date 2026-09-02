import request from 'supertest';
import app from './app';

describe('app request parsing', () => {
  it('trusts exactly one Vercel proxy hop for requester IP handling', () => {
    expect(app.get('trust proxy')).toBe(1);
  });

  it('returns a sanitized 400 response for malformed JSON', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Invalid JSON payload' });
    expect(JSON.stringify(response.body)).not.toMatch(
      /SyntaxError|stack|body-parser|node_modules/i,
    );
  });
});
