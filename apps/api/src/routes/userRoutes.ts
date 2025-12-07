import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { userController } from '../controllers/userController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Rutas de usuarios
router.get('/residents', userController.getResidents);
router.get('/guards', userController.getGuards);
router.get('/admins', userController.getAdmins);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Rutas de subida de imágenes de usuarios
router.post('/users/:id/upload-document', upload.single('image'), userController.uploadDocumentImage);
router.post('/users/:id/upload-vehicle-plate', upload.single('image'), userController.uploadVehiclePlateImage);
router.delete('/users/:id/upload', userController.deleteUserImages);

export default router;