import { Router } from 'express';
import { visitController } from '../controllers/visitController';
import { upload } from '../middlewares/uploadMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Realiza una consulta de todas las visitass
router.get('/visits', authMiddleware, roleMiddleware(['admin']), visitController.getAllVisits);

// Genera un reporte de visitas (Admin)
router.get(
  '/visits/report',
  authMiddleware,
  roleMiddleware(['admin']),
  visitController.generateReport
);

// Autoriza [crea] una visita (Residente)
router.post(
  '/visits/authorize',
  authMiddleware,
  roleMiddleware(['residente', 'admin']),
  visitController.authorizeVisit
);

// Envia un Email de confirmación al residente autorizador sobre la autorización de visita
router.post(
  '/visits/notify/:id',
  authMiddleware,
  roleMiddleware(['admin', 'residente']),
  visitController.notifyVisit
);

// Registra y valida la entrada de una visita (Guardia)
router.put(
  '/visits/entry',
  authMiddleware,
  roleMiddleware(['guardia', 'admin']),
  visitController.registerEntry
);

// Registra y valida la salida de una visita (Guardia)
router.put(
  '/visits/exit',
  authMiddleware,
  roleMiddleware(['guardia', 'admin']),
  visitController.registerExit
);

// Realiza una consulta una visita por su QR ID
router.get(
  '/visits/qr/:qrId',
  authMiddleware,
  roleMiddleware(['guardia', 'admin']),
  visitController.getVisitByQR
);

// Realizar una consulta de las visitas de un residente (unica por documento)
router.get(
  '/visits/resident/document/:residentId',
  authMiddleware,
  roleMiddleware(['residente', 'admin']),
  visitController.getVisitsByResidentGroupedByDocument
);

// Realiza una consulta de todas las visitas de un residente
router.get(
  '/visits/resident/:residentId',
  authMiddleware,
  roleMiddleware(['residente', 'admin']),
  visitController.getVisitsByResident
);

// Realiza una consulta de todas las visitas registradas por un guardia
router.get(
  '/visits/guard/:guardId',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  visitController.getVisitsByGuard
);

// Realiza una consulta todas las ultimas visitas por su documento unico
router.get(
  '/visits/document',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  visitController.getAllLatestVisitsGroupedByDocument
);

// Realiza una consulta de la ultima visita por su documento
router.get(
  '/visits/document/:document',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  visitController.getLatestVisitByDocument
);

// Procesamiento de imagen con OCR
router.post(
  '/visits/ocr/process',
  authMiddleware,
  roleMiddleware(['admin', 'guardia', 'residente']),
  upload.single('image'),
  visitController.processImageOCR
);

// Subida de imagen de visita con OCR
router.post(
  '/visits/ocr/upload-visit/:document',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  upload.single('image'),
  visitController.uploadVisitImageWithOCR
);

// Subida de imagen de vehiculo con OCR
router.post(
  '/visits/ocr/upload-vehicle/:document',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  upload.single('image'),
  visitController.uploadVehicleImageWithOCR
);

// Subida de imagen de visita
router.post(
  '/visits/upload-visit/:document',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  upload.single('image'),
  visitController.uploadVisitImage
);

// Subida de imagen de vehiculo
router.post(
  '/visits/upload-vehicle/:document',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  upload.single('image'),
  visitController.uploadVehicleImage
);

// Eliminacion de todas las imagenes de cloudinary (eliminacion de folder 'visits')
router.delete(
  '/visits/upload',
  authMiddleware,
  roleMiddleware(['admin']),
  visitController.deleteAllVisitsImages
);

// Eliminacion de ambas imagenes (profile / vehiculo) de visita
router.delete(
  '/visits/upload/:document',
  authMiddleware,
  roleMiddleware(['admin']),
  visitController.deleteVisitImage
);

// Realiza una consulta de una visita por su id
router.get(
  '/visits/:id',
  authMiddleware,
  roleMiddleware(['admin', 'guardia', 'residente']),
  visitController.getVisitById
);

// Elimina a una visita por su id
router.delete(
  '/visits/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  visitController.deleteVisit
);

// Cambia el estado de una visita por su id
router.patch(
  '/visits/:id',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  visitController.updateVisitStatus
);

// Actualiza un visita por su documento (Actualiza todas las visitas con el mismo documento)
router.put(
  '/visits/:document',
  authMiddleware,
  roleMiddleware(['admin']),
  visitController.updateVisit
);

export default router;
