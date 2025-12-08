import { z } from 'zod';

// Schema para estado de pago
export const paymentStatusSchema = z.enum(['pending', 'completed', 'failed', 'refunded']);

// Schema para métodos de pago
export const paymentMethodSchema = z.enum(['card', 'cash', 'transfer', 'stripe']);

// Schema para crear un pago
export const createPaymentSchema = z.object({
  amount: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  description: z.string().min(1, { message: 'La descripción es requerida' }),
  method: paymentMethodSchema,
  apartment: z.string().min(1, { message: 'El apartamento es requerido' }),
  dueDate: z.string().datetime({ message: 'Fecha de vencimiento inválida' }).or(z.date()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema para actualizar un pago
export const updatePaymentSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  status: paymentStatusSchema.optional(),
  method: paymentMethodSchema.optional(),
  paidAt: z.string().datetime().or(z.date()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema para procesar un pago con Stripe
export const processStripePaymentSchema = z.object({
  paymentMethodId: z.string().min(1, { message: 'El método de pago es requerido' }),
  amount: z.number().positive({ message: 'El monto debe ser mayor a 0' }),
  currency: z.string().length(3, { message: 'Código de moneda inválido' }).default('usd'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// Schema para búsqueda de pagos
export const searchPaymentsSchema = z.object({
  apartment: z.string().optional(),
  status: paymentStatusSchema.optional(),
  method: paymentMethodSchema.optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Types derivados de los schemas
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type ProcessStripePaymentInput = z.infer<typeof processStripePaymentSchema>;
export type SearchPaymentsInput = z.infer<typeof searchPaymentsSchema>;
