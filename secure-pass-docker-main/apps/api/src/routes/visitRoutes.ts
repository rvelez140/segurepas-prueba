import { Router } from 'express';
import { visitController } from '../controllers/visitController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Realiza una consulta de todas las visitass
router.get('/visits', visitController.getAllVisits);

// Genera un reporte de visitas (Admin)
router.get('/visits/report', visitController.generateReport);

// Autoriza [crea] una visita (Residente)
router.post('/visits/authorize', visitController.authorizeVisit);

// Envia un Email de confirmación al residente autorizador sobre la autorización de visita
router.post('/visits/notify/:id', visitController.notifyVisit);

// Registra y valida la entrada de una visita (Guardia)
router.put('/visits/entry', visitController.registerEntry);

// Registra y valida la salida de una visita (Guardia)
router.put('/visits/exit', visitController.registerExit);

// Realiza una consulta una visita por su QR ID
router.get('/visits/qr/:qrId', visitController.getVisitByQR);

// Realizar una consulta de las visitas de un residente (unica por documento)
router.get(
  '/visits/resident/document/:residentId',
  visitController.getVisitsByResidentGroupedByDocument
);

// Realiza una consulta de todas las visitas de un residente
router.get('/visits/resident/:residentId', visitController.getVisitsByResident);

// Realiza una consulta de todas las visitas registradas por un guardia
router.get('/visits/guard/:guardId', visitController.getVisitsByGuard);

// Realiza una consulta todas las ultimas visitas por su documento unico
router.get('/visits/document', visitController.getAllLatestVisitsGroupedByDocument);

// Realiza una consulta de la ultima visita por su documento
router.get('/visits/document/:document', visitController.getLatestVisitByDocument);

// Subida de imagen de visita
router.post(
  '/visits/upload-visit/:document',
  upload.single('image'),
  visitController.uploadVisitImage
);

// Subida de imagen de vehiculo
router.post(
  '/visits/upload-vehicle/:document',
  upload.single('image'),
  visitController.uploadVehicleImage
);

// Eliminacion de todas las imagenes de cloudinary (eliminacion de folder 'visits')
router.delete('/visits/upload', visitController.deleteAllVisitsImages);

// Eliminacion de ambas imagenes (profile / vehiculo) de visita
router.delete('/visits/upload/:document', visitController.deleteVisitImage);

// Realiza una consulta de una visita por su id
router.get('/visits/:id', visitController.getVisitById);

// Elimina a una visita por su id
router.delete('/visits/:id', visitController.deleteVisit);

// Cambia el estado de una visita por su id
router.patch('/visits/:id', visitController.updateVisitStatus);

// Actualiza un visita por su documento (Actualiza todas las visitas con el mismo documento)
router.put('/visits/:document', visitController.updateVisit);

export default router;
