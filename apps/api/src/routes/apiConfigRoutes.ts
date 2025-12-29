import { Router } from 'express';
import { apiConfigController } from '../controllers/apiConfigController';
import { authMiddleware, authorize } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authMiddleware);
router.use(authorize('admin'));

// Obtener todas las configuraciones
router.get('/', apiConfigController.getAllConfigs.bind(apiConfigController));

// Obtener estado de todos los proveedores
router.get('/status', apiConfigController.getProvidersStatus.bind(apiConfigController));

// Inicializar proveedores en la base de datos
router.post('/initialize', apiConfigController.initializeProviders.bind(apiConfigController));

// Limpiar caché
router.post('/clear-cache', apiConfigController.clearCache.bind(apiConfigController));

// Obtener configuración de un proveedor específico
router.get('/:provider', apiConfigController.getConfig.bind(apiConfigController));

// Actualizar configuración de un proveedor
router.put('/:provider', apiConfigController.updateConfig.bind(apiConfigController));

// Habilitar/deshabilitar proveedor
router.patch('/:provider/toggle', apiConfigController.toggleProvider.bind(apiConfigController));

// Probar conexión de un proveedor
router.post('/:provider/test', apiConfigController.testConnection.bind(apiConfigController));

export default router;
