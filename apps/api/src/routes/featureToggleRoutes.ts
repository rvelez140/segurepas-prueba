import { Router } from 'express';
import {
  getAllFeatures,
  getFeaturesByCategory,
  getFeatureByKey,
  createFeature,
  updateFeature,
  deleteFeature,
  toggleFeature,
  checkFeature,
  getMyEnabledFeatures,
  enableForRole,
  disableForRole,
  initializeDefaultFeatures
} from '../controllers/featureToggleController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rutas públicas (requieren autenticación)
router.get('/my-features', authMiddleware, getMyEnabledFeatures);
router.get('/check/:key', authMiddleware, checkFeature);

// Rutas de administración (solo para admins)
router.get('/', authMiddleware, roleMiddleware(['admin']), getAllFeatures);
router.get('/category/:category', authMiddleware, roleMiddleware(['admin']), getFeaturesByCategory);
router.get('/:key', authMiddleware, roleMiddleware(['admin']), getFeatureByKey);
router.post('/', authMiddleware, roleMiddleware(['admin']), createFeature);
router.put('/:key', authMiddleware, roleMiddleware(['admin']), updateFeature);
router.delete('/:key', authMiddleware, roleMiddleware(['admin']), deleteFeature);
router.post('/:key/toggle', authMiddleware, roleMiddleware(['admin']), toggleFeature);
router.post('/:key/enable-role', authMiddleware, roleMiddleware(['admin']), enableForRole);
router.post('/:key/disable-role', authMiddleware, roleMiddleware(['admin']), disableForRole);
router.post('/initialize', authMiddleware, roleMiddleware(['admin']), initializeDefaultFeatures);

export default router;
