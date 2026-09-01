import { UserRole } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { authenticate } from './authenticate';
import { authorize } from './authorize';

function responseMock() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  return response as unknown as Response;
}

function requestMock(authorization?: string): Request {
  return {
    header: jest.fn().mockReturnValue(authorization),
  } as unknown as Request;
}

describe('authenticate', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('accepts a valid HS256 token and exposes trusted identity', () => {
    const userId = '10000000-0000-4000-8000-000000000001';
    const token = jwt.sign({ role: UserRole.JOB_SEEKER }, env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: userId,
      expiresIn: '1h',
    });
    const request = requestMock(`Bearer ${token}`);

    authenticate(request, responseMock(), next);

    expect(request.auth).toEqual({ userId, role: UserRole.JOB_SEEKER });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, 'Basic token', 'Bearer', 'Bearer token extra'])(
    'rejects a missing or malformed Authorization header',
    (authorization) => {
      const response = responseMock();
      authenticate(requestMock(authorization), response, next);
      expect(response.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid and expired tokens', () => {
    const invalidResponse = responseMock();
    authenticate(requestMock('Bearer invalid'), invalidResponse, next);
    expect(invalidResponse.status).toHaveBeenCalledWith(401);

    const expired = jwt.sign({ role: UserRole.COMPANY }, env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: '10000000-0000-4000-8000-000000000001',
      expiresIn: -1,
    });
    const expiredResponse = responseMock();
    authenticate(requestMock(`Bearer ${expired}`), expiredResponse, next);
    expect(expiredResponse.status).toHaveBeenCalledWith(401);
  });

  it('rejects a correctly signed token without an expiration claim', () => {
    const token = jwt.sign({ role: UserRole.COMPANY }, env.JWT_SECRET, {
      algorithm: 'HS256',
      subject: '10000000-0000-4000-8000-000000000001',
    });
    const response = responseMock();

    authenticate(requestMock(`Bearer ${token}`), response, next);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('authorize', () => {
  const next: NextFunction = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it.each([UserRole.JOB_SEEKER, UserRole.COMPANY])('accepts the required role %s', (role) => {
    const request = requestMock();
    request.auth = { userId: 'user-id', role };
    authorize(role)(request, responseMock(), next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('returns 403 for the wrong role and 401 for an anonymous request', () => {
    const forbiddenRequest = requestMock();
    forbiddenRequest.auth = { userId: 'user-id', role: UserRole.JOB_SEEKER };
    const forbiddenResponse = responseMock();
    authorize(UserRole.COMPANY)(forbiddenRequest, forbiddenResponse, next);
    expect(forbiddenResponse.status).toHaveBeenCalledWith(403);

    const anonymousResponse = responseMock();
    authorize(UserRole.COMPANY)(requestMock(), anonymousResponse, next);
    expect(anonymousResponse.status).toHaveBeenCalledWith(401);
  });
});
