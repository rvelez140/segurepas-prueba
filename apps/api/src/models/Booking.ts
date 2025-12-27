import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  spaceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "canceled" | "completed";
  totalAmount: number;
  attendees: number;
  notes?: string;
}

const BookingSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    spaceId: { type: Schema.Types.ObjectId, ref: "CommonSpace", required: true },
    spaceName: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "pending",
    },
    totalAmount: { type: Number, required: true },
    attendees: { type: Number, default: 1 },
    notes: { type: String },
  },
  { timestamps: true }
);

BookingSchema.index({ spaceId: 1, date: 1 });
BookingSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IBooking>("Booking", BookingSchema);
