import mongoose, { Schema, Document } from 'mongoose';
import { DocumentItem, OfficerDecision, ApplicationStatus } from '@/types';

export interface ITenderApplication extends Document {
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  tenderDeadline?: string;
  bidderId: string;
  bidderName: string;
  bidderEmail: string;
  companyPan?: string;
  companyGstin?: string;
  companyUdyam?: string;
  companyTurnover?: string;
  documents: DocumentItem[];
  extractedText: string;
  status: ApplicationStatus;
  submittedAt?: Date;
  latestVerificationId?: string;
  isOutdated?: boolean;
  officerDecision?: OfficerDecision;
  createdAt: Date;
  updatedAt: Date;
}

const TenderApplicationSchema = new Schema<ITenderApplication>(
  {
    tenderId: { type: String, required: true, index: true },
    tenderTitle: { type: String, required: true },
    tenderReference: { type: String, default: '' },
    tenderDeadline: { type: String, default: '' },
    bidderId: { type: String, required: true, index: true },
    bidderName: { type: String, required: true },
    bidderEmail: { type: String, default: '' },
    companyPan: { type: String, default: '' },
    companyGstin: { type: String, default: '' },
    companyUdyam: { type: String, default: '' },
    companyTurnover: { type: String, default: '' },
    documents: [
      {
        fileName: { type: String, required: true },
        fileReference: { type: String, default: '' },
        extractedText: { type: String, default: '' },
        status: { type: String, enum: ['Waiting', 'Processing', 'Processed', 'Failed'], default: 'Processed' },
        fileSize: { type: Number, default: 0 },
        pageCount: { type: Number, default: 1 },
        uploadedAt: { type: String, default: '' },
      },
    ],
    extractedText: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'Application Draft',
        'Submitted',
        'Verification Pending',
        'Verification In Progress',
        'Verified',
        'Rejected',
        'Needs Review',
      ],
      default: 'Application Draft',
      index: true,
    },
    submittedAt: { type: Date },
    latestVerificationId: { type: String, default: '' },
    isOutdated: { type: Boolean, default: false },
    officerDecision: {
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Needs Clarification'], default: 'Pending' },
      remarks: { type: String, default: '' },
      officerId: { type: String, default: '' },
      officerName: { type: String, default: '' },
      decidedAt: { type: String, default: '' },
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.TenderApplication ||
  mongoose.model<ITenderApplication>('TenderApplication', TenderApplicationSchema);
