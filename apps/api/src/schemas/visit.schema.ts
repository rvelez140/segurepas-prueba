import { z } from 'zod';

// Schema para estado de visita
export const visitStatusSchema = z.enum(['pendiente', 'activa', 'completada', 'cancelada']);

// Schema para tipo de visita
export const visitTypeSchema = z.enum(['visitante', 'proveedor', 'delivery', 'mantenimiento']);

// Schema para crear una visita
export const createVisitSchema = z.object({
  visitorName: z.string().min(1, { message: 'El nombre del visitante es requerido' }),
  visitorId: z.string().min(1, { message: 'La identificación del visitante es requerida' }),
  visitType: visitTypeSchema,
  apartment: z.string().min(1, { message: 'El apartamento es requerido' }),
  arrivalDate: z.string().datetime({ message: 'Fecha de llegada inválida' }).or(z.date()),
  exitDate: z.string().datetime({ message: 'Fecha de salida inválida' }).or(z.date()).optional(),
  photo: z.string().url({ message: 'URL de foto inválida' }).optional(),
  notes: z.string().optional(),
  qrCode: z.string().optional(),
});

// Schema para actualizar una visita
export const updateVisitSchema = z.object({
  visitorName: z.string().min(1).optional(),
  visitorId: z.string().min(1).optional(),
  visitType: visitTypeSchema.optional(),
  apartment: z.string().min(1).optional(),
  arrivalDate: z.string().datetime().or(z.date()).optional(),
  exitDate: z.string().datetime().or(z.date()).optional(),
  status: visitStatusSchema.optional(),
  photo: z.string().url().optional(),
  notes: z.string().optional(),
});

// Schema para autorizar/denegar visita
export const authorizeVisitSchema = z.object({
  authorized: z.boolean(),
  notes: z.string().optional(),
});

// Schema para registrar entrada/salida
export const checkInOutSchema = z.object({
  action: z.enum(['checkIn', 'checkOut']),
  timestamp: z.string().datetime().or(z.date()).optional(),
  notes: z.string().optional(),
});

// Schema para búsqueda de visitas
export const searchVisitsSchema = z.object({
  apartment: z.string().optional(),
  status: visitStatusSchema.optional(),
  visitType: visitTypeSchema.optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  visitorName: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Types derivados de los schemas
export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type AuthorizeVisitInput = z.infer<typeof authorizeVisitSchema>;
export type CheckInOutInput = z.infer<typeof checkInOutSchema>;
export type SearchVisitsInput = z.infer<typeof searchVisitsSchema>;
