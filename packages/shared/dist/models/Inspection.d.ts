import mongoose, { Document } from 'mongoose';
export declare enum InspectionStatus {
    SCHEDULED = "SCHEDULED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED"
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
declare const Inspection: mongoose.Model<IInspection, {}, {}, {}, mongoose.Document<unknown, {}, IInspection, {}, mongoose.DefaultSchemaOptions> & IInspection & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IInspection>;
export default Inspection;
//# sourceMappingURL=Inspection.d.ts.map