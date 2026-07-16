// src/backend/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'DEVELOPER';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false },
        role: { type: String, enum: ['ADMIN', 'DEVELOPER'], required: true, default: 'DEVELOPER' },
    },
    { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);