export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'Low Risk' | 'Medium Risk' | 'High Risk';

export type VerificationStatus =
  | 'Compliant'
  | 'Non-Compliant'
  | 'Missing'
  | 'Needs Review'
  | 'Expired'
  | 'Mismatch Detected'
  | 'Unable to Verify'
  | 'Verified'
  | 'Unverified'
  | 'Pending Verification'
  | 'Failed';

export type TenderStatus = 'Draft' | 'Published' | 'Closed' | 'Completed' | 'Processing' | 'Failed';

export type ApplicationStatus =
  | 'Application Draft'
  | 'Submitted'
  | 'Verification Pending'
  | 'Verification In Progress'
  | 'Verified'
  | 'Rejected'
  | 'Needs Review';

export type UserRole = 'officer' | 'bidder' | 'admin';

export type RequirementCategory = 'Statutory' | 'Financial' | 'Technical' | 'Contractual' | 'Integrity';

export interface TenderRequirement {
  id: string;
  name: string;
  category: RequirementCategory;
  description: string;
  mandatory: boolean;
  weight: number;
  tenderClauseExcerpt?: string;
  expectedValue?: string;
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
  pageReference?: string;
  sourceDocument?: string;
  extractedValue?: string;
  isAuthenticityVerified?: boolean;
  officialVerificationStatus?: 'Verified' | 'Unverified' | 'Pending Verification';
  officialVerificationSource?: string;
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
  pageCount?: number;
  uploadedAt?: string;
}

export interface OfficerDecision {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Clarification';
  remarks?: string;
  officerId: string;
  officerName: string;
  decidedAt: string;
}

export interface VerificationReport {
  id: string;
  tenderId: string;
  applicationId?: string;
  tenderTitle: string;
  tenderOrganization: string;
  tenderReference: string;
  bidderName: string;
  bidderDocumentRef: string;
  documents?: DocumentItem[];
  submittedAt: string;
  complianceScore: number;       // 0 - 100
  compliancePercentage: number;  // e.g. 82%
  riskScore: number;             // 100 - complianceScore
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
  scoringMethodology?: string;
  recommendations?: string[];
  feedback?: VerificationFeedback;
  officerDecision?: OfficerDecision;
  isOutdated?: boolean;
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
  status: TenderStatus;
  requirements: TenderRequirement[];
  documents?: DocumentItem[];
  
  // Enhanced Tender Publishing fields
  description?: string;
  category?: string;
  location?: string;
  estimatedBudget?: string;
  submissionDeadline?: string;
  publishedAt?: string;
  applicationsCount?: number;
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

export interface TenderApplication {
  id: string;
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
  submittedAt?: string;
  latestVerificationId?: string;
  verificationReport?: VerificationReport;
  isOutdated?: boolean;
  officerDecision?: OfficerDecision;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  contactNumber?: string;
  address?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalTenders: number;
  publishedTenders: number;
  draftTenders: number;
  totalApplications: number;
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
    applicationId?: string;
  }>;
  recentApplications?: TenderApplication[];
  // Legacy aliases
  completedAnalysis?: number;
  pendingAnalysis?: number;
  averageScore?: number;
  recentTenders?: any[];
}
