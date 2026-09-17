import mongoose, { Schema, Document } from 'mongoose';
import { RequirementComparisonItem, VerificationFeedback, DocumentItem } from '@/types';

export interface IVerification extends Document {
  tenderId: string;
  userId: string;
  tenderTitle: string;
  tenderOrganization: string;
  tenderReference: string;
  bidderName: string;
  bidderDocumentRef: string;
  documents?: DocumentItem[];
  complianceScore: number;
  compliancePercentage: number;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  totalRequirements: number;
  compliantRequirements: string[];
  nonCompliantRequirements: string[];
  missingRequirements: string[];
  needsReview: string[];
  comparisonResults: RequirementComparisonItem[];
  keyRiskFactors: string[];
  aiSummary: string;
  feedback?: VerificationFeedback;
  createdAt: Date;
}

const VerificationSchema = new Schema<IVerification>({
  tenderId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  tenderTitle: { type: String, required: true },
  tenderOrganization: { type: String, required: true },
  tenderReference: { type: String, default: '' },
  bidderName: { type: String, required: true },
  bidderDocumentRef: { type: String, default: '' },
  documents: [
    {
      fileName: { type: String, required: true },
      fileReference: { type: String, default: '' },
      extractedText: { type: String, default: '' },
      status: { type: String, enum: ['Waiting', 'Processing', 'Processed', 'Failed'], default: 'Processed' },
      fileSize: { type: Number, default: 0 },
    },
  ],
  complianceScore: { type: Number, required: true, min: 0, max: 100 },
  compliancePercentage: { type: Number, required: true, min: 0, max: 100 },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, required: true, enum: ['LOW', 'MEDIUM', 'HIGH'] },
  totalRequirements: { type: Number, default: 0 },
  compliantRequirements: [String],
  nonCompliantRequirements: [String],
  missingRequirements: [String],
  needsReview: [String],
  comparisonResults: [
    {
      id: String,
      requirementId: String,
      tenderRequirement: String,
      category: String,
      bidderEvidence: String,
      status: String,
      remarks: String,
      scoreAwarded: Number,
      weight: Number,
    },
  ],
  keyRiskFactors: [String],
  aiSummary: { type: String, required: true },
  feedback: {
    rating: { type: String, enum: ['helpful', 'not_helpful'] },
    comment: String,
    submittedAt: String,
  },
}, { timestamps: true, strict: false });

export default mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
