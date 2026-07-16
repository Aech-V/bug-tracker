import mongoose, { Schema } from 'mongoose';

interface ISequence {
    _id: string;
    sequence_value: number;
}

const SequenceSchema = new Schema<ISequence>({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 100 },
});

export const Sequence = mongoose.models.Sequence || mongoose.model<ISequence>('Sequence', SequenceSchema);