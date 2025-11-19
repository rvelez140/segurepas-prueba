import { Document, Types } from 'mongoose';

export enum GuardShift {
  MORNING = 'matutina',
  AFTERNOON = 'vespertina',
  NIGHT = 'nocturna'
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  PENDING_PAYMENT = 'pending_payment'
}

interface IUserInput {
  auth: {
    email: string; // Email del usuario
    password: string; // Contraseña del usuario
  };
  name: string; // Nombre real del usuario
  registerDate: Date; // Fecha de registro del usuario
  updateDate: Date; // Fecha en la que se le realizó el último cambio
  accountStatus?: AccountStatus; // Estado de la cuenta
  suspendedAt?: Date; // Fecha de suspensión
  suspensionReason?: string; // Razón de suspensión
  stripeCustomerId?: string; // ID del cliente en Stripe
  paymentDueDate?: Date; // Fecha límite de pago
  customBillingDate?: number; // Día del mes para facturación (1-31)
  pendingBalance?: number; // Saldo pendiente en centavos
}

interface BaseUser extends IUserInput, Document {
  _id: Types.ObjectId; // Id del usuario
  comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface Resident extends BaseUser {
  role: 'residente';
  apartment: string; // Apartamento del residente (ex: A-2)
  tel: string; // Teléfono del residente (ex: +18095559999)
}

export interface Guard extends BaseUser {
  role: 'guardia';
  shift: GuardShift; // Turno del guardia (ver enum)
}

export interface Admin extends BaseUser {
  role: 'admin';
  lastAccess: Date; // Fecha de último logout del admin (O vencimiento de Token)
}

export type IUser = Resident | Guard | Admin;