import { Document, Types } from "mongoose";

export enum RecurrencePattern {
  DAILY = "daily",
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  CUSTOM = "custom",
}

export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 0,
}

export interface IRecurringVisitInput {
  visit: {
    name: string;
    email: string;
    document: string;
    vehiclePlate?: string;
  };
  resident: Types.ObjectId;
  pattern: RecurrencePattern;
  daysOfWeek?: DayOfWeek[]; // Para weekly/biweekly
  dayOfMonth?: number; // Para monthly (1-31)
  customDates?: Date[]; // Para custom
  startDate: Date;
  endDate?: Date; // Opcional, si no se especifica, no expira
  timeWindow?: {
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  reason?: string;
  notes?: string;
  isActive: boolean;
}

export interface IRecurringVisit extends IRecurringVisitInput, Document {
  _id: Types.ObjectId;
  lastGenerated?: Date; // Última vez que se generó una visita
  nextGeneration?: Date; // Próxima fecha programada
  generatedCount: number; // Cuántas visitas se han generado
  createdAt: Date;
  updatedAt: Date;
}
