import { Document, Types } from 'mongoose';
import { IModuleConfig } from './IFeatures';

export interface ICompanyInput {
  name: string; // Nombre de la empresa/organización
  subdomain: string; // Subdominio único para acceder (ej: empresa1.securepass.com)
  logo?: string; // URL del logo de la empresa (almacenado en Cloudinary)
  settings: {
    primaryColor?: string; // Color primario del tema
    secondaryColor?: string; // Color secundario del tema
    allowedDomains?: string[]; // Dominios de email permitidos (@empresa.com)
  };
  contact: {
    email: string; // Email de contacto de la empresa
    phone?: string; // Teléfono de contacto
    address?: string; // Dirección física
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise'; // Plan de suscripción
    maxUsers: number; // Número máximo de usuarios permitidos
    maxResidents: number; // Número máximo de residentes
    startDate: Date; // Fecha de inicio de la suscripción
    endDate?: Date; // Fecha de fin de la suscripción (si aplica)
    isActive: boolean; // Estado de la suscripción
  };
  features?: {
    modules: IModuleConfig[]; // Módulos/servicios habilitados para esta empresa
    customModules?: {
      name: string;
      enabled: boolean;
      settings?: any;
    }[];
  };
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de actualización
}

export interface ICompany extends ICompanyInput, Document {
  _id: Types.ObjectId; // ID de la empresa
}
