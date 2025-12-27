import mongoose, { Schema, Document } from "mongoose";

export interface IVehicle extends Document {
  residentId: mongoose.Types.ObjectId;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  type: "car" | "motorcycle" | "truck";
  parkingSpot?: string;
  isActive: boolean;
}

const VehicleSchema: Schema = new Schema(
  {
    residentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    licensePlate: { type: String, required: true, unique: true, uppercase: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, enum: ["car", "motorcycle", "truck"], required: true },
    parkingSpot: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

VehicleSchema.index({ residentId: 1, isActive: 1 });
VehicleSchema.index({ licensePlate: 1 });

export default mongoose.model<IVehicle>("Vehicle", VehicleSchema);
