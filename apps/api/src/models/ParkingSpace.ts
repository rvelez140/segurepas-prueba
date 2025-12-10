import mongoose, { Schema, Model } from 'mongoose';
import { IParkingSpace, ParkingType, ParkingStatus } from '../interfaces/IParking';

const parkingSpaceSchema: Schema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ParkingType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(ParkingStatus),
      default: ParkingStatus.AVAILABLE,
      index: true,
    },
    floor: {
      type: String,
      trim: true,
    },
    section: {
      type: String,
      trim: true,
    },
    resident: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Índices compuestos
parkingSpaceSchema.index({ type: 1, status: 1 });
parkingSpaceSchema.index({ floor: 1, section: 1 });

export const ParkingSpace: Model<IParkingSpace> = mongoose.model<IParkingSpace>(
  'ParkingSpace',
  parkingSpaceSchema
);

export default ParkingSpace;
