import { Response, NextFunction } from "express";
import { CompanyService } from "../services/CompanyService";
import { AuthenticatedRequest } from "../types/auth.types";
import { ICompany } from "../interfaces/ICompany";

export const companyController = {
  /**
   * Crear nueva empresa (solo super-admin)
   */
  async createCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const companyData: Partial<ICompany> = req.body;

      const company = await CompanyService.createCompany(companyData);

      res.status(201).json({
        message: "Empresa creada exitosamente",
        company: {
          id: company._id,
          name: company.name,
          subdomain: company.subdomain,
          logo: company.logo,
          settings: company.settings,
          contact: company.contact,
          subscription: company.subscription,
          createdAt: company.createdAt,
        },
      });
    } catch (error: any) {
      if (error.message === "El subdominio ya está en uso") {
        res.status(409).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },

  /**
   * Obtener todas las empresas (solo super-admin)
   */
  async getAllCompanies(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.query;

      const filter: any = {};
      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      const companies = await CompanyService.getAllCompanies(filter);

      res.json({
        count: companies.length,
        companies: companies.map((company) => ({
          id: company._id,
          name: company.name,
          subdomain: company.subdomain,
          logo: company.logo,
          settings: company.settings,
          contact: company.contact,
          subscription: company.subscription,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener empresa por ID
   */
  async getCompanyById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const company = await CompanyService.findById(id);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        id: company._id,
        name: company.name,
        subdomain: company.subdomain,
        logo: company.logo,
        settings: company.settings,
        contact: company.contact,
        subscription: company.subscription,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener empresa por subdominio
   */
  async getCompanyBySubdomain(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subdomain } = req.params;

      const company = await CompanyService.findBySubdomain(subdomain);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        id: company._id,
        name: company.name,
        subdomain: company.subdomain,
        logo: company.logo,
        settings: company.settings,
        subscription: {
          plan: company.subscription.plan,
          isActive: company.subscription.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar empresa
   */
  async updateCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: Partial<ICompany> = req.body;

      const company = await CompanyService.updateCompany(id, updateData);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        message: "Empresa actualizada exitosamente",
        company: {
          id: company._id,
          name: company.name,
          subdomain: company.subdomain,
          logo: company.logo,
          settings: company.settings,
          contact: company.contact,
          subscription: company.subscription,
          updatedAt: company.updatedAt,
        },
      });
    } catch (error: any) {
      if (error.message === "El subdominio ya está en uso") {
        res.status(409).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },

  /**
   * Desactivar empresa (soft delete)
   */
  async deleteCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const company = await CompanyService.deleteCompany(id);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        message: "Empresa desactivada exitosamente",
        company: {
          id: company._id,
          name: company.name,
          subscription: company.subscription,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Subir/actualizar logo de la empresa
   */
  async uploadLogo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        res.status(400).json({ error: "No se proporcionó archivo" });
        return;
      }

      const company = await CompanyService.updateLogo(id, file);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        message: "Logo actualizado exitosamente",
        logo: company.logo,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar logo de la empresa
   */
  async deleteLogo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const company = await CompanyService.deleteLogo(id);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        message: "Logo eliminado exitosamente",
      });
    } catch (error: any) {
      if (error.message === "La empresa no tiene logo") {
        res.status(404).json({ error: error.message });
      } else {
        next(error);
      }
    }
  },

  /**
   * Actualizar suscripción de la empresa
   */
  async updateSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const subscriptionData = req.body;

      const company = await CompanyService.updateSubscription(id, subscriptionData);

      if (!company) {
        res.status(404).json({ error: "Empresa no encontrada" });
        return;
      }

      res.json({
        message: "Suscripción actualizada exitosamente",
        subscription: company.subscription,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obtener información de la empresa actual del usuario
   */
  async getCurrentCompany(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // La empresa ya está cargada por el tenantMiddleware
      if (!req.company) {
        res.status(404).json({ error: "No se encontró empresa para el usuario" });
        return;
      }

      res.json({
        id: req.company._id,
        name: req.company.name,
        subdomain: req.company.subdomain,
        logo: req.company.logo,
        settings: req.company.settings,
        subscription: {
          plan: req.company.subscription.plan,
          maxUsers: req.company.subscription.maxUsers,
          maxResidents: req.company.subscription.maxResidents,
          isActive: req.company.subscription.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
