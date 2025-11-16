import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { userController } from '../controllers/userController';

const router = Router();

// Rutas de usuarios
router.get('/residents', userController.getResidents);
router.get('/guards', userController.getGuards);
router.get('/admins', userController.getAdmins);
router.get('/users', userController.getAllUsers);
router.get('/users-with-roles', userController.getAllUsersWithRoles);
router.get('/users/:id', userController.getUser);
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/assign-role', authMiddleware, roleMiddleware(['admin']), userController.assignRoleToUser);
router.delete('/users/:id', userController.deleteUser);

export default router;