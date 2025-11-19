import { Company } from "../models/Company";
import { ICompany } from "../interfaces/ICompany";
import {
  SystemModule,
  IModuleConfig,
  DEFAULT_FEATURES_BY_PLAN,
  MODULE_INFO,
} from "../interfaces/IFeatures";
import { Types } from "mongoose";
import { AuditService } from "./AuditService";
import { AuditAction } from "../interfaces/IAuditLog";
import { IUser } from "../interfaces/IUser";

export class FeaturesService {
  /**
   * Inicializar features para una empresa según su plan
   */
  static async initializeFeatures(
    companyId: Types.ObjectId,
    plan: "free" | "basic" | "premium" | "enterprise"
  ): Promise<IModuleConfig[]> {
    const defaultModules = DEFAULT_FEATURES_BY_PLAN[plan];

    const modules: IModuleConfig[] = defaultModules.map((module) => ({
      module,
      enabled: true,
      enabledAt: new Date(),
      settings: {},
    }));

    // Actualizar empresa con módulos inicializados
    await Company.findByIdAndUpdate(companyId, {
      $set: { features: { modules } },
    });

    return modules;
  }

  /**
   * Habilitar un módulo para una empresa
   */
  static async enableModule(
    companyId: Types.ObjectId | string,
    module: SystemModule,
    actor: IUser,
    settings?: any
  ): Promise<ICompany | null> {
    const company = await Company.findById(companyId);

    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    // Verificar si el módulo ya está habilitado
    const moduleIndex = company.features?.modules.findIndex(
      (m) => m.module === module
    );

    if (moduleIndex !== undefined && moduleIndex !== -1 && company.features) {
      // Actualizar módulo existente
      company.features.modules[moduleIndex].enabled = true;
      company.features.modules[moduleIndex].enabledAt = new Date();
      company.features.modules[moduleIndex].enabledBy = actor._id;
      if (settings) {
        company.features.modules[moduleIndex].settings = settings;
      }
    } else {
      // Agregar nuevo módulo
      if (!company.features) {
        company.features = { modules: [] };
      }
      company.features.modules.push({
        module,
        enabled: true,
        enabledAt: new Date(),
        enabledBy: actor._id,
        settings: settings || {},
      });
    }

    await company.save();

    // Log de auditoría
    await AuditService.log({
      action: AuditAction.FEATURE_ENABLED,
      actor,
      company: companyId,
      resource: {
        type: "Feature",
        name: module,
      },
      metadata: { module, settings },
    });

    return company;
  }

  /**
   * Deshabilitar un módulo para una empresa
   */
  static async disableModule(
    companyId: Types.ObjectId | string,
    module: SystemModule,
    actor: IUser
  ): Promise<ICompany | null> {
    const company = await Company.findById(companyId);

    if (!company || !company.features) {
      throw new Error("Empresa no encontrada");
    }

    const moduleIndex = company.features.modules.findIndex(
      (m) => m.module === module
    );

    if (moduleIndex === -1) {
      throw new Error("Módulo no encontrado");
    }

    // Deshabilitar módulo
    company.features.modules[moduleIndex].enabled = false;
    company.features.modules[moduleIndex].disabledAt = new Date();
    company.features.modules[moduleIndex].disabledBy = actor._id;

    await company.save();

    // Log de auditoría
    await AuditService.log({
      action: AuditAction.FEATURE_DISABLED,
      actor,
      company: companyId,
      resource: {
        type: "Feature",
        name: module,
      },
      metadata: { module },
    });

    return company;
  }

  /**
   * Configurar un módulo
   */
  static async configureModule(
    companyId: Types.ObjectId | string,
    module: SystemModule,
    settings: any,
    actor: IUser
  ): Promise<ICompany | null> {
    const company = await Company.findById(companyId);

    if (!company || !company.features) {
      throw new Error("Empresa no encontrada");
    }

    const moduleIndex = company.features.modules.findIndex(
      (m) => m.module === module
    );

    if (moduleIndex === -1) {
      throw new Error("Módulo no encontrado");
    }

    const oldSettings = company.features.modules[moduleIndex].settings;

    // Actualizar configuración
    company.features.modules[moduleIndex].settings = {
      ...oldSettings,
      ...settings,
    };

    await company.save();

    // Log de auditoría
    await AuditService.log({
      action: AuditAction.FEATURE_CONFIGURED,
      actor,
      company: companyId,
      resource: {
        type: "Feature",
        name: module,
      },
      changes: {
        before: oldSettings,
        after: settings,
      },
      metadata: { module },
    });

    return company;
  }

  /**
   * Obtener módulos habilitados de una empresa
   */
  static async getEnabledModules(
    companyId: Types.ObjectId | string
  ): Promise<SystemModule[]> {
    const company = await Company.findById(companyId);

    if (!company || !company.features) {
      return [];
    }

    return company.features.modules
      .filter((m) => m.enabled)
      .map((m) => m.module);
  }

  /**
   * Verificar si un módulo está habilitado
   */
  static async isModuleEnabled(
    companyId: Types.ObjectId | string,
    module: SystemModule
  ): Promise<boolean> {
    const enabledModules = await this.getEnabledModules(companyId);
    return enabledModules.includes(module);
  }

  /**
   * Obtener todos los módulos de una empresa con su estado
   */
  static async getAllModules(
    companyId: Types.ObjectId | string
  ): Promise<
    {
      module: SystemModule;
      enabled: boolean;
      info: { name: string; description: string; category: string };
      settings?: any;
    }[]
  > {
    const company = await Company.findById(companyId);
    const companyModules = company?.features?.modules || [];

    // Crear un mapa de módulos habilitados
    const modulesMap = new Map(
      companyModules.map((m) => [m.module, m])
    );

    // Retornar todos los módulos del sistema con su estado
    return Object.values(SystemModule).map((module) => {
      const moduleConfig = modulesMap.get(module);
      return {
        module,
        enabled: moduleConfig?.enabled || false,
        info: MODULE_INFO[module],
        settings: moduleConfig?.settings,
      };
    });
  }

  /**
   * Actualizar features al cambiar de plan
   */
  static async updateFeaturesForPlan(
    companyId: Types.ObjectId | string,
    newPlan: "free" | "basic" | "premium" | "enterprise",
    actor: IUser
  ): Promise<ICompany | null> {
    const company = await Company.findById(companyId);

    if (!company) {
      throw new Error("Empresa no encontrada");
    }

    const defaultModules = DEFAULT_FEATURES_BY_PLAN[newPlan];
    const currentModules = company.features?.modules || [];

    // Deshabilitar módulos que no están en el nuevo plan
    const updatedModules = currentModules.map((module) => {
      if (!defaultModules.includes(module.module)) {
        return {
          ...module,
          enabled: false,
          disabledAt: new Date(),
          disabledBy: actor._id,
        };
      }
      return module;
    });

    // Agregar nuevos módulos del plan si no existen
    defaultModules.forEach((module) => {
      if (!updatedModules.find((m) => m.module === module)) {
        updatedModules.push({
          module,
          enabled: true,
          enabledAt: new Date(),
          enabledBy: actor._id,
          settings: {},
        });
      }
    });

    company.features = { modules: updatedModules };
    await company.save();

    // Log de auditoría
    await AuditService.log({
      action: AuditAction.SUBSCRIPTION_UPDATED,
      actor,
      company: companyId,
      metadata: { newPlan, modulesUpdated: updatedModules.length },
    });

    return company;
  }

  /**
   * Obtener módulos agrupados por categoría
   */
  static getModulesByCategory(): Record<
    string,
    {
      module: SystemModule;
      name: string;
      description: string;
    }[]
  > {
    const grouped: Record<string, any[]> = {};

    Object.entries(MODULE_INFO).forEach(([module, info]) => {
      if (!grouped[info.category]) {
        grouped[info.category] = [];
      }
      grouped[info.category].push({
        module: module as SystemModule,
        name: info.name,
        description: info.description,
      });
    });

    return grouped;
  }
}
