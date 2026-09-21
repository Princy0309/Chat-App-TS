import mongoose, {Document, Schema, Types} from 'mongoose';

export interface IMessage extends Document{
    sender: Types.ObjectId;
    text: string;
    readBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema: Schema<IMessage> = new Schema(
    {
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: [300, 'Message cannot exceed 300 character']
        },

        readBy: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true}
);

export default mongoose.model<IMessage>('Message', messageSchema);