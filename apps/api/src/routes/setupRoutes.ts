import { Router, Request, Response } from 'express';
import { setupService } from '../services/SetupService';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route GET /setup/status
 * @desc Obtiene el estado actual del setup
 * @access Public (para verificar si necesita configuración)
 */
router.get('/status', async (_req: Request, res: Response) => {
  try {
    const status = await setupService.getStatus();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route GET /setup/needs-wizard
 * @desc Verifica si necesita mostrar el wizard de configuración
 * @access Public
 */
router.get('/needs-wizard', async (_req: Request, res: Response) => {
  try {
    const needsWizard = await setupService.needsSetupWizard();
    const isTemporaryAdmin = await setupService.isTemporaryAdminActive();

    res.json({
      needsWizard,
      needsAdminCreation: !needsWizard && isTemporaryAdmin,
    });
  } catch (error: any) {
    // Si hay error de conexión, probablemente necesita setup
    res.json({
      needsWizard: true,
      needsAdminCreation: false,
      error: error.message,
    });
  }
});

/**
 * @route POST /setup/test-database
 * @desc Prueba la conexión a la base de datos
 * @access Public (solo durante setup)
 */
router.post('/test-database', async (req: Request, res: Response) => {
  try {
    const { host, port, database, username, password } = req.body;

    if (!host || !database) {
      return res.status(400).json({
        success: false,
        message: 'Host y nombre de base de datos son requeridos',
      });
    }

    const result = await setupService.testDatabaseConnection({
      host,
      port: port || 27017,
      database,
      username: username || '',
      password: password || '',
      useDocker: false,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route POST /setup/install-mongodb
 * @desc Instala MongoDB usando Docker
 * @access Public (solo durante setup)
 */
router.post('/install-mongodb', async (req: Request, res: Response) => {
  try {
    const { port, database, username, password } = req.body;

    const result = await setupService.installMongoDBDocker({
      host: 'localhost',
      port: port || 27017,
      database: database || 'securepass',
      username: username || '',
      password: password || '',
      useDocker: true,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route POST /setup/complete
 * @desc Completa la configuración inicial
 * @access Public (solo durante setup inicial)
 */
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const { database, apis } = req.body;

    if (!database || !database.host || !database.database) {
      return res.status(400).json({
        success: false,
        message: 'Configuración de base de datos es requerida',
      });
    }

    const result = await setupService.completeSetup({
      database,
      apis,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route GET /setup/apis
 * @desc Obtiene los proveedores de API disponibles
 * @access Public (durante setup)
 */
router.get('/apis', async (_req: Request, res: Response) => {
  try {
    const apis = await setupService.getAvailableApis();
    res.json(apis);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route POST /setup/create-admin
 * @desc Crea el usuario administrador permanente
 * @access Authenticated (con admin temporal)
 */
router.post('/create-admin', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    // Validaciones
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña y nombre son requeridos',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido',
      });
    }

    const result = await setupService.createPermanentAdmin({
      email,
      password,
      name,
      username,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @route GET /setup/temporary-admin-active
 * @desc Verifica si el admin temporal está activo
 * @access Public
 */
router.get('/temporary-admin-active', async (_req: Request, res: Response) => {
  try {
    const isActive = await setupService.isTemporaryAdminActive();
    res.json({ isActive });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
