import mongoose, { Schema, Document } from "mongoose";

export interface IParkingEntry extends Document {
  vehicleId: mongoose.Types.ObjectId;
  licensePlate: string;
  entryTime: Date;
  exitTime?: Date;
  guardId: mongoose.Types.ObjectId;
  parkingSpot: string;
  photo?: string;
}

const ParkingEntrySchema: Schema = new Schema(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle", required: true },
    licensePlate: { type: String, required: true, uppercase: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date },
    guardId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parkingSpot: { type: String, required: true },
    photo: { type: String },
  },
  { timestamps: true }
);

ParkingEntrySchema.index({ vehicleId: 1, entryTime: -1 });
ParkingEntrySchema.index({ licensePlate: 1, exitTime: 1 });

export default mongoose.model<IParkingEntry>("ParkingEntry", ParkingEntrySchema);
