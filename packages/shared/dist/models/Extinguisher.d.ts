import mongoose, { Document } from 'mongoose';
export declare enum ExtinguisherType {
    WATER = "WATER",
    CO2 = "CO2",
    FOAM = "FOAM",
    DRY_CHEMICAL = "DRY_CHEMICAL"
}
export declare enum ExtinguisherSize {
    SIZE_2_5 = "2.5lbs",
    SIZE_5 = "5lbs",
    SIZE_9 = "9lbs",
    SIZE_12 = "12lbs"
}
export declare enum ExtinguisherStatus {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    MAINTENANCE_REQUIRED = "MAINTENANCE_REQUIRED",
    OUT_OF_SERVICE = "OUT_OF_SERVICE"
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
declare const Extinguisher: mongoose.Model<IExtinguisher, {}, {}, {}, mongoose.Document<unknown, {}, IExtinguisher, {}, mongoose.DefaultSchemaOptions> & IExtinguisher & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExtinguisher>;
export default Extinguisher;
//# sourceMappingURL=Extinguisher.d.ts.map