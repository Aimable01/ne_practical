import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenance extends Document {
  extinguisherId: mongoose.Types.ObjectId;
  inspectorId: mongoose.Types.ObjectId;
  actionsTaken: string;
  dateOfAction: Date;
  conditionsNoted: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceSchema: Schema = new Schema(
  {
    extinguisherId: {
      type: Schema.Types.ObjectId,
      ref: 'Extinguisher',
      required: [true, 'Extinguisher ID is required']
    },
    inspectorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Inspector ID is required']
    },
    actionsTaken: {
      type: String,
      required: [true, 'Actions taken is required'],
      trim: true
    },
    dateOfAction: {
      type: Date,
      required: [true, 'Date of action is required'],
      default: Date.now
    },
    conditionsNoted: {
      type: String,
      required: [true, 'Conditions noted is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
MaintenanceSchema.index({ extinguisherId: 1 });
MaintenanceSchema.index({ inspectorId: 1 });
MaintenanceSchema.index({ dateOfAction: 1 });

const Maintenance = mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
export default Maintenance;

