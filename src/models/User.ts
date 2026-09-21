import mongoose, {Document, Schema} from 'mongoose';

export interface IUser extends Document{
    username: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {timestamps: true}
);

export default mongoose.model<IUser>('User', userSchema);