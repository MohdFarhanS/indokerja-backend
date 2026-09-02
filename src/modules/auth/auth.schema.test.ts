import { UserRole } from '@prisma/client';
import { loginSchema, registerSchema } from './auth.schema';

const jobSeekerRegistration = (password: string) => ({
  name: 'Budi',
  email: 'budi@example.com',
  password,
  role: UserRole.JOB_SEEKER,
});

const companyRegistration = (password: string) => ({
  companyName: 'PT Example',
  email: 'company@example.com',
  password,
  role: UserRole.COMPANY,
});

describe('auth schemas', () => {
  it('normalizes a valid Job Seeker registration', () => {
    const result = registerSchema.parse({
      name: '  Budi Santoso  ',
      email: '  BUDI@Example.COM ',
      password: 'IndoKerja#2026',
      role: UserRole.JOB_SEEKER,
    });

    expect(result).toMatchObject({ name: 'Budi Santoso', email: 'budi@example.com' });
  });

  it('accepts a Company registration and rejects inappropriate fields', () => {
    expect(registerSchema.safeParse(companyRegistration('IndoKerja#2026')).success).toBe(true);

    expect(
      registerSchema.safeParse({
        name: 'Wrong field',
        ...companyRegistration('IndoKerja#2026'),
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

  it('validates login without applying the registration password policy', () => {
    const result = loginSchema.parse({ email: ' USER@EXAMPLE.COM ', password: ' legacy ' });

    expect(result).toEqual({ email: 'user@example.com', password: ' legacy ' });
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'legacy' }).success).toBe(
      true,
    );
    expect(loginSchema.safeParse({ email: 'user@example.com', password: '' }).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: 'user@example.com', password: 'é'.repeat(37) }).success,
    ).toBe(false);
    expect(loginSchema.safeParse({ email: 'bad', password: 'legacy' }).success).toBe(false);
  });

  it.each([
    ['fewer than 12 characters', 'Abcdef1!'],
    ['no uppercase letter', 'indokerja#2026'],
    ['no lowercase letter', 'INDOKERJA#2026'],
    ['no digit', 'IndoKerja#Aman'],
    ['no symbol', 'IndoKerja2026'],
    ['whitespace instead of a symbol', 'IndoKerja 2026'],
  ])('rejects a registration password with %s', (_case, password) => {
    expect(registerSchema.safeParse(jobSeekerRegistration(password)).success).toBe(false);
  });

  it('applies the valid registration policy to both roles', () => {
    expect(registerSchema.safeParse(jobSeekerRegistration('IndoKerja#2026')).success).toBe(true);
    expect(registerSchema.safeParse(companyRegistration('IndoKerja#2026')).success).toBe(true);
  });

  it('preserves password whitespace without counting it as a symbol', () => {
    const password = ' IndoKerja#2026 ';
    const result = registerSchema.parse(jobSeekerRegistration(password));

    expect(result.password).toBe(password);
  });

  it('enforces the bcrypt limit using UTF-8 bytes without truncation', () => {
    const exactly72AsciiBytes = `A1!${'a'.repeat(69)}`;
    const over72MultibyteBytes = `A1!${'é'.repeat(35)}`;

    expect(Buffer.byteLength(exactly72AsciiBytes, 'utf8')).toBe(72);
    expect(registerSchema.safeParse(jobSeekerRegistration(exactly72AsciiBytes)).success).toBe(true);
    expect(over72MultibyteBytes.length).toBeLessThanOrEqual(72);
    expect(Buffer.byteLength(over72MultibyteBytes, 'utf8')).toBeGreaterThan(72);
    expect(registerSchema.safeParse(jobSeekerRegistration(over72MultibyteBytes)).success).toBe(
      false,
    );
    expect(registerSchema.safeParse(companyRegistration(over72MultibyteBytes)).success).toBe(false);
  });
});
