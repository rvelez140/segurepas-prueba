import mongoose, { Schema, Model } from 'mongoose';
import crypto from 'crypto';
import { IApiConfig, ApiProvider, API_PROVIDER_DEFINITIONS } from '../interfaces/IApiConfig';

// Clave de encriptación - en producción debería ser una variable de entorno
const ENCRYPTION_KEY = process.env.API_CONFIG_ENCRYPTION_KEY || 'default-encryption-key-32chars!!';
const ENCRYPTION_IV_LENGTH = 16;

// Funciones de encriptación para campos secretos
function encrypt(text: string): string {
  if (!text) return '';
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return text;
  }
}

const apiConfigFieldSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, default: '' },
    isSecret: { type: Boolean, default: false },
    label: { type: String, required: true },
    description: { type: String },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const apiConfigSchema: Schema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(ApiProvider),
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    isEnabled: {
      type: Boolean,
      default: false,
    },
    isConfigured: {
      type: Boolean,
      default: false,
    },
    fields: [apiConfigFieldSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        // Ocultar valores secretos en la respuesta JSON
        if (ret.fields) {
          ret.fields = ret.fields.map((field: { isSecret: boolean; value: string; key: string; label: string; required: boolean }) => ({
            ...field,
            value: field.isSecret && field.value ? '********' : field.value,
          }));
        }
        return ret;
      },
    },
  }
);

// Middleware para encriptar campos secretos antes de guardar
apiConfigSchema.pre('save', function (next) {
  const config = this as unknown as IApiConfig;

  config.fields.forEach((field) => {
    if (field.isSecret && field.value && !field.value.includes(':')) {
      field.value = encrypt(field.value);
    }
  });

  // Verificar si está configurado (todos los campos requeridos tienen valor)
  const definition = API_PROVIDER_DEFINITIONS[config.provider];
  if (definition) {
    const requiredFields = definition.fields.filter((f) => f.required).map((f) => f.key);
    config.isConfigured = requiredFields.every((key) => {
      const field = config.fields.find((f) => f.key === key);
      return field && field.value && field.value.length > 0;
    });
  }

  next();
});

// Método para obtener el valor desencriptado de un campo
apiConfigSchema.methods.getFieldValue = function (key: string): string {
  const field = this.fields.find((f: { key: string }) => f.key === key);
  if (!field) return '';
  return field.isSecret ? decrypt(field.value) : field.value;
};

// Método para obtener todos los valores como objeto (desencriptados)
apiConfigSchema.methods.getConfigValues = function (): Record<string, string> {
  const values: Record<string, string> = {};
  this.fields.forEach((field: { key: string; isSecret: boolean; value: string }) => {
    values[field.key] = field.isSecret ? decrypt(field.value) : field.value;
  });
  return values;
};

// Método estático para inicializar todos los proveedores
apiConfigSchema.statics.initializeProviders = async function () {
  for (const [provider, definition] of Object.entries(API_PROVIDER_DEFINITIONS)) {
    const existing = await this.findOne({ provider });
    if (!existing) {
      await this.create({
        provider,
        displayName: definition.displayName,
        description: definition.description,
        isEnabled: false,
        isConfigured: false,
        fields: definition.fields.map((f) => ({
          ...f,
          value: '',
        })),
      });
    }
  }
};

// Método estático para obtener configuración con fallback a variables de entorno
apiConfigSchema.statics.getConfigWithFallback = async function (
  provider: ApiProvider
): Promise<Record<string, string>> {
  const config = await this.findOne({ provider });
  const values: Record<string, string> = {};
  const definition = API_PROVIDER_DEFINITIONS[provider];

  if (!definition) return values;

  for (const fieldDef of definition.fields) {
    let value = '';

    // Primero intentar obtener de la BD si está habilitado y configurado
    if (config && config.isEnabled && config.isConfigured) {
      const field = config.fields.find((f: { key: string }) => f.key === fieldDef.key);
      if (field && field.value) {
        value = field.isSecret ? decrypt(field.value) : field.value;
      }
    }

    // Si no hay valor en BD, usar variable de entorno
    if (!value) {
      value = process.env[fieldDef.key] || '';
    }

    values[fieldDef.key] = value;
  }

  return values;
};

// Método estático para verificar si un proveedor está disponible (configurado en BD o .env)
apiConfigSchema.statics.isProviderAvailable = async function (provider: ApiProvider): Promise<boolean> {
  const config = await this.findOne({ provider });
  const definition = API_PROVIDER_DEFINITIONS[provider];

  if (!definition) return false;

  const requiredFields = definition.fields.filter((f) => f.required).map((f) => f.key);

  // Verificar si está configurado en BD
  if (config && config.isEnabled && config.isConfigured) {
    return true;
  }

  // Verificar si está configurado via variables de entorno
  return requiredFields.every((key) => {
    const envValue = process.env[key];
    return envValue && envValue.length > 0;
  });
};

export interface IApiConfigModel extends Model<IApiConfig> {
  initializeProviders(): Promise<void>;
  getConfigWithFallback(provider: ApiProvider): Promise<Record<string, string>>;
  isProviderAvailable(provider: ApiProvider): Promise<boolean>;
}

export const ApiConfig: IApiConfigModel = mongoose.model<IApiConfig, IApiConfigModel>(
  'ApiConfig',
  apiConfigSchema
);

export default ApiConfig;
