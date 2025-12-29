import { exec } from 'child_process';
import { promisify } from 'util';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { SetupConfig } from '../models/SetupConfig';
import { SetupStatus, IDatabaseConfig, ISetupInput } from '../interfaces/ISetupConfig';
import { ApiConfig } from '../models/ApiConfig';
import { User } from '../models/User';

const execAsync = promisify(exec);

class SetupService {
  /**
   * Obtiene el estado actual del setup
   */
  async getStatus() {
    try {
      const config = await SetupConfig.getOrCreate();
      return {
        status: config.status,
        databaseConfigured: config.databaseConfigured,
        apisConfigured: config.apisConfigured,
        adminCreated: config.adminCreated,
        temporaryAdminActive: config.temporaryAdminActive,
        installedAt: config.installedAt,
        completedAt: config.completedAt,
      };
    } catch (error) {
      // Si no hay conexión a la base de datos, retornamos estado pendiente
      return {
        status: SetupStatus.PENDING,
        databaseConfigured: false,
        apisConfigured: false,
        adminCreated: false,
        temporaryAdminActive: false,
        installedAt: null,
        completedAt: null,
        needsSetup: true,
      };
    }
  }

  /**
   * Prueba la conexión a la base de datos
   */
  async testDatabaseConnection(dbConfig: IDatabaseConfig): Promise<{ success: boolean; message: string }> {
    let testConnection: typeof mongoose | null = null;

    try {
      const uri = this.buildMongoURI(dbConfig);

      // Crear conexión temporal para probar
      testConnection = await mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      }).asPromise();

      await testConnection.close();

      return {
        success: true,
        message: 'Conexión exitosa a la base de datos',
      };
    } catch (error: any) {
      if (testConnection) {
        await testConnection.close().catch(() => {});
      }

      let message = 'Error al conectar con la base de datos';

      if (error.message.includes('ECONNREFUSED')) {
        message = 'No se pudo conectar al servidor de MongoDB. Verifica que esté ejecutándose.';
      } else if (error.message.includes('Authentication failed')) {
        message = 'Credenciales incorrectas. Verifica el usuario y contraseña.';
      } else if (error.message.includes('ETIMEDOUT')) {
        message = 'Tiempo de espera agotado. Verifica la dirección del servidor.';
      }

      return {
        success: false,
        message,
      };
    }
  }

  /**
   * Construye la URI de MongoDB
   */
  private buildMongoURI(dbConfig: IDatabaseConfig): string {
    const { host, port, database, username, password } = dbConfig;

    if (username && password) {
      return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}?authSource=admin`;
    }
    return `mongodb://${host}:${port}/${database}`;
  }

  /**
   * Instala MongoDB usando Docker
   */
  async installMongoDBDocker(dbConfig: IDatabaseConfig): Promise<{ success: boolean; message: string; containerId?: string }> {
    try {
      // Verificar si Docker está instalado
      try {
        await execAsync('docker --version');
      } catch {
        return {
          success: false,
          message: 'Docker no está instalado en el sistema. Por favor, instala Docker primero.',
        };
      }

      // Verificar si ya existe un contenedor de MongoDB
      const { stdout: existingContainers } = await execAsync(
        'docker ps -a --filter "name=securepass-mongodb-setup" --format "{{.ID}}"'
      );

      if (existingContainers.trim()) {
        // Eliminar contenedor existente
        await execAsync(`docker rm -f securepass-mongodb-setup`);
      }

      const password = dbConfig.password || this.generateRandomPassword();
      const username = dbConfig.username || 'securepass_admin';
      const port = dbConfig.port || 27017;

      // Crear y ejecutar contenedor de MongoDB
      const { stdout: containerId } = await execAsync(`
        docker run -d \
          --name securepass-mongodb-setup \
          -e MONGO_INITDB_ROOT_USERNAME=${username} \
          -e MONGO_INITDB_ROOT_PASSWORD=${password} \
          -e MONGO_INITDB_DATABASE=${dbConfig.database || 'securepass'} \
          -p ${port}:27017 \
          --restart unless-stopped \
          mongo:7.0
      `);

      // Esperar a que MongoDB esté listo
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          const testResult = await this.testDatabaseConnection({
            ...dbConfig,
            host: 'localhost',
            port,
            username,
            password,
          });

          if (testResult.success) {
            return {
              success: true,
              message: 'MongoDB instalado y configurado correctamente via Docker',
              containerId: containerId.trim(),
            };
          }
        } catch {
          // Ignorar errores durante la espera
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      return {
        success: false,
        message: 'MongoDB se instaló pero no responde. Verifica los logs del contenedor.',
        containerId: containerId.trim(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error al instalar MongoDB: ${error.message}`,
      };
    }
  }

  /**
   * Genera una contraseña aleatoria segura
   */
  private generateRandomPassword(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Completa la configuración inicial
   */
  async completeSetup(input: ISetupInput): Promise<{ success: boolean; message: string; temporaryCredentials?: { email: string; password: string } }> {
    try {
      // Probar conexión a la base de datos
      const dbTest = await this.testDatabaseConnection(input.database);
      if (!dbTest.success) {
        return {
          success: false,
          message: dbTest.message,
        };
      }

      // Obtener o crear configuración
      const config = await SetupConfig.getOrCreate();

      // Guardar configuración de base de datos
      config.databaseConfig = input.database;
      config.databaseConfigured = true;

      // Configurar APIs si se proporcionaron
      if (input.apis && input.apis.length > 0) {
        for (const apiInput of input.apis) {
          const apiConfig = await ApiConfig.findOne({ provider: apiInput.provider });
          if (apiConfig) {
            apiConfig.isEnabled = apiInput.isEnabled;
            for (const field of apiInput.fields) {
              const existingField = apiConfig.fields.find((f) => f.key === field.key);
              if (existingField) {
                existingField.value = field.value;
              }
            }
            await apiConfig.save();
          }
        }
        config.apisConfigured = true;
      }

      // Crear usuario administrador temporal
      const tempPassword = 'SecurePass2024!';
      const tempEmail = 'admin@securepass.local';

      // Verificar si ya existe un admin
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (!existingAdmin) {
        const tempAdmin = new User({
          auth: {
            email: tempEmail,
            password: tempPassword,
            twoFactorEnabled: false,
          },
          name: 'Administrador Temporal',
          role: 'admin',
          registerDate: new Date(),
          updateDate: new Date(),
          lastAccess: new Date(),
        });

        await tempAdmin.save();
      }

      config.status = SetupStatus.COMPLETED;
      config.temporaryAdminActive = true;
      config.adminCreated = false;
      config.installedAt = new Date();

      await config.save();

      return {
        success: true,
        message: 'Configuración inicial completada exitosamente',
        temporaryCredentials: {
          email: tempEmail,
          password: tempPassword,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error al completar la configuración: ${error.message}`,
      };
    }
  }

  /**
   * Crea el usuario administrador definitivo
   */
  async createPermanentAdmin(adminData: {
    email: string;
    password: string;
    name: string;
    username?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const config = await SetupConfig.getOrCreate();

      // Verificar que el setup esté completado
      if (config.status !== SetupStatus.COMPLETED) {
        return {
          success: false,
          message: 'Debe completar la configuración inicial primero',
        };
      }

      // Verificar que el admin temporal esté activo
      if (!config.temporaryAdminActive) {
        return {
          success: false,
          message: 'El administrador ya fue creado',
        };
      }

      // Eliminar el admin temporal
      await User.deleteOne({ 'auth.email': 'admin@securepass.local' });

      // Crear el nuevo administrador
      const newAdmin = new User({
        auth: {
          email: adminData.email,
          username: adminData.username || undefined,
          password: adminData.password,
          twoFactorEnabled: false,
        },
        name: adminData.name,
        role: 'admin',
        registerDate: new Date(),
        updateDate: new Date(),
        lastAccess: new Date(),
      });

      await newAdmin.save();

      // Actualizar configuración
      config.adminCreated = true;
      config.temporaryAdminActive = false;
      config.completedAt = new Date();

      await config.save();

      return {
        success: true,
        message: 'Administrador creado exitosamente',
      };
    } catch (error: any) {
      if (error.code === 11000) {
        return {
          success: false,
          message: 'El email o nombre de usuario ya está en uso',
        };
      }
      return {
        success: false,
        message: `Error al crear el administrador: ${error.message}`,
      };
    }
  }

  /**
   * Obtiene los proveedores de API disponibles para configurar
   */
  async getAvailableApis() {
    try {
      const apis = await ApiConfig.find();
      return apis.map((api) => ({
        provider: api.provider,
        displayName: api.displayName,
        description: api.description,
        isEnabled: api.isEnabled,
        isConfigured: api.isConfigured,
        fields: api.fields.map((field) => ({
          key: field.key,
          label: field.label,
          description: field.description,
          required: field.required,
          isSecret: field.isSecret,
          hasValue: !!field.value,
        })),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Verifica si necesita mostrar el wizard de setup
   */
  async needsSetupWizard(): Promise<boolean> {
    try {
      const config = await SetupConfig.findOne();
      if (!config) return true;
      return config.status === SetupStatus.PENDING;
    } catch {
      return true;
    }
  }

  /**
   * Verifica si el usuario temporal está activo
   */
  async isTemporaryAdminActive(): Promise<boolean> {
    try {
      const config = await SetupConfig.findOne();
      return config?.temporaryAdminActive || false;
    } catch {
      return false;
    }
  }
}

export const setupService = new SetupService();
export default setupService;
