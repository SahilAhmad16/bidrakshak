import mongoose, { Schema, Document } from 'mongoose';
import { TenderRequirement, DocumentItem, TenderStatus } from '@/types';

export interface ITender extends Document {
  title: string;
  organization: string;
  tenderReference: string;
  documentRef: string;
  extractedText: string;
  userId: string;
  status: TenderStatus;
  requirements: TenderRequirement[];
  documents?: DocumentItem[];
  description?: string;
  category?: string;
  location?: string;
  estimatedBudget?: string;
  submissionDeadline?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const TenderSchema = new Schema<ITender>(
  {
    title: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    tenderReference: { type: String, default: '' },
    documentRef: { type: String, required: true },
    extractedText: { type: String, default: '' },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Closed', 'Completed', 'Processing', 'Failed'],
      default: 'Draft',
      index: true,
    },
    description: { type: String, default: '' },
    category: { type: String, default: 'General Procurement' },
    location: { type: String, default: 'All India / Central' },
    estimatedBudget: { type: String, default: '' },
    submissionDeadline: { type: String, default: '' },
    publishedAt: { type: Date },
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
        expectedValue: String,
      },
    ],
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Tender || mongoose.model<ITender>('Tender', TenderSchema);
