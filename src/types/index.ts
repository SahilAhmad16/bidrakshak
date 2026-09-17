export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'Low Risk' | 'Medium Risk' | 'High Risk';

export type VerificationStatus = 'Compliant' | 'Non-Compliant' | 'Missing' | 'Needs Review';

export type RequirementCategory = 'Statutory' | 'Financial' | 'Technical' | 'Contractual' | 'Integrity';

export interface TenderRequirement {
  id: string;
  name: string;
  category: RequirementCategory;
  description: string;
  mandatory: boolean;
  weight: number;
  tenderClauseExcerpt?: string;
}

export interface RequirementComparisonItem {
  id: string;
  requirementId: string;
  tenderRequirement: string;
  category: RequirementCategory;
  bidderEvidence: string;
  status: VerificationStatus;
  remarks: string;
  scoreAwarded: number;
  weight: number;
}

export interface VerificationFeedback {
  rating?: 'helpful' | 'not_helpful';
  comment?: string;
  submittedAt?: string;
}

export type DocumentProcessingStatus = 'Waiting' | 'Processing' | 'Processed' | 'Failed';

export interface DocumentItem {
  fileName: string;
  fileReference?: string;
  extractedText?: string;
  status: DocumentProcessingStatus;
  fileSize?: number;
}

export interface VerificationReport {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderOrganization: string;
  tenderReference: string;
  bidderName: string;
  bidderDocumentRef: string;
  documents?: DocumentItem[];
  submittedAt: string;
  complianceScore: number;       // e.g. 82
  compliancePercentage: number;  // e.g. 82%
  riskScore: number;             // 100 - complianceScore (e.g. 18)
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
  createdAt: string;
}

export interface TenderRecord {
  id: string;
  title: string;
  organization: string;
  tenderReference: string;
  documentRef: string;
  extractedText: string;
  userId: string;
  status: 'Completed' | 'Processing' | 'Failed';
  requirements: TenderRequirement[];
  documents?: DocumentItem[];
  biddersCount?: number;
  bidders?: VerificationReport[];
  createdAt: string;
  updatedAt?: string;
  
  // Backwards-compatibility fields
  verificationType?: string;
  bidDocumentRef?: string;
  bidExtractedText?: string;
  analysis?: any;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTenders: number;
  totalBiddersVerified: number;
  averageComplianceScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  recentVerifications: Array<{
    id: string;
    tenderId: string;
    tenderTitle: string;
    bidderName: string;
    complianceScore: number;
    compliancePercentage: number;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    submittedAt: string;
  }>;
  // Legacy aliases
  completedAnalysis?: number;
  pendingAnalysis?: number;
  averageScore?: number;
  recentTenders?: any[];
}
