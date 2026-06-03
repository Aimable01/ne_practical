import mongoose, { Document, Schema } from 'mongoose';

export enum ExtinguisherType {
  WATER = 'WATER',
  CO2 = 'CO2',
  FOAM = 'FOAM',
  DRY_CHEMICAL = 'DRY_CHEMICAL'
}

export enum ExtinguisherSize {
  SIZE_2_5 = '2.5lbs',
  SIZE_5 = '5lbs',
  SIZE_9 = '9lbs',
  SIZE_12 = '12lbs'
}

export enum ExtinguisherStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  MAINTENANCE_REQUIRED = 'MAINTENANCE_REQUIRED',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface IExtinguisher extends Document {
  serialNumber: string;
  location: string;
  type: ExtinguisherType;
  size: ExtinguisherSize;
  installationDate: Date;
  expiryDate: Date;
  status: ExtinguisherStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ExtinguisherSchema: Schema = new Schema(
  {
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: [ExtinguisherType.WATER, ExtinguisherType.CO2, ExtinguisherType.FOAM, ExtinguisherType.DRY_CHEMICAL],
        message: '{VALUE} is not a valid extinguisher type'
      },
      required: [true, 'Type is required']
    },
    size: {
      type: String,
      enum: {
        values: [ExtinguisherSize.SIZE_2_5, ExtinguisherSize.SIZE_5, ExtinguisherSize.SIZE_9, ExtinguisherSize.SIZE_12],
        message: '{VALUE} is not a valid extinguisher size'
      },
      required: [true, 'Size is required']
    },
    installationDate: {
      type: Date,
      required: [true, 'Installation date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    status: {
      type: String,
      enum: {
        values: [ExtinguisherStatus.ACTIVE, ExtinguisherStatus.EXPIRED, ExtinguisherStatus.MAINTENANCE_REQUIRED, ExtinguisherStatus.OUT_OF_SERVICE],
        message: '{VALUE} is not a valid status'
      },
      default: ExtinguisherStatus.ACTIVE
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
ExtinguisherSchema.index({ serialNumber: 1 });
ExtinguisherSchema.index({ status: 1 });
ExtinguisherSchema.index({ expiryDate: 1 });

const Extinguisher = mongoose.model<IExtinguisher>('Extinguisher', ExtinguisherSchema);
export default Extinguisher;

