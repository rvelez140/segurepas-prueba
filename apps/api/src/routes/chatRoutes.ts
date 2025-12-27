import { Router } from "express";
import {
  getUserChats,
  getChatMessages,
  sendMessage,
  getOrCreateChat,
  markMessagesAsRead,
} from "../controllers/chatController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// # Rutas de chat

// Obtener chats del usuario
router.get("/chats/user/:userId", authMiddleware, getUserChats);

// Obtener mensajes de un chat
router.get("/chats/:chatId/messages", authMiddleware, getChatMessages);

// Enviar mensaje
router.post("/chats/messages", authMiddleware, sendMessage);

// Crear o obtener chat
router.post("/chats", authMiddleware, getOrCreateChat);

// Marcar mensajes como leídos
router.patch("/chats/:chatId/read", authMiddleware, markMessagesAsRead);

export default router;
