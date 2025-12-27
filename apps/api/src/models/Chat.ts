import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: string;
  message: string;
  type: "text" | "image" | "system";
  read: boolean;
  timestamp: Date;
  imageUrl?: string;
}

export interface IChat extends Document {
  participants: Array<{
    userId: mongoose.Types.ObjectId;
    name: string;
    role: string;
    avatar?: string;
  }>;
  lastMessage?: {
    message: string;
    timestamp: Date;
  };
  unreadCount: number;
}

const MessageSchema: Schema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "system"], default: "text" },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

const ChatSchema: Schema = new Schema(
  {
    participants: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        role: { type: String, required: true },
        avatar: { type: String },
      },
    ],
    lastMessage: {
      message: { type: String },
      timestamp: { type: Date },
    },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, timestamp: -1 });
ChatSchema.index({ "participants.userId": 1, updatedAt: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
export const Chat = mongoose.model<IChat>("Chat", ChatSchema);
