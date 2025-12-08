import { IReport } from '../interfaces/IReport';
import { Guard, IUser, Resident } from '../interfaces/IUser';
import { IVisit } from '../interfaces/IVisit';
import User from '../models/User';
import Visit from '../models/Visit';
import { UserService } from './UserService';

export class ReportService {
  static async generateReport(
    start: Date,
    end?: Date,
    resident?: IUser | null,
    guard?: IUser | null
  ): Promise<IReport> {
    const endDate = end || new Date();

    if (resident && guard) {
      throw new Error('No se puede especificar ambos residente y guardia para generar un reporte');
    }

    if (resident) {
      return this.generateResidentReport(resident, start, endDate);
    }

    if (guard) {
      return this.generateGuardReport(guard, start, endDate);
    }

    return this.generateGeneralReport(start, endDate);
  }

  /* Reporte de Residente */
  private static async generateResidentReport(
    resident: IUser,
    start: Date,
    end: Date
  ): Promise<IReport> {
    const allVisits = await Visit.find({
      'authorization.resident': resident._id,
    })
      .populate('authorization.resident', 'name apartment')
      .populate('registry.entry.guard', 'name')
      .populate('registry.exit.guard', 'name');

    const intervalVisits = allVisits.filter(
      (visit) => visit.authorization.date >= start && visit.authorization.date <= end
    );

    // Calcular duracion de visitas para visitas completadas
    const durations = intervalVisits
      .filter((v) => v.registry?.entry?.date && v.registry?.exit?.date)
      .map((v) => {
        const entry = v.registry?.entry?.date as Date;
        const exit = v.registry?.exit?.date as Date;
        return exit.getTime() - entry.getTime();
      });

    const averageDuration =
      durations.length > 0
        ? this.formatDuration(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    // Calculo de horas de entrada/salida mas frecuentes
    const entryHours = this.calculateMostFrequentHour(
      intervalVisits
        .filter((v) => v.registry?.entry?.date)
        .map((v) => v.registry?.entry?.date as Date)
    );
    const exitHours = this.calculateMostFrequentHour(
      intervalVisits
        .filter((v) => v.registry?.exit?.date)
        .map((v) => v.registry?.exit?.date as Date)
    );

    // Guardia mas activo para el residente
    const guardCounts = new Map<string, number>();
    intervalVisits.forEach((v) => {
      if (v.registry?.entry?.guard) {
        const guardId = v.registry.entry.guard._id.toString();
        guardCounts.set(guardId, (guardCounts.get(guardId) || 0) + 1);
      }
      if (v.registry?.exit?.guard) {
        const guardId = v.registry.exit.guard._id.toString();
        guardCounts.set(guardId, (guardCounts.get(guardId) || 0) + 1);
      }
    });

    let mostActiveGuard = null;
    if (guardCounts.size > 0) {
      const [maxGuardId, maxCount] = [...guardCounts.entries()].reduce((max, entry) =>
        entry[1] > max[1] ? entry : max
      );
      const guard = await UserService.findById(maxGuardId);
      mostActiveGuard = guard ? { name: guard.name, count: maxCount } : null;
    }

    // Top 3 visitas mas frecuentes por su documento
    const visitCounts = new Map<string, { count: number; visit: IVisit }>();
    intervalVisits.forEach((v) => {
      const key = v.visit.document;
      const current = visitCounts.get(key) || { count: 0, visit: v };
      visitCounts.set(key, { count: current.count + 1, visit: v });
    });

    const topVisits = [...visitCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([_, data]) => ({
        name: data.visit.visit.name,
        document: data.visit.visit.document,
        count: data.count,
      }));

    return {
      metadata: {
        type: 'resident',
        startDate: start,
        endDate: end,
      },
      userInfo: {
        name: resident.name,
        apartment: resident.role === 'residente' ? resident.apartment : undefined,
        telephone: resident.role === 'residente' ? resident.tel : undefined,
      },
      statistics: {
        totalAuthorizations: allVisits.length,
        intervalAuthorizations: intervalVisits.length,
        averageVisitDuration: averageDuration,
        mostFrequentEntryHour: entryHours,
        mostFrequentExitHour: exitHours,
      },
      topRecords: {
        mostActiveGuard: mostActiveGuard ? mostActiveGuard : undefined,
        topVisits,
      },
    };
  }

  /* Reporte de Guardia */
  private static async generateGuardReport(guard: IUser, start: Date, end: Date): Promise<IReport> {
    const allVisits = await Visit.find({
      $or: [{ 'registry.entry.guard': guard._id }, { 'registry.exit.guard': guard._id }],
    })
      .populate('authorization.resident', 'name apartment')
      .populate('registry.entry.guard', 'name')
      .populate('registry.exit.guard', 'name');

    const intervalVisits = allVisits.filter((visit) => {
      const entryDate = visit.registry?.entry?.date;
      const exitDate = visit.registry?.exit?.date;
      return (
        (entryDate && entryDate >= start && entryDate <= end) ||
        (exitDate && exitDate >= start && exitDate <= end)
      );
    });

    const entryVisits = intervalVisits.filter(
      (v) => v.registry?.entry?.guard?._id.toString() === guard._id.toString()
    );
    const exitVisits = intervalVisits.filter(
      (v) => v.registry?.exit?.guard?._id.toString() === guard._id.toString()
    );

    // Calculo de hora de entrada/salida mas frecuentes
    const entryHours = this.calculateMostFrequentHour(
      entryVisits.map((v) => v.registry?.entry?.date as Date)
    );
    const exitHours = this.calculateMostFrequentHour(
      exitVisits.map((v) => v.registry?.exit?.date as Date)
    );

    // Residente mas activo para este guardia
    const residentCounts = new Map<string, number>();
    intervalVisits.forEach((v) => {
      if (v.authorization.resident) {
        const residentId = v.authorization.resident._id.toString();
        residentCounts.set(residentId, (residentCounts.get(residentId) || 0) + 1);
      }
    });

    let mostActiveResident = null;
    if (residentCounts.size > 0) {
      const [maxResidentId, maxCount] = [...residentCounts.entries()].reduce((max, entry) =>
        entry[1] > max[1] ? entry : max
      );
      const resident = await UserService.findById(maxResidentId);
      if (resident && resident.role === 'residente') {
        mostActiveResident = {
          name: resident.name,
          apartment: resident.apartment,
          count: maxCount,
        };
      }
    }

    // Top 3 visitas mas frecuentes por su documento
    const visitCounts = new Map<string, { count: number; visit: IVisit }>();
    intervalVisits.forEach((v) => {
      const key = v.visit.document;
      const current = visitCounts.get(key) || { count: 0, visit: v };
      visitCounts.set(key, { count: current.count + 1, visit: v });
    });

    const topVisits = [...visitCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([_, data]) => ({
        name: data.visit.visit.name,
        document: data.visit.visit.document,
        count: data.count,
      }));

    return {
      metadata: {
        type: 'guard',
        startDate: start,
        endDate: end,
      },
      userInfo: {
        name: guard.name,
        email: guard.auth.email,
        shift: guard.role === 'guardia' ? guard.shift : undefined,
      },
      statistics: {
        totalEntries: allVisits.filter(
          (v) => v.registry?.entry?.guard?._id.toString() === guard._id.toString()
        ).length,
        intervalEntries: entryVisits.length,
        totalExits: allVisits.filter(
          (v) => v.registry?.exit?.guard?._id.toString() === guard._id.toString()
        ).length,
        intervalExits: exitVisits.length,
        mostFrequentEntryHour: entryHours,
        mostFrequentExitHour: exitHours,
      },
      topRecords: {
        mostActiveResident: mostActiveResident ? mostActiveResident : undefined,
        topVisits,
      },
    };
  }

  /* Reporte General */
  private static async generateGeneralReport(start: Date, end: Date): Promise<IReport> {
    // Todas las visitas en el rango proporcionado
    const allResidents = await User.find({ role: 'residente' });
    const allGuards = await User.find({ role: 'guardia' });
    const intervalVisits = await Visit.find({
      'authorization.date': { $gte: start, $lte: end },
    })
      .populate('authorization.resident', 'name apartment')
      .populate('registry.entry.guard', 'name')
      .populate('registry.exit.guard', 'name');

    // Calcular hora promedio de entrada/salida
    const entryDates = intervalVisits
      .filter((v) => v.registry?.entry?.date)
      .map((v) => v.registry?.entry?.date);
    const exitDates = intervalVisits
      .filter((v) => v.registry?.exit?.date)
      .map((v) => v.registry?.exit?.date);

    const averageEntryHour = this.calculateMostFrequentHour(entryDates as Date[]);
    const averageExitHour = this.calculateMostFrequentHour(exitDates as Date[]);

    // Top 3 residente por cantidad de autorizaciones
    const residentCounts = new Map<string, { count: number; resident: Resident }>();

    intervalVisits.forEach((v) => {
      if (v.authorization.resident) {
        const residentId = v.authorization.resident._id.toString();
        const current = residentCounts.get(residentId) || { count: 0, resident: '' };
        residentCounts.set(residentId, {
          count: current.count + 1,
          resident: v.authorization.resident as unknown as Resident,
        });
      }
    });

    const topResidents = [...residentCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([_, data]) => ({
        name: data.resident.name,
        apartment: data.resident.apartment ? data.resident.apartment : 'N/A',
        count: data.count,
      }));

    // Top 3 guardias por cantidad de registros (entradas/salidas)
    const guardCounts = new Map<string, { count: number; guard: Guard }>();
    intervalVisits.forEach((v) => {
      if (v.registry?.entry?.guard) {
        const guardId = v.registry.entry.guard._id.toString();
        const current = guardCounts.get(guardId) || { count: 0, guard: null };
        guardCounts.set(guardId, {
          count: current.count + 1,
          guard: v.registry.entry.guard as unknown as Guard,
        });
      }
      if (v.registry?.exit?.guard) {
        const guardId = v.registry.exit.guard._id.toString();
        const current = guardCounts.get(guardId) || { count: 0, guard: null };
        guardCounts.set(guardId, {
          count: current.count + 1,
          guard: v.registry.exit.guard as unknown as Guard,
        });
      }
    });

    const topGuards = [...guardCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([_, data]) => ({
        name: data.guard.name,
        count: data.count,
      }));

    // Top 5 visitas frecuentes por su documento
    const visitCounts = new Map<string, { count: number; visit: IVisit }>();
    intervalVisits.forEach((v) => {
      const key = v.visit.document;
      const current = visitCounts.get(key) || { count: 0, visit: v };
      visitCounts.set(key, { count: current.count + 1, visit: v });
    });

    const topVisits = [...visitCounts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([_, data]) => ({
        name: data.visit.visit.name,
        document: data.visit.visit.document,
        count: data.count,
      }));

    return {
      metadata: {
        type: 'general',
        startDate: start,
        endDate: end,
      },
      statistics: {
        totalResidents: allResidents.length,
        totalGuards: allGuards.length,
        averageEntryHourGeneral: averageEntryHour,
        averageExitHourGeneral: averageExitHour,
      },
      topRecords: {
        topResidents,
        topGuards,
        topVisits,
      },
    };
  }

  // Funcion para calcular la hora mas frecuente
  public static calculateMostFrequentHour(dates: Date[]): string {
    if (!dates || dates.length === 0) return 'N/A';

    const hourCounts = new Map<number, number>();
    dates.forEach((date) => {
      const hour = date.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });

    const [mostFrequentHour] = [...hourCounts.entries()].reduce((max, entry) =>
      entry[1] > max[1] ? entry : max
    );

    return `${mostFrequentHour}:00 - ${mostFrequentHour + 1}:00`;
  }

  public static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formattedHours = hours > 0 ? `${hours}h ` : '';
    const formattedMinutes = minutes % 60 > 0 ? `${minutes % 60}m ` : '';
    const formattedSeconds = seconds % 60 > 0 ? `${seconds % 60}s` : '';

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`.trim() || '0s';
  }
}
