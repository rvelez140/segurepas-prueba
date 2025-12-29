import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { getApiConfig, isApiAvailable } from '../utils/apiConfigHelper';
import { ApiProvider } from '../interfaces/IApiConfig';

// Variable para rastrear si ya está configurado
let isConfigured = false;
let lastConfigHash = '';

/**
 * Configura Cloudinary con las credenciales actuales
 */
async function ensureCloudinaryConfig(): Promise<void> {
  const config = await getApiConfig(ApiProvider.CLOUDINARY);

  if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary no está configurado. Configure las credenciales en el panel de administración.');
  }

  // Crear hash de configuración para detectar cambios
  const configHash = `${config.CLOUDINARY_CLOUD_NAME}-${config.CLOUDINARY_API_KEY}`;

  // Solo reconfigurar si ha cambiado
  if (!isConfigured || configHash !== lastConfigHash) {
    cloudinary.config({
      cloud_name: config.CLOUDINARY_CLOUD_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
    lastConfigHash = configHash;
  }
}

export class CloudinaryService {
  /**
   * Verifica si Cloudinary está disponible
   */
  static async isAvailable(): Promise<boolean> {
    return await isApiAvailable(ApiProvider.CLOUDINARY);
  }

  static async uploadImage(buffer: Buffer, folder: string): Promise<string> {
    await ensureCloudinaryConfig();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error('No se pudo obtener la URL de la imagen'));
        }
        resolve(result.secure_url);
      });

      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  static async deleteImage(url: string): Promise<void> {
    await ensureCloudinaryConfig();

    const publicId = url.split('/').pop()?.split('.')[0];
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  }

  static async deleteFolder(folderPath: string): Promise<{
    success: boolean;
    message: string;
    deletedCount?: number;
  }> {
    try {
      await ensureCloudinaryConfig();

      // 1. Eliminar todos los recursos dentro del folder
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 500,
      });

      let deletedCount = 0;

      if (resources.resources && resources.resources.length > 0) {
        const publicIds = resources.resources.map((resource: any) => resource.public_id);
        await cloudinary.api.delete_resources(publicIds);
        deletedCount = publicIds.length;
      }

      // 2. Eliminar el folder (si está vacío)
      await cloudinary.api.delete_folder(folderPath);

      return {
        success: true,
        message: `Folder ${folderPath} eliminado con ${deletedCount} archivos`,
        deletedCount,
      };
    } catch (error: any) {
      console.error(`Error eliminando folder ${folderPath}:`, error);
      return {
        success: false,
        message: `Error al eliminar folder: ${error.message}`,
      };
    }
  }
}
