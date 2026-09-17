import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysis extends Document {
  tenderId: string;
  detectedRequirements: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
    excerpt?: string;
    notes: string;
  }>;
  issues: Array<{
    id: string;
    title: string;
    severity: string;
    description: string;
    recommendation: string;
  }>;
  score: number;
  riskLevel: string;
  summary: string;
  wordCount: number;
  detectedCount: number;
  totalChecks: number;
  createdAt: Date;
}

const AnalysisSchema = new Schema<IAnalysis>({
  tenderId: { type: String, required: true, unique: true, index: true },
  detectedRequirements: [
    {
      id: String,
      name: String,
      category: String,
      status: String,
      excerpt: String,
      notes: String,
    },
  ],
  issues: [
    {
      id: String,
      title: String,
      severity: String,
      description: String,
      recommendation: String,
    },
  ],
  score: { type: Number, required: true, min: 0, max: 100 },
  riskLevel: { type: String, required: true, enum: ['Low Risk', 'Medium Risk', 'High Risk'] },
  summary: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
  detectedCount: { type: Number, default: 0 },
  totalChecks: { type: Number, default: 0 },
}, { strict: false });

export default mongoose.models.Analysis || mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
