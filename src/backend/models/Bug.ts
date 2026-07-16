import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { Sequence } from './Sequence';

export interface IActivity {
    _id: mongoose.Types.ObjectId;
    type: 'COMMENT' | 'STATUS_CHANGE' | 'ASSIGNEE_CHANGE' | 'TICKET_CREATED';
    text?: string;
    oldValue?: string;
    newValue?: string;
    user: mongoose.Types.ObjectId | IUser;
    createdAt: Date;
}

export interface IBug extends Document {
    ticketId: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdBy: mongoose.Types.ObjectId | IUser;
    assignedTo: mongoose.Types.ObjectId | IUser | null;
    activities: IActivity[];
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    type: { 
        type: String, 
        enum: ['COMMENT', 'STATUS_CHANGE', 'ASSIGNEE_CHANGE', 'TICKET_CREATED'], 
        required: true 
    },
    text: { type: String },
    oldValue: { type: String },
    newValue: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

const BugSchema = new Schema<IBug>(
    {
        ticketId: { type: String, unique: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
        status: { type: String, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'], required: true, default: 'OPEN' },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        activities: [ActivitySchema],
        dueDate: { type: Date },
    },
    { timestamps: true }
);

BugSchema.pre('save', async function () {
    if (this.isNew) {
        const sequenceDoc = await Sequence.findByIdAndUpdate(
            'bug_ticket_id',
            { $inc: { sequence_value: 1 } },
            { new: true, upsert: true }
        );
        this.ticketId = `BUG-${sequenceDoc.sequence_value}`;
    }
});

export const Bug = mongoose.models.Bug || mongoose.model<IBug>('Bug', BugSchema);