import mongoose, { Schema, Model } from 'mongoose';
import { IRecurringVisit, RecurrencePattern, DayOfWeek } from '../interfaces/IRecurringVisit';

const recurringVisitSchema: Schema = new mongoose.Schema(
  {
    visit: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        match: /^\S+@\S+\.\S+$/,
      },
      document: {
        type: String,
        required: true,
        index: true,
      },
      vehiclePlate: {
        type: String,
        trim: true,
        uppercase: true,
      },
    },
    resident: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pattern: {
      type: String,
      enum: Object.values(RecurrencePattern),
      required: true,
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: function (arr: number[]) {
          return arr.every((day) => day >= 0 && day <= 6);
        },
        message: 'Días de la semana inválidos',
      },
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    customDates: {
      type: [Date],
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      index: true,
    },
    timeWindow: {
      start: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      },
      end: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
      },
    },
    reason: {
      type: String,
      maxlength: 500,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastGenerated: {
      type: Date,
    },
    nextGeneration: {
      type: Date,
      index: true,
    },
    generatedCount: {
      type: Number,
      default: 0,
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
recurringVisitSchema.index({ resident: 1, isActive: 1 });
recurringVisitSchema.index({ 'visit.document': 1, isActive: 1 });

export const RecurringVisit: Model<IRecurringVisit> = mongoose.model<IRecurringVisit>(
  'RecurringVisit',
  recurringVisitSchema
);

export default RecurringVisit;
