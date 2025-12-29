import { Request, Response } from 'express';
import { apiConfigService } from '../services/ApiConfigService';
import { ApiProvider } from '../interfaces/IApiConfig';

export class ApiConfigController {
  /**
   * Obtiene todas las configuraciones de APIs
   */
  async getAllConfigs(_req: Request, res: Response): Promise<void> {
    try {
      const configs = await apiConfigService.getAllConfigs();
      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuraciones',
        error: errorMessage,
      });
    }
  }

  /**
   * Obtiene el estado de todos los proveedores
   */
  async getProvidersStatus(_req: Request, res: Response): Promise<void> {
    try {
      const statuses = await apiConfigService.getProvidersStatus();
      res.status(200).json({
        success: true,
        data: statuses,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al obtener estado de proveedores',
        error: errorMessage,
      });
    }
  }

  /**
   * Obtiene la configuración de un proveedor específico
   */
  async getConfig(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;

      if (!Object.values(ApiProvider).includes(provider as ApiProvider)) {
        res.status(400).json({
          success: false,
          message: 'Proveedor no válido',
        });
        return;
      }

      const config = await apiConfigService.getConfig(provider as ApiProvider);

      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al obtener configuración',
        error: errorMessage,
      });
    }
  }

  /**
   * Actualiza la configuración de un proveedor
   */
  async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      const { fields, isEnabled } = req.body;

      if (!Object.values(ApiProvider).includes(provider as ApiProvider)) {
        res.status(400).json({
          success: false,
          message: 'Proveedor no válido',
        });
        return;
      }

      if (!fields || !Array.isArray(fields)) {
        res.status(400).json({
          success: false,
          message: 'Se requiere un array de campos',
        });
        return;
      }

      const config = await apiConfigService.updateConfig(
        provider as ApiProvider,
        fields,
        isEnabled
      );

      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Configuración actualizada correctamente',
        data: config,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al actualizar configuración',
        error: errorMessage,
      });
    }
  }

  /**
   * Habilita o deshabilita un proveedor
   */
  async toggleProvider(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;
      const { isEnabled } = req.body;

      if (!Object.values(ApiProvider).includes(provider as ApiProvider)) {
        res.status(400).json({
          success: false,
          message: 'Proveedor no válido',
        });
        return;
      }

      if (typeof isEnabled !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'isEnabled debe ser un valor booleano',
        });
        return;
      }

      const config = await apiConfigService.toggleProvider(provider as ApiProvider, isEnabled);

      if (!config) {
        res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: `Proveedor ${isEnabled ? 'habilitado' : 'deshabilitado'} correctamente`,
        data: config,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al cambiar estado del proveedor',
        error: errorMessage,
      });
    }
  }

  /**
   * Prueba la conexión de un proveedor
   */
  async testConnection(req: Request, res: Response): Promise<void> {
    try {
      const { provider } = req.params;

      if (!Object.values(ApiProvider).includes(provider as ApiProvider)) {
        res.status(400).json({
          success: false,
          message: 'Proveedor no válido',
        });
        return;
      }

      const result = await apiConfigService.testConnection(provider as ApiProvider);

      res.status(result.success ? 200 : 400).json({
        success: result.success,
        message: result.message,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al probar conexión',
        error: errorMessage,
      });
    }
  }

  /**
   * Inicializa los proveedores en la base de datos
   */
  async initializeProviders(_req: Request, res: Response): Promise<void> {
    try {
      await apiConfigService.initializeProviders();
      res.status(200).json({
        success: true,
        message: 'Proveedores inicializados correctamente',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al inicializar proveedores',
        error: errorMessage,
      });
    }
  }

  /**
   * Limpia la caché de configuración
   */
  async clearCache(_req: Request, res: Response): Promise<void> {
    try {
      apiConfigService.clearCache();
      res.status(200).json({
        success: true,
        message: 'Caché limpiada correctamente',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({
        success: false,
        message: 'Error al limpiar caché',
        error: errorMessage,
      });
    }
  }
}

export const apiConfigController = new ApiConfigController();
export default apiConfigController;
