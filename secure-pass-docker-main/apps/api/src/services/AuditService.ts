import { AuditLog } from "../models/AuditLog";
import {
  IAuditLog,
  IAuditLogInput,
  AuditAction,
  AuditCategory,
  AuditSeverity,
  getAuditDescription,
  getCategoryFromAction,
  getSeverityFromAction,
} from "../interfaces/IAuditLog";
import { Types } from "mongoose";
import { IUser } from "../interfaces/IUser";
import { Request } from "express";

export class AuditService {
  /**
   * Crear un log de auditoría
   */
  static async log(params: {
    action: AuditAction;
    actor: IUser | { email: string; role?: string };
    company?: Types.ObjectId | string;
    resource?: {
      type: string;
      id?: Types.ObjectId | string;
      name?: string;
    };
    changes?: {
      before?: any;
      after?: any;
    };
    metadata?: any;
    description?: string;
    req?: Request;
  }): Promise<IAuditLog> {
    const {
      action,
      actor,
      company,
      resource,
      changes,
      metadata = {},
      description,
      req,
    } = params;

    // Extraer información del request si está disponible
    if (req) {
      metadata.ip = req.ip || req.connection.remoteAddress;
      metadata.userAgent = req.headers["user-agent"];
      metadata.method = req.method;
      metadata.path = req.path;
    }

    // Construir el log
    const logData: IAuditLogInput = {
      action,
      category: getCategoryFromAction(action),
      severity: getSeverityFromAction(action),
      company: company ? new Types.ObjectId(company) : undefined,
      actor: {
        userId: "_id" in actor ? actor._id : undefined,
        email: actor.auth?.email || actor.email,
        role: actor.role,
        isImpersonating: false, // Se actualiza en el middleware si aplica
      },
      resource,
      changes: changes
        ? {
            before: this.sanitizeData(changes.before),
            after: this.sanitizeData(changes.after),
          }
        : undefined,
      metadata,
      description: description || getAuditDescription(action, metadata),
      timestamp: new Date(),
    };

    const auditLog = new AuditLog(logData);
    return await auditLog.save();
  }

  /**
   * Obtener logs de auditoría con filtros
   */
  static async getLogs(filters: {
    company?: Types.ObjectId | string;
    userId?: Types.ObjectId | string;
    action?: AuditAction;
    category?: AuditCategory;
    severity?: AuditSeverity;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: IAuditLog[]; total: number }> {
    const {
      company,
      userId,
      action,
      category,
      severity,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const query: any = {};

    if (company) query.company = company;
    if (userId) query["actor.userId"] = userId;
    if (action) query.action = action;
    if (category) query.category = category;
    if (severity) query.severity = severity;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = startDate;
      if (endDate) query.timestamp.$lte = endDate;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit)
        .populate("actor.userId", "name auth.email role")
        .populate("company", "name subdomain")
        .exec(),
      AuditLog.countDocuments(query),
    ]);

    return { logs, total };
  }

  /**
   * Obtener estadísticas de auditoría
   */
  static async getStats(params: {
    company?: Types.ObjectId | string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalLogs: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byAction: Record<string, number>;
    recentActivity: IAuditLog[];
  }> {
    const { company, startDate, endDate } = params;

    const matchQuery: any = {};
    if (company) matchQuery.company = company;
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = startDate;
      if (endDate) matchQuery.timestamp.$lte = endDate;
    }

    const [totalLogs, byCategory, bySeverity, byAction, recentActivity] =
      await Promise.all([
        AuditLog.countDocuments(matchQuery),

        AuditLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: "$category", count: { $sum: 1 } } },
        ]),

        AuditLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),

        AuditLog.aggregate([
          { $match: matchQuery },
          { $group: { _id: "$action", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),

        AuditLog.find(matchQuery)
          .sort({ timestamp: -1 })
          .limit(10)
          .populate("actor.userId", "name auth.email")
          .exec(),
      ]);

    return {
      totalLogs,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      byAction: byAction.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      recentActivity,
    };
  }

  /**
   * Exportar logs a CSV o JSON
   */
  static async exportLogs(
    filters: {
      company?: Types.ObjectId | string;
      startDate?: Date;
      endDate?: Date;
    },
    format: "csv" | "json" = "json"
  ): Promise<string> {
    const { logs } = await this.getLogs({ ...filters, limit: 10000 });

    if (format === "json") {
      return JSON.stringify(logs, null, 2);
    }

    // CSV
    const headers = [
      "Timestamp",
      "Action",
      "Category",
      "Severity",
      "Actor",
      "Description",
      "Company",
    ];

    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.action,
      log.category,
      log.severity,
      log.actor.email || "System",
      log.description,
      (log.company as any)?.name || "N/A",
    ]);

    return [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");
  }

  /**
   * Limpiar logs antiguos (mantener solo últimos N días)
   */
  static async cleanOldLogs(days: number = 730): Promise<number> {
    // 2 años por defecto
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await AuditLog.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }

  /**
   * Sanitizar datos sensibles antes de guardar en logs
   */
  private static sanitizeData(data: any): any {
    if (!data) return data;

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "apiKey",
      "auth.password",
    ];

    const sanitize = (obj: any): any => {
      if (typeof obj !== "object" || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
          sanitized[key] = "[REDACTED]";
        } else if (typeof value === "object" && value !== null) {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(data);
  }

  /**
   * Helper para logs de cambios de empresa
   */
  static async logCompanyChange(
    action: AuditAction,
    companyId: Types.ObjectId,
    companyName: string,
    actor: IUser,
    changes?: any,
    req?: Request
  ): Promise<IAuditLog> {
    return this.log({
      action,
      actor,
      company: companyId,
      resource: {
        type: "Company",
        id: companyId,
        name: companyName,
      },
      changes,
      metadata: { companyName },
      req,
    });
  }

  /**
   * Helper para logs de cambios de usuario
   */
  static async logUserChange(
    action: AuditAction,
    userId: Types.ObjectId,
    userEmail: string,
    actor: IUser,
    changes?: any,
    req?: Request
  ): Promise<IAuditLog> {
    return this.log({
      action,
      actor,
      resource: {
        type: "User",
        id: userId,
        name: userEmail,
      },
      changes,
      metadata: { email: userEmail },
      req,
    });
  }
}
