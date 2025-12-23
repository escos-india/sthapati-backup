import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    author: mongoose.Types.ObjectId;
    content: string;
    image?: string;
    video?: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        image: { type: String },
        video: { type: String },
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

export const PostModel: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
