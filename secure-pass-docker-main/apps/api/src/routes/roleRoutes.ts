import { Router } from 'express';
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  initializeSystem,
} from '../controllers/roleController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de roles
router.get('/roles', getAllRoles);
router.get('/roles/:id', getRoleById);
router.post('/roles', roleMiddleware(['admin']), createRole);
router.put('/roles/:id', roleMiddleware(['admin']), updateRole);
router.delete('/roles/:id', roleMiddleware(['admin']), deleteRole);

// Rutas de permisos
router.get('/permissions', getAllPermissions);

// Ruta para inicializar el sistema (solo admin)
router.post('/initialize', roleMiddleware(['admin']), initializeSystem);

export default router;
