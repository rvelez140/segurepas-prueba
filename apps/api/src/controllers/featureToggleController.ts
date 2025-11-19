import { Request, Response } from 'express';
import FeatureToggleService from '../services/FeatureToggleService';

/**
 * Obtener todas las features
 */
export const getAllFeatures = async (req: Request, res: Response) => {
  try {
    const features = await FeatureToggleService.getAllFeatures();
    res.json(features);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener features por categoría
 */
export const getFeaturesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const features = await FeatureToggleService.getFeaturesByCategory(category);
    res.json(features);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener una feature por key
 */
export const getFeatureByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const feature = await FeatureToggleService.getFeatureByKey(key);

    if (!feature) {
      return res.status(404).json({ error: 'Feature no encontrada' });
    }

    res.json(feature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Crear una nueva feature
 */
export const createFeature = async (req: Request, res: Response) => {
  try {
    const { key, name, description, enabled, enabledForRoles, enabledForUsers, category, metadata } = req.body;

    if (!key || !name || !description) {
      return res.status(400).json({
        error: 'Los campos key, name y description son requeridos'
      });
    }

    // Verificar si ya existe
    const existingFeature = await FeatureToggleService.getFeatureByKey(key);
    if (existingFeature) {
      return res.status(409).json({
        error: 'Ya existe una feature con ese key'
      });
    }

    const feature = await FeatureToggleService.createFeature({
      key,
      name,
      description,
      enabled,
      enabledForRoles,
      enabledForUsers,
      category,
      metadata
    });

    res.status(201).json(feature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualizar una feature
 */
export const updateFeature = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const updates = req.body;

    // No permitir actualizar el key
    delete updates.key;

    const feature = await FeatureToggleService.updateFeature(key, updates);

    if (!feature) {
      return res.status(404).json({ error: 'Feature no encontrada' });
    }

    res.json(feature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Eliminar una feature
 */
export const deleteFeature = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const deleted = await FeatureToggleService.deleteFeature(key);

    if (!deleted) {
      return res.status(404).json({ error: 'Feature no encontrada' });
    }

    res.json({ message: 'Feature eliminada correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Toggle (activar/desactivar) una feature
 */
export const toggleFeature = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const feature = await FeatureToggleService.toggleFeature(key);

    if (!feature) {
      return res.status(404).json({ error: 'Feature no encontrada' });
    }

    res.json(feature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verificar si una feature está habilitada para el usuario actual
 */
export const checkFeature = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const user = (req as any).user; // Usuario del middleware de auth

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const isEnabled = await FeatureToggleService.isFeatureEnabledForUser(
      key,
      user.id,
      user.role
    );

    res.json({ enabled: isEnabled });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtener todas las features habilitadas para el usuario actual
 */
export const getMyEnabledFeatures = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // Usuario del middleware de auth

    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const enabledFeatures = await FeatureToggleService.getEnabledFeaturesForUser(
      user.id,
      user.role
    );

    res.json({ features: enabledFeatures });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Habilitar feature para un rol
 */
export const enableForRole = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'El campo role es requerido' });
    }

    const validRoles = ['admin', 'guardia', 'residente'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        error: `Rol inválido. Roles válidos: ${validRoles.join(', ')}`
      });
    }

    const feature = await FeatureToggleService.enableForRole(key, role);

    if (!feature) {
      return res.status(404).json({ error: 'Feature no encontrada' });
    }

    res.json(feature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deshabilitar feature para un rol
 */
export const disableForRole = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'El campo role es requerido' });
    }

    const feature = await FeatureToggleService.disableForRole(key, role);

    if (!feature) {
      return res.status(404).json({ error: 'Feature no encontrada' });
    }

    res.json(feature);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Inicializar features por defecto
 */
export const initializeDefaultFeatures = async (req: Request, res: Response) => {
  try {
    await FeatureToggleService.initializeDefaultFeatures();
    res.json({ message: 'Features por defecto inicializadas correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
