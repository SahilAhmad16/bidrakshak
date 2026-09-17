import mongoose, { Schema, Document } from 'mongoose';
import { TenderRequirement, DocumentItem } from '@/types';

export interface ITender extends Document {
  title: string;
  organization: string;
  tenderReference: string;
  documentRef: string;
  extractedText: string;
  userId: string;
  status: 'Completed' | 'Processing' | 'Failed';
  requirements: TenderRequirement[];
  documents?: DocumentItem[];
  createdAt: Date;
  updatedAt?: Date;
}

const TenderSchema = new Schema<ITender>({
  title: { type: String, required: true, trim: true },
  organization: { type: String, required: true, trim: true },
  tenderReference: { type: String, default: '' },
  documentRef: { type: String, required: true },
  extractedText: { type: String, default: '' },
  userId: { type: String, required: true, index: true },
  status: { type: String, enum: ['Completed', 'Processing', 'Failed'], default: 'Completed' },
  documents: [
    {
      fileName: { type: String, required: true },
      fileReference: { type: String, default: '' },
      extractedText: { type: String, default: '' },
      status: { type: String, enum: ['Waiting', 'Processing', 'Processed', 'Failed'], default: 'Processed' },
      fileSize: { type: Number, default: 0 },
    },
  ],
  requirements: [
    {
      id: String,
      name: String,
      category: String,
      description: String,
      mandatory: Boolean,
      weight: Number,
      tenderClauseExcerpt: String,
    },
  ],
}, { timestamps: true, strict: false });

export default mongoose.models.Tender || mongoose.model<ITender>('Tender', TenderSchema);
