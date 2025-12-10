import { z } from 'zod';

export const createVisitSchema = z.object({
  body: z.object({
    visitorName: z.string().min(2, 'El nombre del visitante es requerido'),
    visitorDocument: z.string().min(5, 'El documento del visitante es requerido'),
    residentId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de residente inválido'),
    visitDate: z.string().datetime().optional(),
    visitReason: z.string().optional(),
    vehiclePlate: z.string().optional(),
  }),
});

export const updateVisitSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'completed']).optional(),
    exitDate: z.string().datetime().optional(),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID inválido'),
  }),
});

export const getVisitsByDateSchema = z.object({
  query: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
export type GetVisitsByDateInput = z.infer<typeof getVisitsByDateSchema>;
