import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  type: "meeting" | "social" | "maintenance" | "other";
  organizer: string;
  maxAttendees?: number;
  attendees: mongoose.Types.ObjectId[];
  status: "upcoming" | "ongoing" | "completed" | "canceled";
  agenda?: string;
  photo?: string;
}

const EventSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["meeting", "social", "maintenance", "other"],
      default: "other",
    },
    organizer: { type: String, required: true },
    maxAttendees: { type: Number },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "canceled"],
      default: "upcoming",
    },
    agenda: { type: String },
    photo: { type: String },
  },
  { timestamps: true }
);

EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ status: 1, date: -1 });

export default mongoose.model<IEvent>("Event", EventSchema);
