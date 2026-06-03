import mongoose, { Document, Schema } from 'mongoose';

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export interface IInspection extends Document {
  extinguisherId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  scheduledTime: string;
  inspectorId: mongoose.Types.ObjectId;
  status: InspectionStatus;
  result?: string;
  notes?: string;
  notified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionSchema: Schema = new Schema(
  {
    extinguisherId: {
      type: Schema.Types.ObjectId,
      ref: 'Extinguisher',
      required: [true, 'Extinguisher ID is required']
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format']
    },
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector ID is required']
    },
    status: {
      type: String,
      enum: {
        values: [InspectionStatus.SCHEDULED, InspectionStatus.COMPLETED, InspectionStatus.CANCELLED, InspectionStatus.FAILED],
        message: '{VALUE} is not a valid inspection status'
      },
      default: InspectionStatus.SCHEDULED
    },
    result: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    notified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
InspectionSchema.index({ extinguisherId: 1 });
InspectionSchema.index({ inspectorId: 1 });
InspectionSchema.index({ scheduledDate: 1 });
InspectionSchema.index({ status: 1 });

const Inspection = mongoose.model<IInspection>('Inspection', InspectionSchema);
export default Inspection;

