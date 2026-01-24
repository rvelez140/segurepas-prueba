import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { userController } from '../controllers/userController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// Rutas de usuarios
router.get(
  '/residents',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  userController.getResidents
);
router.get(
  '/guards',
  authMiddleware,
  roleMiddleware(['admin', 'guardia']),
  userController.getGuards
);
router.get('/admins', authMiddleware, roleMiddleware(['admin']), userController.getAdmins);
router.get('/users', authMiddleware, roleMiddleware(['admin']), userController.getAllUsers);
router.get('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.getUser);
router.put('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.updateUser);
router.delete('/users/:id', authMiddleware, roleMiddleware(['admin']), userController.deleteUser);

// Rutas de subida de imágenes de usuarios
router.post(
  '/users/:id/upload-document',
  authMiddleware,
  roleMiddleware(['admin']),
  upload.single('image'),
  userController.uploadDocumentImage
);
router.post(
  '/users/:id/upload-vehicle-plate',
  authMiddleware,
  roleMiddleware(['admin']),
  upload.single('image'),
  userController.uploadVehiclePlateImage
);
router.delete(
  '/users/:id/upload',
  authMiddleware,
  roleMiddleware(['admin']),
  userController.deleteUserImages
);

export default router;
