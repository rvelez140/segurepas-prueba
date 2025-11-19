import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Todas las rutas requieren autenticación de admin
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// ==========================================
// GESTIÓN DE MÓDULOS/FEATURES
// ==========================================

// Obtener módulos de una empresa
router.get('/companies/:companyId/modules', adminController.getCompanyModules);

// Habilitar módulo
router.post('/companies/:companyId/modules/:module/enable', adminController.enableModule);

// Deshabilitar módulo
router.post('/companies/:companyId/modules/:module/disable', adminController.disableModule);

// Configurar módulo
router.put('/companies/:companyId/modules/:module/config', adminController.configureModule);

// ==========================================
// AUDITORÍA
// ==========================================

// Obtener logs de auditoría
router.get('/audit/logs', adminController.getAuditLogs);

// Obtener estadísticas de auditoría
router.get('/audit/stats', adminController.getAuditStats);

// Exportar logs de auditoría
router.get('/audit/export', adminController.exportAuditLogs);

// ==========================================
// IMPERSONACIÓN
// ==========================================

// Generar token para impersonar empresa
router.post('/companies/:companyId/impersonate', adminController.impersonateCompany);

// Finalizar impersonación
router.post('/impersonate/end', adminController.endImpersonation);

// ==========================================
// DASHBOARD
// ==========================================

// Dashboard de super admin
router.get('/dashboard', adminController.getDashboard);

export default router;
