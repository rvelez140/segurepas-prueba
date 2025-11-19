import FeatureToggle, { IFeatureToggle } from '../models/FeatureToggle';

export class FeatureToggleService {

  /**
   * Obtener todas las features
   */
  async getAllFeatures(): Promise<IFeatureToggle[]> {
    return await FeatureToggle.find().sort({ category: 1, name: 1 });
  }

  /**
   * Obtener features por categoría
   */
  async getFeaturesByCategory(category: string): Promise<IFeatureToggle[]> {
    return await FeatureToggle.find({ category }).sort({ name: 1 });
  }

  /**
   * Obtener una feature por su key
   */
  async getFeatureByKey(key: string): Promise<IFeatureToggle | null> {
    return await FeatureToggle.findOne({ key });
  }

  /**
   * Crear una nueva feature
   */
  async createFeature(data: {
    key: string;
    name: string;
    description: string;
    enabled?: boolean;
    enabledForRoles?: string[];
    enabledForUsers?: string[];
    category?: string;
    metadata?: Record<string, any>;
  }): Promise<IFeatureToggle> {
    const feature = new FeatureToggle(data);
    return await feature.save();
  }

  /**
   * Actualizar una feature
   */
  async updateFeature(
    key: string,
    updates: Partial<IFeatureToggle>
  ): Promise<IFeatureToggle | null> {
    return await FeatureToggle.findOneAndUpdate(
      { key },
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  /**
   * Eliminar una feature
   */
  async deleteFeature(key: string): Promise<boolean> {
    const result = await FeatureToggle.deleteOne({ key });
    return result.deletedCount > 0;
  }

  /**
   * Verificar si una feature está habilitada para un usuario
   */
  async isFeatureEnabledForUser(
    featureKey: string,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    const feature = await FeatureToggle.findOne({ key: featureKey });

    if (!feature) {
      // Si no existe la feature, por defecto está deshabilitada
      return false;
    }

    // Si está deshabilitada globalmente
    if (!feature.enabled) {
      return false;
    }

    // Si está habilitada para usuarios específicos
    if (feature.enabledForUsers && feature.enabledForUsers.length > 0) {
      return feature.enabledForUsers.includes(userId);
    }

    // Si está habilitada para roles específicos
    if (feature.enabledForRoles && feature.enabledForRoles.length > 0) {
      return feature.enabledForRoles.includes(userRole);
    }

    // Si está habilitada globalmente y no hay restricciones
    return true;
  }

  /**
   * Obtener todas las features habilitadas para un usuario
   */
  async getEnabledFeaturesForUser(
    userId: string,
    userRole: string
  ): Promise<string[]> {
    const allFeatures = await FeatureToggle.find({ enabled: true });

    const enabledFeatures: string[] = [];

    for (const feature of allFeatures) {
      // Si tiene restricciones de usuarios específicos
      if (feature.enabledForUsers && feature.enabledForUsers.length > 0) {
        if (feature.enabledForUsers.includes(userId)) {
          enabledFeatures.push(feature.key);
        }
        continue;
      }

      // Si tiene restricciones de roles
      if (feature.enabledForRoles && feature.enabledForRoles.length > 0) {
        if (feature.enabledForRoles.includes(userRole)) {
          enabledFeatures.push(feature.key);
        }
        continue;
      }

      // Si no tiene restricciones, está habilitada para todos
      enabledFeatures.push(feature.key);
    }

    return enabledFeatures;
  }

  /**
   * Toggle (activar/desactivar) una feature
   */
  async toggleFeature(key: string): Promise<IFeatureToggle | null> {
    const feature = await FeatureToggle.findOne({ key });
    if (!feature) {
      return null;
    }

    feature.enabled = !feature.enabled;
    return await feature.save();
  }

  /**
   * Habilitar feature para un rol específico
   */
  async enableForRole(key: string, role: string): Promise<IFeatureToggle | null> {
    const feature = await FeatureToggle.findOne({ key });
    if (!feature) {
      return null;
    }

    if (!feature.enabledForRoles) {
      feature.enabledForRoles = [];
    }

    if (!feature.enabledForRoles.includes(role)) {
      feature.enabledForRoles.push(role);
    }

    return await feature.save();
  }

  /**
   * Deshabilitar feature para un rol específico
   */
  async disableForRole(key: string, role: string): Promise<IFeatureToggle | null> {
    const feature = await FeatureToggle.findOne({ key });
    if (!feature) {
      return null;
    }

    if (feature.enabledForRoles) {
      feature.enabledForRoles = feature.enabledForRoles.filter(r => r !== role);
    }

    return await feature.save();
  }

  /**
   * Inicializar features por defecto
   */
  async initializeDefaultFeatures(): Promise<void> {
    const defaultFeatures = [
      {
        key: 'payment_module',
        name: 'Módulo de Pagos',
        description: 'Permite procesar pagos con Stripe y PayPal',
        enabled: true,
        category: 'pagos',
        enabledForRoles: ['admin']
      },
      {
        key: 'qr_scanner',
        name: 'Escáner QR',
        description: 'Permite escanear códigos QR para autorizaciones',
        enabled: true,
        category: 'autorizaciones',
        enabledForRoles: ['guardia', 'admin']
      },
      {
        key: 'reports_module',
        name: 'Módulo de Reportes',
        description: 'Permite generar reportes de visitas y exportar a PDF',
        enabled: true,
        category: 'reportes',
        enabledForRoles: ['admin']
      },
      {
        key: 'advanced_analytics',
        name: 'Analíticas Avanzadas',
        description: 'Dashboard con estadísticas avanzadas de visitas',
        enabled: false,
        category: 'reportes',
        enabledForRoles: ['admin']
      },
      {
        key: 'user_registration',
        name: 'Registro de Usuarios',
        description: 'Permite registrar nuevos residentes y guardias',
        enabled: true,
        category: 'usuarios',
        enabledForRoles: ['admin']
      },
      {
        key: 'document_upload',
        name: 'Carga de Documentos',
        description: 'Permite cargar documentos de identidad y placas vehiculares',
        enabled: true,
        category: 'usuarios',
        enabledForRoles: ['admin', 'residente']
      },
      {
        key: 'notifications',
        name: 'Notificaciones',
        description: 'Sistema de notificaciones por email',
        enabled: true,
        category: 'general',
        enabledForRoles: ['admin', 'residente', 'guardia']
      },
      {
        key: 'subscription_management',
        name: 'Gestión de Suscripciones',
        description: 'Administración de planes y suscripciones SaaS',
        enabled: true,
        category: 'pagos',
        enabledForRoles: ['admin']
      }
    ];

    for (const featureData of defaultFeatures) {
      const exists = await FeatureToggle.findOne({ key: featureData.key });
      if (!exists) {
        await this.createFeature(featureData);
      }
    }
  }
}

export default new FeatureToggleService();
