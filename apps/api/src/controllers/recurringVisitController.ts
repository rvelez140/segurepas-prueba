import { Request, Response, NextFunction } from 'express';
import { RecurringVisitService } from '../services/RecurringVisitService';
import { RecurrencePattern } from '../interfaces/IRecurringVisit';

export const recurringVisitController = {
  /**
   * Crear visita recurrente
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const data = {
        ...req.body,
        resident: user.role === 'residente' ? user._id : req.body.resident,
      };

      const recurringVisit = await RecurringVisitService.create(data);

      res.status(201).json({
        message: 'Visita recurrente creada exitosamente',
        data: recurringVisit,
      });
    } catch (error: any) {
      next(error);
    }
  },

  /**
   * Obtener visitas recurrentes del residente autenticado
   */
  async getMyRecurring(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      const visits = await RecurringVisitService.getByResident(user._id);

      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener visitas recurrentes de un residente específico (admin)
   */
  async getByResident(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { residentId } = req.params;
      const visits = await RecurringVisitService.getByResident(residentId as any);

      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener todas las visitas recurrentes activas (admin)
   */
  async getAllActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const visits = await RecurringVisitService.getAllActive();
      res.status(200).json(visits);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar visita recurrente
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await RecurringVisitService.update(id as any, updates);

      if (!updated) {
        res.status(404).json({ error: 'Visita recurrente no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Visita recurrente actualizada',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Desactivar visita recurrente
   */
  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deactivated = await RecurringVisitService.deactivate(id as any);

      if (!deactivated) {
        res.status(404).json({ error: 'Visita recurrente no encontrada' });
        return;
      }

      res.status(200).json({
        message: 'Visita recurrente desactivada',
        data: deactivated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generar visitas programadas manualmente (admin)
   */
  async generateNow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await RecurringVisitService.generateScheduledVisits();

      res.status(200).json({
        message: 'Generación completada',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Estadísticas
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await RecurringVisitService.getStats();
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },
};
