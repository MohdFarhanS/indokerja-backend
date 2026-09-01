import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody } from './validateRequest';

describe('validateBody', () => {
  it('returns documented field errors at the top level', () => {
    const request = { body: { email: 'invalid' } } as Request;
    const response = { status: jest.fn(), json: jest.fn() };
    response.status.mockReturnValue(response);
    const next: NextFunction = jest.fn();

    validateBody(z.object({ email: z.string().email() }))(
      request,
      response as unknown as Response,
      next,
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: { email: expect.any(Array) },
    });
    expect(response.json.mock.calls[0][0]).not.toHaveProperty('data');
    expect(next).not.toHaveBeenCalled();
  });
});
