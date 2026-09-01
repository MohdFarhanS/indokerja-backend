import { AppError } from './appError';

describe('AppError', () => {
  it('preserves an approved operational status and message', () => {
    const error = new AppError(400, 'Invalid request');

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Invalid request');
  });
});
