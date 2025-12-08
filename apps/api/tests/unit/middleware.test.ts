import { validate } from '../../src/middlewares/validationMiddleware';
import { createUserSchema } from '../../src/schemas/user.schema';
import { Request, Response, NextFunction } from 'express';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      query: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should call next() when data is valid', async () => {
    mockRequest.body = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'password123',
    };

    const middleware = validate(createUserSchema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should return 400 when data is invalid', async () => {
    mockRequest.body = {
      name: 'J',
      email: 'invalid-email',
      password: '123',
    };

    const middleware = validate(createUserSchema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Error de validación',
        errors: expect.any(Array),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should include detailed error messages', async () => {
    mockRequest.body = {
      name: 'J',
      email: 'juan@example.com',
      password: 'password123',
    };

    const middleware = validate(createUserSchema);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.any(String),
            message: expect.any(String),
          }),
        ]),
      })
    );
  });
});
