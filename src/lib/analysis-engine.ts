import {
  TenderRequirement,
  RequirementComparisonItem,
  VerificationReport,
  VerificationStatus,
  RequirementCategory,
  TenderRecord,
  RiskLevel,
  DocumentItem,
} from '@/types';

/* ──────────────────────────────────────────────────────────────────────────
   REQUIREMENT DEFINITIONS TEMPLATE FOR TENDER CLAUSE EXTRACTION
────────────────────────────────────────────────────────────────────────── */

interface RequirementPatternDef {
  id: string;
  name: string;
  category: RequirementCategory;
  description: string;
  patterns: RegExp[];
  evidencePatterns: RegExp[];
  clarityPatterns: RegExp[];
  weight: number;
  mandatory: boolean;
  notesFound: string;
  notesMissing: string;
}

const TENDER_REQUIREMENT_PATTERNS: RequirementPatternDef[] = [
  {
    id: 'req_gst',
    name: 'GST Registration & Compliance',
    category: 'Statutory',
    description: 'Mandatory valid GSTIN registration certificate and filing compliance.',
    patterns: [/\bgst\b/i, /\bgstin\b/i, /gst\s+registration/i, /gstr[- ]?3b/i, /goods\s+and\s+services\s+tax/i],
    evidencePatterns: [/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/, /gstin/i, /gst\s+certificate/i, /valid\s+gst/i],
    clarityPatterns: [/copy\s+of\s+gst/i, /valid\s+gst/i, /gst\s+return/i],
    weight: 12,
    mandatory: true,
    notesFound: 'Active GST registration and tax compliance verified.',
    notesMissing: 'GSTIN registration certificate or valid proof not provided.',
  },
  {
    id: 'req_pan',
    name: 'Permanent Account Number (PAN) & Tax Clearance',
    category: 'Statutory',
    description: 'Valid PAN card copy and Income Tax Return (ITR) acknowledgments.',
    patterns: [/\bpan\b/i, /permanent\s+account\s+number/i, /pan\s+card/i, /income\s+tax\s+return/i, /\bitr\b/i],
    evidencePatterns: [/\b[A-Z]{5}\d{4}[A-Z]{1}\b/, /pan\s+card/i, /income\s+tax/i, /itr[- ]?[v\d]/i],
    clarityPatterns: [/pan\s+copy/i, /itr/i, /tax\s+clearance/i],
    weight: 10,
    mandatory: true,
    notesFound: 'PAN and direct tax compliance verified.',
    notesMissing: 'Permanent Account Number (PAN) or ITR proof missing.',
  },
  {
    id: 'req_company_reg',
    name: 'Company Incorporation & Legal Entity Proof',
    category: 'Statutory',
    description: 'Certificate of Incorporation, ROC registration, CIN, or Partnership Deed.',
    patterns: [/certificate\s+of\s+incorporation/i, /incorporation/i, /\broc\b/i, /partnership\s+deed/i, /\bcin\b/i, /\bllp\b/i, /proprietorship/i],
    evidencePatterns: [/\b[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/, /certificate\s+of\s+incorporation/i, /companies\s+act/i, /registrar\s+of\s+companies/i],
    clarityPatterns: [/certificate\s+of\s+incorporation/i, /registered\s+under/i],
    weight: 10,
    mandatory: true,
    notesFound: 'Valid legal entity incorporation certificate detected.',
    notesMissing: 'Certificate of Incorporation or registered legal entity proof not detected.',
  },
  {
    id: 'req_msme',
    name: 'MSME / Udyam Certificate & Exemptions',
    category: 'Statutory',
    description: 'Udyam Registration Certificate for EMD waiver and procurement preferences.',
    patterns: [/\bmsme\b/i, /\budyam\b/i, /\bnsic\b/i, /micro\s+(and|&)\s+small/i, /\bmse[s]?\b/i],
    evidencePatterns: [/\budyam[- ][a-z]{2}[- ]\d{2}[- ]\d{7}\b/i, /udyam\s+registration/i, /msme\s+certificate/i],
    clarityPatterns: [/udyam\s+registration/i, /emd\s+exemption/i],
    weight: 8,
    mandatory: false,
    notesFound: 'MSME / Udyam registration verified with preference eligibility.',
    notesMissing: 'No MSME / Udyam registration certificate submitted.',
  },
  {
    id: 'req_epfo_esic',
    name: 'EPFO & ESIC Labor Statutory Compliance',
    category: 'Statutory',
    description: 'Valid EPFO and ESIC establishment registration with recent contribution proof.',
    patterns: [/\bepfo\b/i, /\besic\b/i, /provident\s+fund/i, /employee\s+state\s+insurance/i, /ecr\s+challan/i],
    evidencePatterns: [/epf\s+code/i, /esic\s+code/i, /provident\s+fund/i, /ecr/i, /challan/i],
    clarityPatterns: [/ecr/i, /monthly\s+challan/i],
    weight: 8,
    mandatory: true,
    notesFound: 'Labor statutory compliance (EPF/ESIC) detected with payment records.',
    notesMissing: 'EPFO or ESIC establishment registration code/challan not identified.',
  },
  {
    id: 'req_turnover',
    name: 'Annual Financial Turnover & CA Audit',
    category: 'Financial',
    description: 'Audited balance sheets, profit & loss, and CA turnover certificate with valid UDIN.',
    patterns: [/turnover/i, /balance\s+sheet/i, /profit\s+(and|&)\s+loss/i, /annual\s+turnover/i, /audited/i, /financial\s+capacity/i],
    evidencePatterns: [/turnover\s+of\s+(inr|rs\.?)\s*[\d,.]+/i, /\budin[:\s]*\d{18}\b/i, /ca\s+certified/i, /audited\s+balance\s+sheet/i, /crore[s]?|lakh[s]?/i],
    clarityPatterns: [/last\s+3\s+years/i, /audited\s+financial/i, /udin/i],
    weight: 12,
    mandatory: true,
    notesFound: 'Financial turnover capability verified with audited financial documentation.',
    notesMissing: 'Audited financial statements or CA turnover certificate missing.',
  },
  {
    id: 'req_solvency',
    name: 'Bank Solvency / Net Worth Certificate',
    category: 'Financial',
    description: 'Bank solvency certificate or certified net worth statements from a scheduled bank.',
    patterns: [/solvency/i, /net\s+worth/i, /banker['’]?s\s+certificate/i, /financial\s+soundness/i],
    evidencePatterns: [/solvency\s+certificate/i, /net\s+worth\s+of/i, /scheduled\s+bank/i],
    clarityPatterns: [/solvency\s+certificate/i, /soundness/i],
    weight: 6,
    mandatory: false,
    notesFound: 'Bank solvency or positive net worth certificate identified.',
    notesMissing: 'Bank solvency or net worth documentation omitted.',
  },
  {
    id: 'req_oem',
    name: 'Manufacturer Authorization Form (MAF)',
    category: 'Technical',
    description: 'Tender-specific Manufacturer Authorization Form (MAF) directly from equipment OEM.',
    patterns: [/\boem\b/i, /manufacturer\s+authori[sz]ation/i, /\bmaf\b/i, /authori[sz]ed\s+(partner|reseller|dealer)/i],
    evidencePatterns: [/manufacturer\s+authori[sz]ation/i, /\bmaf\b/i, /authori[sz]ed\s+partner/i, /official\s+oem/i],
    clarityPatterns: [/tender[- ]specific/i, /original\s+equipment\s+manufacturer/i],
    weight: 10,
    mandatory: true,
    notesFound: 'Tender-specific OEM Manufacturer Authorization Form verified.',
    notesMissing: 'Tender-specific OEM Authorization (MAF) not detected in submittals.',
  },
  {
    id: 'req_experience',
    name: 'Past Experience & Work Completion Orders',
    category: 'Technical',
    description: 'Completion certificates and client work orders demonstrating past project execution.',
    patterns: [/work\s+order/i, /completion\s+certificate/i, /past\s+experience/i, /similar\s+(work|project)/i, /satisfactory\s+performance/i],
    evidencePatterns: [/completion\s+certificate/i, /work\s+order\s+no/i, /successfully\s+completed/i, /client\s+certificate/i],
    clarityPatterns: [/completion\s+certificate/i, /similar\s+work/i],
    weight: 10,
    mandatory: true,
    notesFound: 'Prior project completion certificates and client credentials verified.',
    notesMissing: 'Work completion certificates or client orders demonstrating experience missing.',
  },
  {
    id: 'req_certifications',
    name: 'Quality Certifications (ISO / BIS / CE)',
    category: 'Technical',
    description: 'Valid ISO (e.g. ISO 9001 / ISO 27001) or BIS certifications.',
    patterns: [/\biso\s*(9001|27001|14001|20000)\b/i, /\bbis\b/i, /\bcmmi\b/i, /quality\s+management/i],
    evidencePatterns: [/iso\s*9001/i, /iso\s*27001/i, /certified\s+by/i, /accredited/i],
    clarityPatterns: [/valid\s+iso/i, /accreditation/i],
    weight: 6,
    mandatory: false,
    notesFound: 'Applicable quality compliance certifications (ISO/BIS) verified.',
    notesMissing: 'Quality accreditation (ISO/BIS) certificates not provided.',
  },
  {
    id: 'req_local_content',
    name: 'Make in India / Local Content Declaration',
    category: 'Contractual',
    description: 'Self-certification affidavit declaring local content percentage under PPP-MII policy.',
    patterns: [/make\s+in\s+india/i, /local\s+content/i, /class[- ]?i\s+local/i, /percentage\s+of\s+local/i, /ppp[- ]?mii/i],
    evidencePatterns: [/local\s+content\s+declaration/i, /class[- ]?i\s+local\s+supplier/i, /local\s+content\s+percentage/i, /minimum\s+\d+%\s+local/i],
    clarityPatterns: [/self[- ]declaration/i, /percentage/i],
    weight: 8,
    mandatory: true,
    notesFound: 'Make in India local content percentage affidavit verified.',
    notesMissing: 'Local content percentage self-declaration under PPP-MII not found.',
  },
  {
    id: 'req_integrity',
    name: 'Non-Debarment & Non-Blacklisting Affidavit',
    category: 'Integrity',
    description: 'Notarized undertaking certifying bidder is not debarred or blacklisted by any Govt entity.',
    patterns: [/not\s+blacklisted/i, /non[- ]?blacklisting/i, /not\s+debarred/i, /non[- ]?debarment/i, /integrity\s+pact/i, /undertaking/i],
    evidencePatterns: [/not\s+blacklisted/i, /not\s+debarred/i, /non[- ]?blacklisting\s+undertaking/i, /notarized\s+affidavit/i],
    clarityPatterns: [/notarized/i, /stamp\s+paper/i, /central\s+government/i],
    weight: 8,
    mandatory: true,
    notesFound: 'Notarized non-blacklisting and non-debarment undertaking verified.',
    notesMissing: 'Mandatory non-blacklisting affidavit on non-judicial stamp paper missing.',
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   EXTRACT TENDER REQUIREMENTS (FROM TENDER DOCUMENT)
   Each tender gets its own independent requirement criteria.
────────────────────────────────────────────────────────────────────────── */

export function extractTenderRequirements(
  tenderText: string,
  metadata?: { title?: string; organization?: string; tenderReference?: string }
): TenderRequirement[] {
  const text = tenderText || '';
  const identifiedRequirements: TenderRequirement[] = [];

  for (const def of TENDER_REQUIREMENT_PATTERNS) {
    const isExplicitlyMentioned = def.patterns.some((p) => p.test(text));

    // If explicitly mentioned or if it's a mandatory procurement standard, include it
    if (isExplicitlyMentioned || def.mandatory) {
      let clauseExcerpt: string | undefined;

      // Try to find matching excerpt in tender text
      for (const p of def.patterns) {
        const match = text.match(p);
        if (match && match.index !== undefined) {
          const start = Math.max(0, match.index - 50);
          const end = Math.min(text.length, match.index + 120);
          clauseExcerpt = text.slice(start, end).replace(/\s+/g, ' ').trim();
          break;
        }
      }

      identifiedRequirements.push({
        id: def.id,
        name: def.name,
        category: def.category,
        description: def.description,
        mandatory: def.mandatory,
        weight: def.weight,
        tenderClauseExcerpt: clauseExcerpt || `Mandatory ${def.name} standard as per public procurement guidelines.`,
      });
    }
  }

  // Normalize weights so total equals 100
  const rawSum = identifiedRequirements.reduce((acc, r) => acc + r.weight, 0);
  if (rawSum > 0) {
    let runningSum = 0;
    identifiedRequirements.forEach((r, idx) => {
      if (idx === identifiedRequirements.length - 1) {
        r.weight = 100 - runningSum;
      } else {
        r.weight = Math.round((r.weight / rawSum) * 100);
        runningSum += r.weight;
      }
    });
  }

  return identifiedRequirements;
}

/* ──────────────────────────────────────────────────────────────────────────
   CALCULATE RISK LEVEL (RULE 5)
   80–100 → LOW
   65–79  → MEDIUM
   0–64   → HIGH
────────────────────────────────────────────────────────────────────────── */

export function calculateRiskLevel(complianceScore: number): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (complianceScore >= 80) return 'LOW';
  if (complianceScore >= 65) return 'MEDIUM';
  return 'HIGH';
}

/* ──────────────────────────────────────────────────────────────────────────
   COMPARE BIDDER AGAINST TENDER
   Evaluates each tender requirement against bidder documents.
   Computes:
   - Compliance Score (0 to 100)
   - Compliance Percentage (0 to 100%)
   - Risk Score = 100 - Compliance Score
   - Risk Level = LOW / MEDIUM / HIGH
────────────────────────────────────────────────────────────────────────── */

export function compareBidderAgainstTender(
  tender: TenderRecord,
  bidderName: string,
  bidderDocRef: string,
  bidderText: string,
  documents?: DocumentItem[]
): VerificationReport {
  const text = bidderText || '';
  const requirements = tender.requirements && tender.requirements.length > 0
    ? tender.requirements
    : extractTenderRequirements(tender.extractedText || '');

  const comparisonResults: RequirementComparisonItem[] = [];
  const compliantRequirements: string[] = [];
  const nonCompliantRequirements: string[] = [];
  const missingRequirements: string[] = [];
  const needsReview: string[] = [];
  const keyRiskFactors: string[] = [];

  let earnedScore = 0;
  const totalWeight = requirements.reduce((acc, r) => acc + r.weight, 0);

  // Suspicious pattern checks (e.g. fake GSTIN / PAN / expired dates)
  const dummyGstPattern = /\b\d{2}[A-Z]{5}0000[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i;
  const dummyPanPattern = /\b(AAAAA|XXXXX|ZZZZZ)\d{4}[A-Z]\b/i;
  const expiredDatePattern = /(expired|valid\s+up\s+to\s+201\d|valid\s+till\s+202[0-2])/i;

  let integrityPenalty = 0;
  if (dummyGstPattern.test(text)) {
    keyRiskFactors.push('Suspicious GSTIN format identified with repetitive placeholder zeroes.');
    integrityPenalty += 15;
  }
  if (dummyPanPattern.test(text)) {
    keyRiskFactors.push('Potential placeholder / dummy PAN format detected in document text.');
    integrityPenalty += 15;
  }
  if (expiredDatePattern.test(text)) {
    keyRiskFactors.push('References to expired certifications or validity dates preceding 2023.');
    integrityPenalty += 10;
  }

  // Evaluate each tender requirement against bidder document
  for (const req of requirements) {
    const patternDef = TENDER_REQUIREMENT_PATTERNS.find((p) => p.id === req.id);

    let status: VerificationStatus = 'Missing';
    let bidderEvidence = 'No supporting evidence or document attachment detected in submission.';
    let remarks = '';
    let scoreAwarded = 0;

    if (patternDef) {
      const hasStrongEvidence = patternDef.evidencePatterns.some((p) => p.test(text));
      const hasGeneralMention = patternDef.patterns.some((p) => p.test(text));
      const hasClarity = patternDef.clarityPatterns.some((p) => p.test(text));

      // Try to extract actual excerpt for evidence
      let extractedExcerpt = '';
      for (const p of [...patternDef.evidencePatterns, ...patternDef.patterns]) {
        const match = text.match(p);
        if (match && match.index !== undefined) {
          const start = Math.max(0, match.index - 40);
          const end = Math.min(text.length, match.index + 120);
          extractedExcerpt = text.slice(start, end).replace(/\s+/g, ' ').trim();
          break;
        }
      }

      if (hasStrongEvidence || (hasGeneralMention && hasClarity)) {
        status = 'Compliant';
        bidderEvidence = extractedExcerpt || `Verified: ${patternDef.notesFound}`;
        remarks = patternDef.notesFound;
        scoreAwarded = req.weight;
        compliantRequirements.push(req.name);
      } else if (hasGeneralMention) {
        status = 'Needs Review';
        bidderEvidence = extractedExcerpt || 'Mentioned in submittals, but specific certification or registration code needs verification.';
        remarks = `Clause mentioned partially, but full compliance verification requires formal attachment clarification.`;
        scoreAwarded = Math.round(req.weight * 0.5);
        needsReview.push(req.name);
        if (req.mandatory) {
          keyRiskFactors.push(`Ambiguous evidence provided for mandatory requirement: ${req.name}.`);
        }
      } else {
        status = req.mandatory ? 'Non-Compliant' : 'Missing';
        bidderEvidence = 'No relevant clause, certificate, or reference found in submitted documents.';
        remarks = patternDef.notesMissing;
        scoreAwarded = 0;

        if (req.mandatory) {
          nonCompliantRequirements.push(req.name);
          missingRequirements.push(req.name);
          keyRiskFactors.push(`Mandatory tender requirement missing or non-compliant: ${req.name}.`);
        } else {
          missingRequirements.push(req.name);
        }
      }
    } else {
      // Fallback for custom tender requirements
      const words = req.name.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      const matchedWordCount = words.filter((w) => text.toLowerCase().includes(w)).length;

      if (matchedWordCount === words.length && words.length > 0) {
        status = 'Compliant';
        bidderEvidence = `Verified: Submittal demonstrates compliance with ${req.name}.`;
        remarks = `Document satisfies ${req.name}.`;
        scoreAwarded = req.weight;
        compliantRequirements.push(req.name);
      } else if (matchedWordCount > 0) {
        status = 'Needs Review';
        bidderEvidence = `Partial reference to ${req.name} detected.`;
        remarks = `Requires scrutiny or supplementary verification.`;
        scoreAwarded = Math.round(req.weight * 0.5);
        needsReview.push(req.name);
      } else {
        status = req.mandatory ? 'Non-Compliant' : 'Missing';
        bidderEvidence = `No evidence found for ${req.name}.`;
        remarks = `Bidder did not demonstrate compliance with ${req.name}.`;
        scoreAwarded = 0;
        if (req.mandatory) {
          nonCompliantRequirements.push(req.name);
          keyRiskFactors.push(`Missing mandatory requirement: ${req.name}.`);
        } else {
          missingRequirements.push(req.name);
        }
      }
    }

    earnedScore += scoreAwarded;

    comparisonResults.push({
      id: `cmp_${req.id}_${Date.now()}`,
      requirementId: req.id,
      tenderRequirement: req.name,
      category: req.category,
      bidderEvidence,
      status,
      remarks,
      scoreAwarded,
      weight: req.weight,
    });
  }

  // Calculate raw compliance score out of 100
  let rawCompliance = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;
  rawCompliance = Math.max(0, rawCompliance - integrityPenalty);
  const complianceScore = Math.max(0, Math.min(100, Math.round(rawCompliance)));
  const compliancePercentage = complianceScore;

  // Requirement 4: Risk Score = 100 - Compliance Score
  const riskScore = 100 - complianceScore;

  // Requirement 5: Risk Level
  const riskLevel = calculateRiskLevel(complianceScore);

  // Generate autonomous AI verification summary
  let aiSummary = '';
  if (riskLevel === 'LOW') {
    aiSummary = `Autonomous comparative verification of bidder "${bidderName}" against tender "${tender.title}" completed with high compliance (${complianceScore}/100, LOW RISK). The bidder successfully satisfies ${compliantRequirements.length} out of ${requirements.length} tender requirements, including all core statutory registrations, tax compliances, and primary technical capabilities. Risk score is ${riskScore}/100. Commercial qualification is strongly recommended.`;
  } else if (riskLevel === 'MEDIUM') {
    aiSummary = `Comparative evaluation of bidder "${bidderName}" against tender "${tender.title}" reflects moderate compliance (${complianceScore}/100, MEDIUM RISK, Risk Score: ${riskScore}/100). The submission complies with ${compliantRequirements.length} requirements, but ${needsReview.length} items require clarification and ${missingRequirements.length} clauses remain unverified. Formal pre-award clarification on highlighted gaps is advised.`;
  } else {
    aiSummary = `Comparative audit of bidder "${bidderName}" against tender "${tender.title}" indicates severe procedural non-compliance (${complianceScore}/100, HIGH RISK, Risk Score: ${riskScore}/100). The bidder failed or omitted ${nonCompliantRequirements.length} mandatory tender requirements (${nonCompliantRequirements.slice(0, 3).join(', ')}). Proceeding with this submission poses critical legal, financial, or performance vulnerabilities. Disqualification recommended.`;
  }

  const id = 'vfr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  return {
    id,
    tenderId: tender.id,
    tenderTitle: tender.title,
    tenderOrganization: tender.organization,
    tenderReference: tender.tenderReference || tender.documentRef,
    bidderName: bidderName.trim(),
    bidderDocumentRef: bidderDocRef,
    documents,
    submittedAt: new Date().toISOString(),
    complianceScore,
    compliancePercentage,
    riskScore,
    riskLevel,
    totalRequirements: requirements.length,
    compliantRequirements,
    nonCompliantRequirements,
    missingRequirements,
    needsReview,
    comparisonResults,
    keyRiskFactors,
    aiSummary,
    createdAt: new Date().toISOString(),
  };
}
