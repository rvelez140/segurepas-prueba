import { createUserSchema, loginSchema } from '../../src/schemas/user.schema';
import { createVisitSchema } from '../../src/schemas/visit.schema';

describe('Validation Schemas - Zod', () => {
  describe('User Schema', () => {
    it('should validate a valid user creation request', async () => {
      const validData = {
        body: {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'password123',
          role: 'resident' as const,
        },
      };

      const result = await createUserSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        body: {
          name: 'Juan Pérez',
          email: 'invalid-email',
          password: 'password123',
        },
      };

      await expect(createUserSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject short password', async () => {
      const invalidData = {
        body: {
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: '123',
        },
      };

      await expect(createUserSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject short name', async () => {
      const invalidData = {
        body: {
          name: 'J',
          email: 'juan@example.com',
          password: 'password123',
        },
      };

      await expect(createUserSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('Login Schema', () => {
    it('should validate valid login credentials', async () => {
      const validData = {
        body: {
          email: 'juan@example.com',
          password: 'password123',
        },
      };

      const result = await loginSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });

    it('should reject empty password', async () => {
      const invalidData = {
        body: {
          email: 'juan@example.com',
          password: '',
        },
      };

      await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('Visit Schema', () => {
    it('should validate a valid visit creation request', async () => {
      const validData = {
        body: {
          visitorName: 'María García',
          visitorDocument: '12345678',
          residentId: '507f1f77bcf86cd799439011',
          visitReason: 'Visita social',
          vehiclePlate: 'ABC123',
        },
      };

      const result = await createVisitSchema.parseAsync(validData);
      expect(result).toEqual(validData);
    });

    it('should reject invalid resident ID format', async () => {
      const invalidData = {
        body: {
          visitorName: 'María García',
          visitorDocument: '12345678',
          residentId: 'invalid-id',
        },
      };

      await expect(createVisitSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject short visitor document', async () => {
      const invalidData = {
        body: {
          visitorName: 'María García',
          visitorDocument: '123',
          residentId: '507f1f77bcf86cd799439011',
        },
      };

      await expect(createVisitSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });
});
