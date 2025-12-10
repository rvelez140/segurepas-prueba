import { Request, Response, NextFunction } from 'express';
import { AuditLogService } from '../services/AuditLogService';
import { AuditAction, AuditSeverity } from '../interfaces/IAuditLog';

export const auditController = {
  /**
   * Obtener logs de auditoría con filtros
   */
  async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action, userId, startDate, endDate, severity, success, page, limit } = req.query;

      const result = await AuditLogService.getLogs({
        action: action as AuditAction,
        userId: userId as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        severity: severity as AuditSeverity,
        success: success === 'true' ? true : success === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener estadísticas de auditoría
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const stats = await AuditLogService.getStats(
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener logs de un usuario específico
   */
  async getUserLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { page, limit } = req.query;

      const result = await AuditLogService.getLogs({
        userId: userId as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener logs de acciones fallidas
   */
  async getFailedActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, startDate, endDate } = req.query;

      const result = await AuditLogService.getLogs({
        success: false,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Limpiar logs antiguos
   */
  async cleanOldLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { days } = req.query;
      const daysOld = days ? parseInt(days as string) : 90;

      const deletedCount = await AuditLogService.cleanOldLogs(daysOld);

      res.status(200).json({
        message: `Se eliminaron ${deletedCount} logs de auditoría`,
        deletedCount,
      });
    } catch (error) {
      next(error);
    }
  },
};
