import mongoose, { Document } from 'mongoose';
export interface IMaintenance extends Document {
    extinguisherId: mongoose.Types.ObjectId;
    inspectorId: mongoose.Types.ObjectId;
    actionsTaken: string;
    dateOfAction: Date;
    conditionsNoted: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const Maintenance: mongoose.Model<IMaintenance, {}, {}, {}, mongoose.Document<unknown, {}, IMaintenance, {}, mongoose.DefaultSchemaOptions> & IMaintenance & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMaintenance>;
export default Maintenance;
//# sourceMappingURL=Maintenance.d.ts.map