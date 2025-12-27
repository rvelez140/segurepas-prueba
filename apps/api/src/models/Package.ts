import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  residentId: mongoose.Types.ObjectId;
  residentName: string;
  apartment: string;
  courier: string;
  trackingNumber?: string;
  description: string;
  size: "small" | "medium" | "large";
  status: "pending" | "picked_up";
  receivedBy: string;
  receivedDate: Date;
  pickedUpBy?: string;
  pickedUpDate?: Date;
  signature?: string;
  photo?: string;
  notes?: string;
}

const PackageSchema: Schema = new Schema(
  {
    residentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    residentName: { type: String, required: true },
    apartment: { type: String, required: true },
    courier: { type: String, required: true },
    trackingNumber: { type: String },
    description: { type: String, required: true },
    size: { type: String, enum: ["small", "medium", "large"], default: "medium" },
    status: { type: String, enum: ["pending", "picked_up"], default: "pending" },
    receivedBy: { type: String, required: true },
    receivedDate: { type: Date, default: Date.now },
    pickedUpBy: { type: String },
    pickedUpDate: { type: Date },
    signature: { type: String },
    photo: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

PackageSchema.index({ residentId: 1, status: 1 });
PackageSchema.index({ status: 1, receivedDate: -1 });

export default mongoose.model<IPackage>("Package", PackageSchema);
