import { z } from 'zod';

// Schema para roles de usuario
export const userRoleSchema = z.enum(['residente', 'guardia', 'admin']);

// Schema para turnos de guardia
export const guardShiftSchema = z.enum(['mañana', 'tarde', 'noche']);

// Schema base para autenticación
export const authSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

// Schema para login
export const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

// Schema para registro de residente
const residentRegistrationSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: z.literal('residente'),
  apartment: z.string().min(1, { message: 'El apartamento es requerido para residentes' }),
  tel: z.string().min(1, { message: 'El teléfono es requerido para residentes' }),
});

// Schema para registro de guardia
const guardRegistrationSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: z.literal('guardia'),
  shift: guardShiftSchema,
});

// Schema para registro de admin
const adminRegistrationSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
  role: z.literal('admin'),
});

// Schema unificado para registro (discriminated union)
export const registerSchema = z.discriminatedUnion('role', [
  residentRegistrationSchema,
  guardRegistrationSchema,
  adminRegistrationSchema,
]);

// Schema para actualización de perfil
export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  tel: z.string().optional(),
  apartment: z.string().optional(),
});

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'La contraseña actual es requerida' }),
  newPassword: z.string().min(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' }),
});

// Types derivados de los schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
