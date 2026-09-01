import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { getCurrentUser, login, register } from './auth.service';

jest.mock('../../config/prisma', () => ({
  prisma: {
    user: { findUnique: jest.fn(), create: jest.fn() },
    $transaction: jest.fn(),
  },
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const findUniqueMock = prisma.user.findUnique as unknown as jest.Mock;
const createUserMock = prisma.user.create as unknown as jest.Mock;
const transactionMock = prisma.$transaction as unknown as jest.Mock;
const hashMock = bcrypt.hash as unknown as jest.Mock;
const compareMock = bcrypt.compare as unknown as jest.Mock;
const signMock = jwt.sign as unknown as jest.Mock;

const safeUser = {
  id: '10000000-0000-4000-8000-000000000001',
  name: 'Budi',
  email: 'budi@example.com',
  role: UserRole.JOB_SEEKER,
};

describe('auth service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hashMock.mockResolvedValue('bcrypt-hash');
  });

  it('hashes a Job Seeker password and returns only safe fields', async () => {
    findUniqueMock.mockResolvedValue(null);
    createUserMock.mockResolvedValue(safeUser);

    const result = await register({
      name: 'Budi',
      email: 'budi@example.com',
      password: 'Example123!',
      role: UserRole.JOB_SEEKER,
    });

    expect(hashMock).toHaveBeenCalledWith('Example123!', 12);
    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: 'bcrypt-hash' }),
        select: { id: true, name: true, email: true, role: true },
      }),
    );
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('creates a Company user and profile in one transaction', async () => {
    findUniqueMock.mockResolvedValue(null);
    const transactionUserCreate = jest.fn().mockResolvedValue({
      ...safeUser,
      name: 'PT Example',
      role: UserRole.COMPANY,
    });
    const companyCreate = jest.fn().mockResolvedValue({});
    transactionMock.mockImplementation(async (operation) =>
      operation({ user: { create: transactionUserCreate }, company: { create: companyCreate } }),
    );

    await register({
      companyName: 'PT Example',
      companyDescription: 'Description',
      email: 'company@example.com',
      password: 'Example123!',
      role: UserRole.COMPANY,
    });

    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(companyCreate).toHaveBeenCalledWith({
      data: {
        userId: safeUser.id,
        name: 'PT Example',
        description: 'Description',
      },
    });
  });

  it('rejects duplicate email safely', async () => {
    findUniqueMock.mockResolvedValue(safeUser);

    await expect(
      register({
        name: 'Budi',
        email: 'budi@example.com',
        password: 'Example123!',
        role: UserRole.JOB_SEEKER,
      }),
    ).rejects.toEqual(new AppError(409, 'Email is already registered'));
  });

  it('translates a concurrent P2002 duplicate into a safe conflict', async () => {
    findUniqueMock.mockResolvedValue(null);
    createUserMock.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('raw database detail', {
        code: 'P2002',
        clientVersion: '6.19.3',
      }),
    );

    const result = register({
      name: 'Budi',
      email: 'budi@example.com',
      password: 'Example123!',
      role: UserRole.JOB_SEEKER,
    });

    await expect(result).rejects.toEqual(new AppError(409, 'Email is already registered'));
    await expect(result).rejects.not.toMatchObject({ message: 'raw database detail' });
  });

  it('uses the same login failure for an unknown email and wrong password', async () => {
    findUniqueMock.mockResolvedValueOnce(null).mockResolvedValueOnce({
      ...safeUser,
      passwordHash: 'bcrypt-hash',
    });
    compareMock.mockResolvedValue(false);

    const unknownEmail = login({ email: 'unknown@example.com', password: 'Example123!' });
    const wrongPassword = login({ email: safeUser.email, password: 'Wrong123!' });

    await expect(unknownEmail).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    });
    await expect(wrongPassword).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    });
  });

  it('returns a token and safe user for valid credentials', async () => {
    findUniqueMock.mockResolvedValue({ ...safeUser, passwordHash: 'bcrypt-hash' });
    compareMock.mockResolvedValue(true);
    signMock.mockReturnValue('access-token');

    const result = await login({ email: safeUser.email, password: 'Example123!' });

    expect(result).toEqual({ accessToken: 'access-token', user: safeUser });
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(signMock).toHaveBeenCalledWith(
      { role: UserRole.JOB_SEEKER },
      expect.any(String),
      expect.objectContaining({ algorithm: 'HS256', subject: safeUser.id }),
    );
  });

  it('retrieves a safe current user and rejects a deleted account', async () => {
    findUniqueMock.mockResolvedValueOnce(safeUser).mockResolvedValueOnce(null);
    await expect(getCurrentUser(safeUser.id)).resolves.toEqual(safeUser);
    await expect(getCurrentUser(safeUser.id)).rejects.toMatchObject({ statusCode: 401 });
  });
});
