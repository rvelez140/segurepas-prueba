import { Document, Types } from 'mongoose';

export enum GuardShift {
  MORNING = 'matutina',
  AFTERNOON = 'vespertina',
  NIGHT = 'nocturna'
}

interface IUserInput {
  auth: {
    email: string; // Email del usuario
    password: string; // Contraseña del usuario
  };
  name: string; // Nombre real del usuario
  registerDate: Date; // Fecha de registro del usuario
  updateDate: Date; // Fecha en la que se le realizó el último cambio
  googleId?: string; // ID de Google para OAuth
  microsoftId?: string; // ID de Microsoft para OAuth
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