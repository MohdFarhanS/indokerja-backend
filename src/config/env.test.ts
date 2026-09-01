import { validateEnvironment } from './env';

const validEnvironment = {
  NODE_ENV: 'test',
  PORT: '4000',
  DATABASE_URL: 'postgresql://example.invalid/database',
  DIRECT_URL: 'postgresql://example.invalid/database',
  JWT_SECRET: 'x'.repeat(32),
  JWT_EXPIRES_IN: '1d',
  CORS_ORIGIN: 'http://localhost:5173',
};

describe('environment validation', () => {
  it.each(['15m', '1h', '1d', '7d', '250ms', '2w', '1y'])(
    'accepts the supported JWT duration %s',
    (duration) => {
      expect(
        validateEnvironment({ ...validEnvironment, JWT_EXPIRES_IN: duration }).JWT_EXPIRES_IN,
      ).toBe(duration);
    },
  );

  it.each(['banana', '0d', '-1h', '1 hour', '1D'])(
    'rejects invalid JWT duration %s',
    (duration) => {
      expect(() =>
        validateEnvironment({ ...validEnvironment, JWT_EXPIRES_IN: duration }),
      ).toThrow();
    },
  );

  it('requires a JWT secret of at least 32 UTF-8 bytes', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, JWT_SECRET: 'x'.repeat(31) }),
    ).toThrow();
    expect(
      validateEnvironment({ ...validEnvironment, JWT_SECRET: 'é'.repeat(16) }).JWT_SECRET,
    ).toHaveLength(16);
  });
});
