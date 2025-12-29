import { z } from 'zod';

/**
 * Esquemas de validación comunes reutilizables
 */

// Validación de ObjectId de MongoDB
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'ID de MongoDB inválido'
});

// Validación de email
export const emailSchema = z.string().email({
  message: 'Email inválido'
}).toLowerCase();

// Validación de contraseña fuerte
export const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

// Validación de teléfono internacional
export const phoneSchema = z.string().regex(/^\+\d{1,3}[-\s]?\d{1,4}([-\s]?\d+)*$/, {
  message: "Número de teléfono inválido (Ejemplo: '+1809-000-0000')"
});

// Validación de documento de identidad (11 dígitos)
export const documentSchema = z.string().regex(/^\d{11}$/, {
  message: 'El documento de identidad debe tener 11 dígitos'
});

// Validación de placa vehicular
export const vehiclePlateSchema = z.string().regex(/^[A-Z0-9-]{5,10}$/, {
  message: 'Placa vehicular inválida (Ejemplo: ABC-1234)'
});

// Validación de apartamento
export const apartmentSchema = z.string().regex(/^[A-Za-z]-\d{1,3}$/, {
  message: "Formato de Apartamento no válido (Ejemplo: 'A-1')"
});

// Validación de fecha
export const dateSchema = z.string().datetime({ message: 'Fecha inválida' })
  .or(z.date());

// Validación de URL
export const urlSchema = z.string().url({ message: 'URL inválida' });

// Validación de paginación
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Validación de query params con coerción
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Tipos TypeScript derivados de los esquemas
export type MongoId = z.infer<typeof mongoIdSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type Phone = z.infer<typeof phoneSchema>;
export type Document = z.infer<typeof documentSchema>;
export type VehiclePlate = z.infer<typeof vehiclePlateSchema>;
export type Apartment = z.infer<typeof apartmentSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
