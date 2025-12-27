import { Request, Response } from "express";
import { Chat, Message } from "../models/Chat";
import User from "../models/User";

// Obtener chats del usuario
export const getUserChats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      "participants.userId": userId,
    }).sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener chats" });
  }
};

// Obtener mensajes de un chat
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mensajes" });
  }
};

// Enviar mensaje
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { chatId, message, type, imageUrl } = req.body;
    const { user } = req as any;

    const newMessage = new Message({
      chatId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      message,
      type: type || "text",
      imageUrl,
    });

    await newMessage.save();

    // Actualizar chat con último mensaje
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        message,
        timestamp: newMessage.timestamp,
      },
      $inc: { unreadCount: 1 },
      updatedAt: new Date(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
};

// Crear o obtener chat
export const getOrCreateChat = async (req: Request, res: Response) => {
  try {
    const { userId, otherUserId } = req.body;

    // Buscar chat existente
    let chat = await Chat.findOne({
      $and: [
        { "participants.userId": userId },
        { "participants.userId": otherUserId },
      ],
    });

    if (chat) {
      return res.json(chat);
    }

    // Crear nuevo chat
    const user1 = await User.findById(userId);
    const user2 = await User.findById(otherUserId);

    if (!user1 || !user2) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    chat = new Chat({
      participants: [
        {
          userId: user1._id,
          name: user1.name,
          role: user1.role,
        },
        {
          userId: user2._id,
          name: user2.name,
          role: user2.role,
        },
      ],
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Error al crear chat" });
  }
};

// Marcar mensajes como leídos
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { user } = req as any;

    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: user.id },
        read: false,
      },
      { read: true }
    );

    await Chat.findByIdAndUpdate(chatId, { unreadCount: 0 });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al marcar mensajes" });
  }
};
