import { Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/appError';
import { LoginInput, RegisterInput } from './auth.schema';

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const dummyPasswordHash = '$2b$12$UCALPYWahhUgnx1pVThEuO2qea4IZ9mjwLunQicBA2GdyQ9XRfWPG';

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) throw new AppError(409, 'Email is already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    if (input.role === UserRole.JOB_SEEKER) {
      return await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: input.role,
        },
        select: safeUserSelect,
      });
    }

    return await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          name: input.companyName,
          email: input.email,
          passwordHash,
          role: input.role,
        },
        select: safeUserSelect,
      });

      await transaction.company.create({
        data: {
          userId: user.id,
          name: input.companyName,
          description: input.companyDescription,
        },
      });

      return user;
    });
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(409, 'Email is already registered');
    }
    throw error;
  }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const passwordMatches = await bcrypt.compare(
    input.password,
    user?.passwordHash ?? dummyPasswordHash,
  );

  if (!user || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  const options: SignOptions = {
    algorithm: 'HS256',
    expiresIn: env.JWT_EXPIRES_IN,
    subject: user.id,
  };
  const accessToken = jwt.sign({ role: user.role }, env.JWT_SECRET, options);

  return {
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: safeUserSelect });
  if (!user) throw new AppError(401, 'Authenticated user no longer exists');
  return user;
}
