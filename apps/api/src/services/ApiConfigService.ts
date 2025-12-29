import { ApiConfig, IApiConfigModel } from '../models/ApiConfig';
import { ApiProvider, IApiConfig, API_PROVIDER_DEFINITIONS } from '../interfaces/IApiConfig';

class ApiConfigService {
  private configCache: Map<ApiProvider, { config: Record<string, string>; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Inicializa todos los proveedores en la base de datos
   */
  async initializeProviders(): Promise<void> {
    await (ApiConfig as IApiConfigModel).initializeProviders();
  }

  /**
   * Obtiene todas las configuraciones de API
   */
  async getAllConfigs(): Promise<IApiConfig[]> {
    const configs = await ApiConfig.find().sort({ displayName: 1 });
    return configs;
  }

  /**
   * Obtiene la configuración de un proveedor específico
   */
  async getConfig(provider: ApiProvider): Promise<IApiConfig | null> {
    return await ApiConfig.findOne({ provider });
  }

  /**
   * Actualiza la configuración de un proveedor
   */
  async updateConfig(
    provider: ApiProvider,
    fields: { key: string; value: string }[],
    isEnabled?: boolean
  ): Promise<IApiConfig | null> {
    const config = await ApiConfig.findOne({ provider });
    if (!config) return null;

    // Actualizar campos
    fields.forEach(({ key, value }) => {
      const fieldIndex = config.fields.findIndex((f) => f.key === key);
      if (fieldIndex !== -1) {
        // Solo actualizar si el valor no es la máscara de secreto
        if (value !== '********') {
          config.fields[fieldIndex].value = value;
        }
      }
    });

    // Actualizar estado de habilitación
    if (isEnabled !== undefined) {
      config.isEnabled = isEnabled;
    }

    await config.save();

    // Invalidar caché
    this.configCache.delete(provider);

    return config;
  }

  /**
   * Habilita o deshabilita un proveedor
   */
  async toggleProvider(provider: ApiProvider, isEnabled: boolean): Promise<IApiConfig | null> {
    const config = await ApiConfig.findOneAndUpdate(
      { provider },
      { isEnabled },
      { new: true }
    );

    // Invalidar caché
    this.configCache.delete(provider);

    return config;
  }

  /**
   * Obtiene los valores de configuración con fallback a variables de entorno
   * Usa caché para mejorar el rendimiento
   */
  async getConfigValues(provider: ApiProvider): Promise<Record<string, string>> {
    // Verificar caché
    const cached = this.configCache.get(provider);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.config;
    }

    const values = await (ApiConfig as IApiConfigModel).getConfigWithFallback(provider);

    // Guardar en caché
    this.configCache.set(provider, { config: values, timestamp: Date.now() });

    return values;
  }

  /**
   * Verifica si un proveedor está disponible (configurado)
   */
  async isProviderAvailable(provider: ApiProvider): Promise<boolean> {
    return await (ApiConfig as IApiConfigModel).isProviderAvailable(provider);
  }

  /**
   * Obtiene el estado de todos los proveedores
   */
  async getProvidersStatus(): Promise<
    {
      provider: ApiProvider;
      displayName: string;
      isEnabled: boolean;
      isConfigured: boolean;
      isAvailable: boolean;
      source: 'database' | 'env' | 'none';
    }[]
  > {
    const configs = await this.getAllConfigs();
    const statuses = [];

    for (const [providerKey, definition] of Object.entries(API_PROVIDER_DEFINITIONS)) {
      const provider = providerKey as ApiProvider;
      const config = configs.find((c) => c.provider === provider);

      // Verificar si está configurado via variables de entorno
      const requiredFields = definition.fields.filter((f) => f.required).map((f) => f.key);
      const envConfigured = requiredFields.every((key) => {
        const envValue = process.env[key];
        return envValue && envValue.length > 0;
      });

      let source: 'database' | 'env' | 'none' = 'none';
      if (config?.isEnabled && config?.isConfigured) {
        source = 'database';
      } else if (envConfigured) {
        source = 'env';
      }

      statuses.push({
        provider,
        displayName: definition.displayName,
        isEnabled: config?.isEnabled || false,
        isConfigured: config?.isConfigured || false,
        isAvailable: source !== 'none',
        source,
      });
    }

    return statuses;
  }

  /**
   * Prueba la conexión de un proveedor
   */
  async testConnection(provider: ApiProvider): Promise<{ success: boolean; message: string }> {
    const isAvailable = await this.isProviderAvailable(provider);

    if (!isAvailable) {
      return { success: false, message: 'El proveedor no está configurado' };
    }

    const values = await this.getConfigValues(provider);

    try {
      switch (provider) {
        case ApiProvider.STRIPE:
          return await this.testStripeConnection(values);
        case ApiProvider.PAYPAL:
          return await this.testPayPalConnection(values);
        case ApiProvider.CLOUDINARY:
          return await this.testCloudinaryConnection(values);
        case ApiProvider.EMAIL:
          return await this.testEmailConnection(values);
        case ApiProvider.FIREBASE:
          return { success: true, message: 'Firebase configurado (verificar credenciales manualmente)' };
        case ApiProvider.SENTRY:
          return { success: true, message: 'Sentry configurado (verificar DSN manualmente)' };
        default:
          return { success: false, message: 'Proveedor no soportado' };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, message: `Error: ${errorMessage}` };
    }
  }

  private async testStripeConnection(values: Record<string, string>): Promise<{ success: boolean; message: string }> {
    if (!values.STRIPE_SECRET_KEY) {
      return { success: false, message: 'Clave secreta de Stripe no configurada' };
    }

    try {
      // Importar Stripe dinámicamente para evitar errores si no está instalado
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(values.STRIPE_SECRET_KEY);
      await stripe.balance.retrieve();
      return { success: true, message: 'Conexión a Stripe exitosa' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, message: `Error de Stripe: ${errorMessage}` };
    }
  }

  private async testPayPalConnection(values: Record<string, string>): Promise<{ success: boolean; message: string }> {
    if (!values.PAYPAL_CLIENT_ID || !values.PAYPAL_CLIENT_SECRET) {
      return { success: false, message: 'Credenciales de PayPal no configuradas' };
    }

    try {
      const mode = values.PAYPAL_MODE || 'sandbox';
      const baseUrl = mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

      const auth = Buffer.from(`${values.PAYPAL_CLIENT_ID}:${values.PAYPAL_CLIENT_SECRET}`).toString('base64');

      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (response.ok) {
        return { success: true, message: 'Conexión a PayPal exitosa' };
      } else {
        return { success: false, message: 'Error de autenticación con PayPal' };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, message: `Error de PayPal: ${errorMessage}` };
    }
  }

  private async testCloudinaryConnection(values: Record<string, string>): Promise<{ success: boolean; message: string }> {
    if (!values.CLOUDINARY_CLOUD_NAME || !values.CLOUDINARY_API_KEY || !values.CLOUDINARY_API_SECRET) {
      return { success: false, message: 'Credenciales de Cloudinary no configuradas' };
    }

    try {
      const cloudinary = (await import('cloudinary')).v2;
      cloudinary.config({
        cloud_name: values.CLOUDINARY_CLOUD_NAME,
        api_key: values.CLOUDINARY_API_KEY,
        api_secret: values.CLOUDINARY_API_SECRET,
      });

      await cloudinary.api.ping();
      return { success: true, message: 'Conexión a Cloudinary exitosa' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, message: `Error de Cloudinary: ${errorMessage}` };
    }
  }

  private async testEmailConnection(values: Record<string, string>): Promise<{ success: boolean; message: string }> {
    if (!values.EMAIL_USER || !values.EMAIL_PASSWORD) {
      return { success: false, message: 'Credenciales de Email no configuradas' };
    }

    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: values.EMAIL_USER,
          pass: values.EMAIL_PASSWORD,
        },
      });

      await transporter.verify();
      return { success: true, message: 'Conexión de Email exitosa' };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión';
      return { success: false, message: `Error de Email: ${errorMessage}` };
    }
  }

  /**
   * Limpia la caché de configuración
   */
  clearCache(): void {
    this.configCache.clear();
  }
}

export const apiConfigService = new ApiConfigService();
export default apiConfigService;
