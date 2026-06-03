import mongoose, { Document } from "mongoose";
export declare enum UserRole {
    ADMIN = "ADMIN",
    INSPECTOR = "INSPECTOR",
    USER = "USER"
}
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default User;
//# sourceMappingURL=User.d.ts.map