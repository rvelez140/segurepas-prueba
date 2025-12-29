import { z } from 'zod';
import { emailSchema, passwordSchema } from './common.schema';

/**
 * Esquemas de validación para autenticación
 */

// Schema para login
export const loginSchema = z.object({
  email: z.string().min(1, 'Email o nombre de usuario requerido'),
  password: z.string().min(1, 'Contraseña requerida'),
  twoFactorToken: z.string().length(6).optional(),
  deviceName: z.string().max(100).optional()
});

// Schema para registro de usuario
export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['residente', 'guardia', 'admin']),

  // Campos condicionales para residente
  apartment: z.string().optional(),
  tel: z.string().optional(),
  document: z.string().optional(),
  vehiclePlate: z.string().optional(),

  // Campos condicionales para guardia
  shift: z.enum(['mañana', 'tarde', 'noche']).optional()
}).refine(
  (data) => {
    if (data.role === 'residente') {
      return !!(data.apartment && data.tel && data.document && data.vehiclePlate);
    }
    return true;
  },
  {
    message: 'Campos de residente requeridos: apartment, tel, document, vehiclePlate',
    path: ['role']
  }
).refine(
  (data) => {
    if (data.role === 'guardia') {
      return !!data.shift;
    }
    return true;
  },
  {
    message: 'Turno (shift) es requerido para guardias',
    path: ['shift']
  }
);

// Schema para cambio de contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Schema para recuperación de contraseña
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

// Schema para reset de contraseña
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});

// Schema para activación de 2FA
export const enable2FASchema = z.object({
  password: z.string().min(1, 'Contraseña requerida')
});

// Schema para verificación de 2FA
export const verify2FASchema = z.object({
  token: z.string().length(6, 'El token debe tener 6 dígitos')
});

// Tipos TypeScript derivados
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Verify2FAInput = z.infer<typeof verify2FASchema>;
