import mongoose, { Schema, Document } from 'mongoose';
import { RequirementComparisonItem, VerificationFeedback, DocumentItem, OfficerDecision } from '@/types';

export interface IVerification extends Document {
  tenderId: string;
  applicationId?: string;
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
  hasCriticalFailure?: boolean;
  totalRequirements: number;
  compliantRequirements: string[];
  nonCompliantRequirements: string[];
  missingRequirements: string[];
  needsReview: string[];
  comparisonResults: RequirementComparisonItem[];
  keyRiskFactors: string[];
  aiSummary: string;
  authenticityStatement?: string;
  recommendations?: string[];
  scoringMethodology?: string;
  feedback?: VerificationFeedback;
  officerDecision?: OfficerDecision;
  isOutdated?: boolean;
  createdAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    tenderId: { type: String, required: true, index: true },
    applicationId: { type: String, default: '', index: true },
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
        pageCount: { type: Number, default: 1 },
      },
    ],
    complianceScore: { type: Number, required: true, min: 0, max: 100 },
    compliancePercentage: { type: Number, required: true, min: 0, max: 100 },
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, required: true, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    hasCriticalFailure: { type: Boolean, default: false },
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
        pageReference: String,
        sourceDocument: String,
        extractedValue: String,
        isAuthenticityVerified: Boolean,
      },
    ],
    keyRiskFactors: [String],
    aiSummary: { type: String, required: true },
    authenticityStatement: { type: String, default: '' },
    recommendations: [String],
    scoringMethodology: { type: String, default: '' },
    feedback: {
      rating: { type: String, enum: ['helpful', 'not_helpful'] },
      comment: String,
      submittedAt: String,
    },
    officerDecision: {
      status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Needs Clarification'] },
      remarks: String,
      officerId: String,
      officerName: String,
      decidedAt: String,
    },
    isOutdated: { type: Boolean, default: false },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Verification ||
  mongoose.model<IVerification>('Verification', VerificationSchema);
