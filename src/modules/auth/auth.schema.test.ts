import { UserRole } from '@prisma/client';
import { loginSchema, registerSchema } from './auth.schema';

describe('auth schemas', () => {
  it('normalizes a valid Job Seeker registration', () => {
    const result = registerSchema.parse({
      name: '  Budi Santoso  ',
      email: '  BUDI@Example.COM ',
      password: 'Example123!',
      role: UserRole.JOB_SEEKER,
    });

    expect(result).toMatchObject({ name: 'Budi Santoso', email: 'budi@example.com' });
  });

  it('accepts a Company registration and rejects inappropriate fields', () => {
    expect(
      registerSchema.safeParse({
        companyName: 'PT Example',
        email: 'company@example.com',
        password: 'Example123!',
        role: UserRole.COMPANY,
        companyDescription: 'Description',
      }).success,
    ).toBe(true);

    expect(
      registerSchema.safeParse({
        name: 'Wrong field',
        companyName: 'PT Example',
        email: 'company@example.com',
        password: 'Example123!',
        role: UserRole.COMPANY,
      }).success,
    ).toBe(false);
  });

  it('rejects invalid roles, emails, short passwords, and extra fields', () => {
    expect(
      registerSchema.safeParse({
        name: 'Budi',
        email: 'invalid',
        password: 'short',
        role: 'ADMIN',
        passwordHash: 'client-controlled',
      }).success,
    ).toBe(false);
  });

  it('validates and normalizes login input', () => {
    expect(loginSchema.parse({ email: ' USER@EXAMPLE.COM ', password: 'Example123!' }).email).toBe(
      'user@example.com',
    );
    expect(loginSchema.safeParse({ email: 'bad', password: 'Example123!' }).success).toBe(false);
  });

  it('enforces bcrypt password limits using UTF-8 bytes', () => {
    const registration = (password: string) => ({
      name: 'Budi',
      email: 'budi@example.com',
      password,
      role: UserRole.JOB_SEEKER,
    });

    expect(registerSchema.safeParse(registration('Example123!')).success).toBe(true);
    expect(registerSchema.safeParse(registration('short')).success).toBe(false);
    expect(registerSchema.safeParse(registration('a'.repeat(73))).success).toBe(false);
    expect(registerSchema.safeParse(registration('é'.repeat(40))).success).toBe(false);
  });
});
