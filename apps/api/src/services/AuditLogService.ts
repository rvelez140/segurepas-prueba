import { AuditLog } from "../models/AuditLog";
import {
  IAuditLog,
  IAuditLogInput,
  AuditAction,
  AuditSeverity,
} from "../interfaces/IAuditLog";
import { Request } from "express";
import { Types } from "mongoose";

export class AuditLogService {
  /**
   * Crea un nuevo registro de auditoría
   */
  static async log(data: IAuditLogInput): Promise<IAuditLog> {
    try {
      const auditLog = await AuditLog.create({
        ...data,
        timestamp: new Date(),
      });
      return auditLog;
    } catch (error) {
      console.error("Error creando log de auditoría:", error);
      // No lanzar error para no interrumpir el flujo principal
      throw error;
    }
  }

  /**
   * Helper para crear logs desde requests HTTP
   */
  static async logFromRequest(
    req: Request,
    action: AuditAction,
    data: Partial<IAuditLogInput>
  ): Promise<IAuditLog | null> {
    try {
      const user = (req as any).user;

      return await this.log({
        action,
        severity: data.severity || AuditSeverity.INFO,
        user: user?._id,
        userEmail: user?.auth?.email,
        ipAddress: this.getIpAddress(req),
        userAgent: req.get("user-agent"),
        resource: data.resource,
        resourceId: data.resourceId,
        details: data.details,
        success: data.success !== undefined ? data.success : true,
        errorMessage: data.errorMessage,
      });
    } catch (error) {
      console.error("Error logging from request:", error);
      return null;
    }
  }

  /**
   * Registrar login exitoso
   */
  static async logLoginSuccess(
    req: Request,
    userId: Types.ObjectId,
    email: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.LOGIN,
      severity: AuditSeverity.INFO,
      user: userId,
      userEmail: email,
      ipAddress: this.getIpAddress(req),
      userAgent: req.get("user-agent"),
      success: true,
    });
  }

  /**
   * Registrar login fallido
   */
  static async logLoginFailure(
    req: Request,
    email: string,
    reason: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.LOGIN_FAILED,
      severity: AuditSeverity.WARNING,
      userEmail: email,
      ipAddress: this.getIpAddress(req),
      userAgent: req.get("user-agent"),
      success: false,
      errorMessage: reason,
    });
  }

  /**
   * Registrar acceso no autorizado
   */
  static async logUnauthorizedAccess(
    req: Request,
    resource: string
  ): Promise<void> {
    await this.log({
      action: AuditAction.UNAUTHORIZED_ACCESS,
      severity: AuditSeverity.ERROR,
      ipAddress: this.getIpAddress(req),
      userAgent: req.get("user-agent"),
      resource,
      success: false,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
      },
    });
  }

  /**
   * Registrar exceso de rate limit
   */
  static async logRateLimitExceeded(req: Request): Promise<void> {
    await this.log({
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      severity: AuditSeverity.WARNING,
      ipAddress: this.getIpAddress(req),
      userAgent: req.get("user-agent"),
      success: false,
      details: {
        path: req.path,
        method: req.method,
      },
    });
  }

  /**
   * Obtener logs con filtros
   */
  static async getLogs(filters: {
    action?: AuditAction;
    userId?: Types.ObjectId;
    startDate?: Date;
    endDate?: Date;
    severity?: AuditSeverity;
    success?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ logs: IAuditLog[]; total: number; page: number; pages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.action) query.action = filters.action;
    if (filters.userId) query.user = filters.userId;
    if (filters.severity) query.severity = filters.severity;
    if (filters.success !== undefined) query.success = filters.success;

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate("user", "name auth.email role")
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener estadísticas de auditoría
   */
  static async getStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalLogs: number;
    successfulActions: number;
    failedActions: number;
    bySeverity: Record<string, number>;
    byAction: Record<string, number>;
    topUsers: Array<{ user: string; count: number }>;
  }> {
    const matchQuery: any = {};
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = startDate;
      if (endDate) matchQuery.timestamp.$lte = endDate;
    }

    const [totalLogs, successful, failed, bySeverity, byAction, topUsers] =
      await Promise.all([
        AuditLog.countDocuments(matchQuery),
        AuditLog.countDocuments({ ...matchQuery, success: true }),
        AuditLog.countDocuments({ ...matchQuery, success: false }),
        AuditLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),
        AuditLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: "$action", count: { $sum: 1 } } },
        ]),
        AuditLog.aggregate([
          { $match: { ...matchQuery, user: { $exists: true } } },
          { $group: { _id: "$user", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "userData",
            },
          },
        ]),
      ]);

    return {
      totalLogs,
      successfulActions: successful,
      failedActions: failed,
      bySeverity: bySeverity.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {}
      ),
      byAction: byAction.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.count }),
        {}
      ),
      topUsers: topUsers.map((item) => ({
        user: item.userData[0]?.name || "Unknown",
        count: item.count,
      })),
    };
  }

  /**
   * Helper para obtener la IP del request
   */
  private static getIpAddress(req: Request): string {
    return (
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown"
    );
  }

  /**
   * Eliminar logs antiguos manualmente
   */
  static async cleanOldLogs(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}
