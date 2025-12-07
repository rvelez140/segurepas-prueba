import { RecurringVisit } from "../models/RecurringVisit";
import {
  IRecurringVisit,
  IRecurringVisitInput,
  RecurrencePattern,
  DayOfWeek,
} from "../interfaces/IRecurringVisit";
import { VisitService } from "./VisitService";
import { IVisitInput } from "../interfaces/IVisit";
import { Types } from "mongoose";

export class RecurringVisitService {
  /**
   * Crear visita recurrente
   */
  static async create(data: IRecurringVisitInput): Promise<IRecurringVisit> {
    const nextGeneration = this.calculateNextGeneration(
      data.pattern,
      data.startDate,
      data.daysOfWeek,
      data.dayOfMonth
    );

    const recurringVisit = await RecurringVisit.create({
      ...data,
      nextGeneration,
      generatedCount: 0,
    });

    return recurringVisit.populate("resident", "name apartment");
  }

  /**
   * Obtener visitas recurrentes de un residente
   */
  static async getByResident(residentId: Types.ObjectId): Promise<IRecurringVisit[]> {
    return await RecurringVisit.find({ resident: residentId, isActive: true })
      .populate("resident", "name apartment")
      .sort({ createdAt: -1 });
  }

  /**
   * Obtener todas las visitas recurrentes activas
   */
  static async getAllActive(): Promise<IRecurringVisit[]> {
    return await RecurringVisit.find({ isActive: true })
      .populate("resident", "name apartment")
      .sort({ nextGeneration: 1 });
  }

  /**
   * Actualizar visita recurrente
   */
  static async update(
    id: Types.ObjectId,
    updates: Partial<IRecurringVisitInput>
  ): Promise<IRecurringVisit | null> {
    return await RecurringVisit.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("resident", "name apartment");
  }

  /**
   * Desactivar visita recurrente
   */
  static async deactivate(id: Types.ObjectId): Promise<IRecurringVisit | null> {
    return await RecurringVisit.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    ).populate("resident", "name apartment");
  }

  /**
   * Generar visitas automáticamente para las que están programadas
   */
  static async generateScheduledVisits(): Promise<{
    generated: number;
    errors: number;
  }> {
    const now = new Date();
    const scheduled = await RecurringVisit.find({
      isActive: true,
      nextGeneration: { $lte: now },
      $or: [{ endDate: { $exists: false } }, { endDate: { $gte: now } }],
    });

    let generated = 0;
    let errors = 0;

    for (const recurring of scheduled) {
      try {
        // Calcular fecha de expiración (próxima generación + 1 día)
        const nextGen = this.calculateNextGeneration(
          recurring.pattern,
          now,
          recurring.daysOfWeek,
          recurring.dayOfMonth
        );

        const expDate = new Date(nextGen);
        expDate.setDate(expDate.getDate() + 1);

        // Crear visita normal
        const visitData: IVisitInput = {
          visit: {
            name: recurring.visit.name,
            email: recurring.visit.email,
            document: recurring.visit.document,
            vehiclePlate: recurring.visit.vehiclePlate,
          },
          authorization: {
            resident: recurring.resident,
            state: "pendiente" as any,
            date: now,
            exp: expDate,
            reason: recurring.reason || "Visita recurrente programada",
          },
        };

        await VisitService.createVisit(visitData);

        // Actualizar recurring visit
        recurring.lastGenerated = now;
        recurring.nextGeneration = nextGen;
        recurring.generatedCount += 1;
        await recurring.save();

        generated++;
      } catch (error) {
        console.error("Error generando visita recurrente:", error);
        errors++;
      }
    }

    return { generated, errors };
  }

  /**
   * Calcular próxima fecha de generación
   */
  private static calculateNextGeneration(
    pattern: RecurrencePattern,
    fromDate: Date,
    daysOfWeek?: DayOfWeek[],
    dayOfMonth?: number
  ): Date {
    const next = new Date(fromDate);

    switch (pattern) {
      case RecurrencePattern.DAILY:
        next.setDate(next.getDate() + 1);
        break;

      case RecurrencePattern.WEEKLY:
        if (!daysOfWeek || daysOfWeek.length === 0) {
          next.setDate(next.getDate() + 7);
        } else {
          // Encontrar el próximo día de la semana
          const currentDay = next.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

          let nextDay = sortedDays.find((day) => day > currentDay);
          if (!nextDay) {
            nextDay = sortedDays[0];
            next.setDate(next.getDate() + (7 - currentDay + nextDay));
          } else {
            next.setDate(next.getDate() + (nextDay - currentDay));
          }
        }
        break;

      case RecurrencePattern.BIWEEKLY:
        if (!daysOfWeek || daysOfWeek.length === 0) {
          next.setDate(next.getDate() + 14);
        } else {
          const currentDay = next.getDay();
          const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

          let nextDay = sortedDays.find((day) => day > currentDay);
          if (!nextDay) {
            nextDay = sortedDays[0];
            next.setDate(next.getDate() + (14 - currentDay + nextDay));
          } else {
            // Si encontramos un día en esta semana, ir a la siguiente ocurrencia (2 semanas)
            next.setDate(next.getDate() + 14);
          }
        }
        break;

      case RecurrencePattern.MONTHLY:
        if (dayOfMonth) {
          next.setMonth(next.getMonth() + 1);
          next.setDate(dayOfMonth);
        } else {
          next.setMonth(next.getMonth() + 1);
        }
        break;

      case RecurrencePattern.CUSTOM:
        // Para custom, no calcular automáticamente
        next.setDate(next.getDate() + 1);
        break;
    }

    return next;
  }

  /**
   * Estadísticas
   */
  static async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byPattern: Record<string, number>;
    totalGenerated: number;
  }> {
    const [total, active, inactive, byPattern, totalGenerated] = await Promise.all([
      RecurringVisit.countDocuments(),
      RecurringVisit.countDocuments({ isActive: true }),
      RecurringVisit.countDocuments({ isActive: false }),
      RecurringVisit.aggregate([
        { $group: { _id: "$pattern", count: { $sum: 1 } } },
      ]),
      RecurringVisit.aggregate([
        { $group: { _id: null, total: { $sum: "$generatedCount" } } },
      ]),
    ]);

    return {
      total,
      active,
      inactive,
      byPattern: byPattern.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {}
      ),
      totalGenerated: totalGenerated[0]?.total || 0,
    };
  }
}
