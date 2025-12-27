import mongoose, { Schema, Document } from "mongoose";

export interface ICommonSpace extends Document {
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  rules: string;
  isActive: boolean;
  photo?: string;
}

const CommonSpaceSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    capacity: { type: Number, required: true },
    pricePerHour: { type: Number, required: true },
    amenities: [{ type: String }],
    rules: { type: String },
    isActive: { type: Boolean, default: true },
    photo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ICommonSpace>("CommonSpace", CommonSpaceSchema);
