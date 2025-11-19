import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { FeaturesService } from "../services/FeaturesService";
import { AuditService } from "../services/AuditService";
import { SystemModule } from "../interfaces/IFeatures";
import { AuditAction, AuditCategory, AuditSeverity } from "../interfaces/IAuditLog";
import jwt from "jsonwebtoken";

export const adminController = {
  /**
   * Obtener todos los módulos disponibles con su estado para una empresa
   */
  async getCompanyModules(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;

      const modules = await FeaturesService.getAllModules(companyId);

      res.json({
        modules,
        categorized: FeaturesService.getModulesByCategory(),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Habilitar un módulo para una empresa
   */
  async enableModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, module } = req.params;
      const { settings } = req.body;

      if (!req.user) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }

      const company = await FeaturesService.enableModule(
        companyId,
        module as SystemModule,
        req.user,
        settings
      );

      res.json({
        message: "Módulo habilitado exitosamente",
        company,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Deshabilitar un módulo para una empresa
   */
  async disableModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, module } = req.params;

      if (!req.user) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }

      const company = await FeaturesService.disableModule(
        companyId,
        module as SystemModule,
        req.user
      );

      res.json({
        message: "Módulo deshabilitado exitosamente",
        company,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Configurar un módulo
   */
  async configureModule(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, module } = req.params;
      const { settings } = req.body;

      if (!req.user) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }

      const company = await FeaturesService.configureModule(
        companyId,
        module as SystemModule,
        settings,
        req.user
      );

      res.json({
        message: "Módulo configurado exitosamente",
        company,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Obtener logs de auditoría
   */
  async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        companyId,
        userId,
        action,
        category,
        severity,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query;

      const { logs, total } = await AuditService.getLogs({
        company: companyId as string,
        userId: userId as string,
        action: action as AuditAction,
        category: category as AuditCategory,
        severity: severity as AuditSeverity,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json({
        logs,
        total,
        pagination: {
          limit: limit ? parseInt(limit as string) : 50,
          offset: offset ? parseInt(offset as string) : 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener estadísticas de auditoría
   */
  async getAuditStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, startDate, endDate } = req.query;

      const stats = await AuditService.getStats({
        company: companyId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Exportar logs de auditoría
   */
  async exportAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId, startDate, endDate, format } = req.query;

      const exportData = await AuditService.exportLogs(
        {
          company: companyId as string,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
        },
        (format as "csv" | "json") || "json"
      );

      const contentType =
        format === "csv" ? "text/csv" : "application/json";
      const filename = `audit-logs-${new Date().toISOString()}.${format || "json"}`;

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(exportData);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Generar token de impersonación para acceder como empresa
   */
  async impersonateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { companyId } = req.params;

      if (!req.user) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }

      // Solo admins pueden impersonar
      if (req.user.role !== "admin") {
        res.status(403).json({ error: "No autorizado" });
        return;
      }

      // Generar token especial con flag de impersonación
      const impersonationToken = jwt.sign(
        {
          id: req.user._id,
          companyId,
          isImpersonating: true,
          impersonatedBy: req.user._id,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "2h" } // Token de impersonación expira en 2 horas
      );

      // Log de auditoría
      await AuditService.log({
        action: AuditAction.IMPERSONATION_START,
        actor: req.user,
        company: companyId,
        metadata: {
          companyId,
          adminId: req.user._id,
          adminEmail: req.user.auth.email,
        },
        req,
      });

      res.json({
        message: "Token de impersonación generado",
        token: impersonationToken,
        expiresIn: "2h",
        warning: "Este token permite acceso completo a la empresa",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Finalizar impersonación
   */
  async endImpersonation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ error: "No autenticado" });
        return;
      }

      // Log de auditoría
      await AuditService.log({
        action: AuditAction.IMPERSONATION_END,
        actor: req.user,
        company: req.companyId,
        metadata: {
          companyId: req.companyId,
          adminId: req.user._id,
        },
        req,
      });

      res.json({
        message: "Impersonación finalizada",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Dashboard de super admin con estadísticas globales
   */
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user || req.user.role !== "admin") {
        res.status(403).json({ error: "No autorizado" });
        return;
      }

      // Aquí puedes agregar estadísticas globales del sistema
      // Por ahora retornamos un placeholder
      res.json({
        message: "Dashboard de super admin",
        stats: {
          totalCompanies: 0, // TODO: Implementar
          activeCompanies: 0,
          totalUsers: 0,
          totalVisits: 0,
          recentActivity: [],
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
