import mongoose, { Schema, Model } from 'mongoose';
import crypto from 'crypto';
import { ISetupConfig, SetupStatus } from '../interfaces/ISetupConfig';

// Clave de encriptación para credenciales
const ENCRYPTION_KEY = process.env.API_CONFIG_ENCRYPTION_KEY || 'default-encryption-key-32chars!!';
const ENCRYPTION_IV_LENGTH = 16;

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

const databaseConfigSchema = new Schema(
  {
    host: { type: String, default: 'localhost' },
    port: { type: Number, default: 27017 },
    database: { type: String, default: 'securepass' },
    username: { type: String, default: '' },
    password: { type: String, default: '' },
    useDocker: { type: Boolean, default: false },
  },
  { _id: false }
);

const setupConfigSchema: Schema = new Schema(
  {
    status: {
      type: String,
      enum: Object.values(SetupStatus),
      default: SetupStatus.PENDING,
    },
    databaseConfigured: {
      type: Boolean,
      default: false,
    },
    apisConfigured: {
      type: Boolean,
      default: false,
    },
    adminCreated: {
      type: Boolean,
      default: false,
    },
    temporaryAdminActive: {
      type: Boolean,
      default: true,
    },
    databaseConfig: {
      type: databaseConfigSchema,
      default: () => ({}),
    },
    installedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        // Ocultar password en la respuesta
        if (ret.databaseConfig && ret.databaseConfig.password) {
          ret.databaseConfig.password = '********';
        }
        return ret;
      },
    },
  }
);

// Encriptar password antes de guardar
setupConfigSchema.pre('save', function (next) {
  const config = this as unknown as ISetupConfig;
  if (config.databaseConfig && config.databaseConfig.password) {
    if (!config.databaseConfig.password.includes(':')) {
      config.databaseConfig.password = encrypt(config.databaseConfig.password);
    }
  }
  next();
});

// Método para obtener el password desencriptado
setupConfigSchema.methods.getDecryptedPassword = function (): string {
  if (this.databaseConfig && this.databaseConfig.password) {
    return decrypt(this.databaseConfig.password);
  }
  return '';
};

// Método para obtener la URI de MongoDB
setupConfigSchema.methods.getMongoURI = function (): string {
  const config = this.databaseConfig;
  if (!config) return '';

  const password = decrypt(config.password);
  if (config.username && password) {
    return `mongodb://${config.username}:${password}@${config.host}:${config.port}/${config.database}?authSource=admin`;
  }
  return `mongodb://${config.host}:${config.port}/${config.database}`;
};

// Método estático para obtener o crear la configuración
setupConfigSchema.statics.getOrCreate = async function (): Promise<ISetupConfig> {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

// Método estático para verificar si el setup está completado
setupConfigSchema.statics.isSetupComplete = async function (): Promise<boolean> {
  const config = await this.findOne();
  return config?.status === SetupStatus.COMPLETED && config?.adminCreated === true;
};

// Método estático para verificar si necesita crear admin
setupConfigSchema.statics.needsAdminCreation = async function (): Promise<boolean> {
  const config = await this.findOne();
  return config?.status === SetupStatus.COMPLETED && config?.adminCreated === false;
};

export interface ISetupConfigModel extends Model<ISetupConfig> {
  getOrCreate(): Promise<ISetupConfig>;
  isSetupComplete(): Promise<boolean>;
  needsAdminCreation(): Promise<boolean>;
}

export const SetupConfig: ISetupConfigModel = mongoose.model<ISetupConfig, ISetupConfigModel>(
  'SetupConfig',
  setupConfigSchema
);

export default SetupConfig;
