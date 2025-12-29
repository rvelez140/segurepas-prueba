import { Document } from 'mongoose';

export enum SetupStatus {
  PENDING = 'pending',
  DATABASE_CONFIGURED = 'database_configured',
  COMPLETED = 'completed',
}

export interface IDatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  useDocker: boolean;
}

export interface ISetupConfig extends Document {
  status: SetupStatus;
  databaseConfigured: boolean;
  apisConfigured: boolean;
  adminCreated: boolean;
  temporaryAdminActive: boolean;
  databaseConfig: IDatabaseConfig;
  installedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISetupInput {
  database: IDatabaseConfig;
  apis?: {
    provider: string;
    fields: { key: string; value: string }[];
    isEnabled: boolean;
  }[];
}
