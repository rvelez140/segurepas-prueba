import { Router } from 'express';
import { companyController } from '../controllers/companyController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { tenantMiddleware } from '../middlewares/tenantMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Rutas públicas (sin autenticación)
router.get('/subdomain/:subdomain', companyController.getCompanyBySubdomain);

// Rutas protegidas - Requieren autenticación
router.use(authMiddleware);

// Ruta para obtener la empresa del usuario actual
router.get('/current', tenantMiddleware, companyController.getCurrentCompany);

// Rutas de super-admin - Solo para administradores del sistema
// TODO: Crear rol 'superadmin' para gestión multi-empresa
router.post('/', roleMiddleware(['admin']), companyController.createCompany);
router.get('/', roleMiddleware(['admin']), companyController.getAllCompanies);
router.get('/:id', roleMiddleware(['admin']), companyController.getCompanyById);
router.put('/:id', roleMiddleware(['admin']), companyController.updateCompany);
router.delete('/:id', roleMiddleware(['admin']), companyController.deleteCompany);

// Rutas de gestión de logo
router.post(
  '/:id/logo',
  roleMiddleware(['admin']),
  upload.single('logo'),
  companyController.uploadLogo
);
router.delete('/:id/logo', roleMiddleware(['admin']), companyController.deleteLogo);

// Rutas de suscripción
router.put('/:id/subscription', roleMiddleware(['admin']), companyController.updateSubscription);

export default router;
