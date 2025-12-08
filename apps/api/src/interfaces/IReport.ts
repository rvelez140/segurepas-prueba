import { IUser } from './IUser';
import { IVisit } from './IVisit';

export interface IReport {
  metadata: {
    type: 'resident' | 'guard' | 'general';
    startDate: Date;
    endDate: Date;
  };
  userInfo?: {
    name: string;
    email?: string;
    apartment?: string;
    telephone?: string;
    shift?: string;
  };
  statistics: {
    totalAuthorizations?: number;
    intervalAuthorizations?: number;
    totalEntries?: number;
    intervalEntries?: number;
    totalExits?: number;
    intervalExits?: number;
    averageVisitDuration?: string | number;
    mostFrequentEntryHour?: string;
    mostFrequentExitHour?: string;
    averageEntryHourGeneral?: string;
    averageExitHourGeneral?: string;
    totalResidents?: number;
    totalGuards?: number;
  };
  topRecords?: {
    mostActiveGuard?: { name: string; count: number };
    mostActiveResident?: { name: string; apartment: string; count: number };
    topResidents?: Array<{ name: string; apartment: string; count: number }>;
    topGuards?: Array<{ name: string; count: number }>;
    topVisits?: Array<{ name: string; document: string; count: number }>;
  };
  visits?: IVisit[];
}
