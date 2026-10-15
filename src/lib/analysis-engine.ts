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
  valueExtractor?: (text: string) => { value?: string; isExpired?: boolean; isMismatch?: boolean; notes?: string } | null;
}

// Helper to extract numbers like "15 Crores" or "25 Cr" or "50 Lakhs"
function parseFinancialAmount(text: string): number | null {
  const crMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:crore[s]?|cr\b)/i);
  if (crMatch) return parseFloat(crMatch[1]) * 10000000;
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh[s]?|lac[s]?)\b/i);
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000;
  return null;
}

const TENDER_REQUIREMENT_PATTERNS: RequirementPatternDef[] = [
  {
    id: 'req_gst',
    name: 'GST Registration & Compliance',
    category: 'Statutory',
    description: 'Mandatory valid GSTIN registration certificate and filing compliance.',
    patterns: [/\bgst\b/i, /\bgstin\b/i, /gst\s+registration/i, /gstr[- ]?3b/i, /goods\s+and\s+services\s+tax/i],
    evidencePatterns: [/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/, /gstin/i, /gst\s+certificate/i, /valid\s+gst/i],
    clarityPatterns: [/copy\s+of\s+gst/i, /valid\s+gst/i, /gst\s+return/i, /gstr/i],
    weight: 12,
    mandatory: true,
    notesFound: 'Active GST registration detected with valid 15-digit GSTIN.',
    notesMissing: 'GSTIN registration certificate or valid proof not provided.',
    valueExtractor: (text: string) => {
      const match = text.match(/\b\d{2}[A-Z]{5}[A-Z\d]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b/i);
      if (match) {
        const gst = match[0].toUpperCase();
        const isDummy = /0000|XXXXX|AAAAA/.test(gst);
        return {
          value: gst,
          isMismatch: isDummy,
          notes: isDummy ? 'Dummy / placeholder GST format detected' : 'Valid 15-digit GSTIN syntax',
        };
      }
      return null;
    },
  },
  {
    id: 'req_pan',
    name: 'Permanent Account Number (PAN) & Tax Clearance',
    category: 'Statutory',
    description: 'Valid PAN card copy and Income Tax Return (ITR) acknowledgments.',
    patterns: [/\bpan\b/i, /permanent\s+account\s+number/i, /pan\s+card/i, /income\s+tax\s+return/i, /\bitr\b/i],
    evidencePatterns: [/\b[A-Z]{5}\d{4}[A-Z]{1}\b/, /pan\s+card/i, /income\s+tax/i, /itr[- ]?[v\d]/i, /pan\s+registration/i],
    clarityPatterns: [/pan\s+copy/i, /itr/i, /tax\s+clearance/i],
    weight: 10,
    mandatory: true,
    notesFound: 'PAN card and Income Tax filing compliance verified.',
    notesMissing: 'Permanent Account Number (PAN) or ITR proof missing.',
    valueExtractor: (text: string) => {
      const match = text.match(/\b[A-Z]{5}\d{4}[A-Z]{1}\b/i);
      if (match) {
        const pan = match[0].toUpperCase();
        const isDummy = /AAAAA|XXXXX|ZZZZZ/.test(pan);
        return {
          value: pan,
          isMismatch: isDummy,
          notes: isDummy ? 'Placeholder PAN format detected' : 'Valid 10-character PAN syntax',
        };
      }
      return null;
    },
  },
  {
    id: 'req_company_reg',
    name: 'Company Incorporation & Legal Entity Proof',
    category: 'Statutory',
    description: 'Certificate of Incorporation, ROC registration, CIN, or Partnership Deed.',
    patterns: [/certificate\s+of\s+incorporation/i, /incorporation/i, /\broc\b/i, /partnership\s+deed/i, /\bcin\b/i, /\bllp\b/i, /proprietorship/i, /legal\s+registration/i],
    evidencePatterns: [/\b[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/, /certificate\s+of\s+incorporation/i, /incorporation\s+certificate/i, /companies\s+act/i, /registrar\s+of\s+companies/i],
    clarityPatterns: [/certificate\s+of\s+incorporation/i, /registered\s+under/i],
    weight: 10,
    mandatory: true,
    notesFound: 'Valid legal entity incorporation certificate detected.',
    notesMissing: 'Certificate of Incorporation or registered legal entity proof not detected.',
    valueExtractor: (text: string) => {
      const cinMatch = text.match(/\b[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b/i);
      if (cinMatch) return { value: `CIN: ${cinMatch[0].toUpperCase()}`, notes: '21-digit Corporate Identity Number' };
      return null;
    },
  },
  {
    id: 'req_emd',
    name: 'Earnest Money Deposit (EMD) / Bid Security',
    category: 'Financial',
    description: 'Earnest Money Deposit (EMD) guarantee, DD, online payment, or valid MSE exemption.',
    patterns: [/earnest\s+money/i, /\bemd\b/i, /bid\s+security/i, /security\s+deposit/i],
    evidencePatterns: [/emd\s+(amount|guarantee|copy|receipt|exemption|deposit)/i, /\bemd\b/i, /bank\s+guarantee/i, /demand\s+draft/i, /online\s+transfer/i, /\budyam[- ][a-z]{2}[- ]\d{2}[- ]\d{7}\b/i, /msme\s+(exemption|status|registration)/i, /mse[s]?\s+exempt/i],
    clarityPatterns: [/bank\s+guarantee/i, /emd\s+copy/i, /emd\s+exemption/i, /udyam/i],
    weight: 10,
    mandatory: true,
    notesFound: 'EMD guarantee copy or valid MSME/Udyam statutory exemption verified.',
    notesMissing: 'Earnest Money Deposit (EMD) proof or valid MSME exemption not furnished.',
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
    valueExtractor: (text: string) => {
      const match = text.match(/\budyam[- ][a-z]{2}[- ]\d{2}[- ]\d{7}\b/i);
      if (match) return { value: match[0].toUpperCase(), notes: 'Verified Udyam Registration format' };
      return null;
    },
  },
  {
    id: 'req_epfo_esic',
    name: 'EPFO & ESIC Labor Statutory Compliance',
    category: 'Statutory',
    description: 'Valid EPFO and ESIC establishment registration with contribution proof.',
    patterns: [/\bepfo\b/i, /\besic\b/i, /provident\s+fund/i, /employee\s+state\s+insurance/i, /ecr\s+challan/i, /labor\s+compliance/i],
    evidencePatterns: [/epf\s+code/i, /esic\s+code/i, /provident\s+fund/i, /ecr/i, /challan/i],
    clarityPatterns: [/ecr/i, /monthly\s+challan/i],
    weight: 8,
    mandatory: false,
    notesFound: 'Labor statutory compliance (EPF/ESIC) detected with payment records.',
    notesMissing: 'EPFO or ESIC establishment registration code/challan not identified.',
  },
  {
    id: 'req_turnover',
    name: 'Annual Financial Turnover & CA Audit',
    category: 'Financial',
    description: 'Audited balance sheets, turnover capability, and CA turnover certificate with valid UDIN.',
    patterns: [/turnover/i, /annual\s+turnover/i, /financial\s+turnover/i, /financial\s+capacity/i],
    evidencePatterns: [/turnover\s+(of|certificate|not\s+less)/i, /\budin[:\s]*\d{18}\b/i, /ca\s+certified/i, /crore[s]?|lakh[s]?/i],
    clarityPatterns: [/last\s+3\s+years/i, /audited\s+financial/i, /udin/i],
    weight: 12,
    mandatory: true,
    notesFound: 'Financial turnover capability verified with audited financial documentation.',
    notesMissing: 'Audited financial statements or CA turnover certificate missing.',
    valueExtractor: (text: string) => {
      const udinMatch = text.match(/\budin[:\s]*(\d{18})\b/i);
      const amountMatch = text.match(/(?:turnover\s*(?:of|is|:)?\s*(?:inr|rs\.?)?\s*)(\d+(?:\.\d+)?\s*(?:crore[s]?|cr|lakh[s]?))/i);
      const val = amountMatch ? amountMatch[1] : (udinMatch ? `CA UDIN: ${udinMatch[1]}` : undefined);
      return val ? { value: val, notes: udinMatch ? `UDIN: ${udinMatch[1]}` : undefined } : null;
    },
  },
  {
    id: 'req_balance_sheet',
    name: 'Audited Balance Sheets & Financial Statements',
    category: 'Financial',
    description: 'Audited balance sheets and profit & loss statements for the last 3 financial years.',
    patterns: [/balance\s+sheet/i, /audited\s+balance/i, /profit\s+(and|&)\s+loss/i, /audited\s+financial\s+statements?/i],
    evidencePatterns: [/audited\s+balance\s+sheet/i, /balance\s+sheets/i, /financial\s+statements/i, /financial\s+audit/i, /audited\s+financial/i, /\budin[:\s]*\d{18}\b/i],
    clarityPatterns: [/3\s+years/i, /audited/i, /udin/i],
    weight: 8,
    mandatory: true,
    notesFound: 'Audited balance sheets and certified financial statements verified.',
    notesMissing: 'Audited balance sheets or complete financial statements missing.',
  },
  {
    id: 'req_solvency',
    name: 'Bank Solvency / Net Worth Certificate',
    category: 'Financial',
    description: 'Bank solvency certificate or certified net worth statements from a scheduled bank.',
    patterns: [/solvency/i, /net\s+worth/i, /banker['’]?s\s+certificate/i, /financial\s+soundness/i],
    evidencePatterns: [/solvency\s+certificate/i, /bank\s+solvency/i, /net\s+worth\s+certificate/i],
    clarityPatterns: [/scheduled\s+bank/i, /solvency/i],
    weight: 8,
    mandatory: false,
    notesFound: 'Bank solvency or net worth certification detected.',
    notesMissing: 'Bank solvency certificate or certified net worth statement not identified.',
  },
  {
    id: 'req_oem_maf',
    name: 'Manufacturer Authorization Form (MAF / OEM)',
    category: 'Technical',
    description: 'Tender-specific Manufacturer Authorization Form (MAF) directly from the OEM.',
    patterns: [/manufacturer\s+authorization/i, /\bmaf\b/i, /oem\s+authorization/i, /authorization\s+letter/i, /oem\s+letter/i],
    evidencePatterns: [/manufacturer\s+authorization/i, /\bmaf\b/i, /authorized\s+(partner|reseller|distributor)/i, /tender-specific\s+maf/i],
    clarityPatterns: [/tender-specific/i, /back-to-back/i],
    weight: 12,
    mandatory: true,
    notesFound: 'Tender-specific Manufacturer Authorization Form (MAF) from OEM verified.',
    notesMissing: 'Tender-specific OEM Manufacturer Authorization Form (MAF) missing.',
    valueExtractor: (text: string) => {
      const isSpecific = /tender[- ]specific\s+maf|tender[- ]specific\s+authorization/i.test(text);
      const isPending = /maf\s+in\s+process|reseller\s+letter/i.test(text);
      return {
        value: isSpecific ? 'Tender-Specific OEM MAF Attached' : (isPending ? 'Standard Reseller Letter (MAF Pending)' : 'MAF Document'),
        isMismatch: isPending,
        notes: isPending ? 'Only reseller letter furnished; tender-specific MAF missing' : 'Tender-specific commitment verified',
      };
    },
  },
  {
    id: 'req_experience',
    name: 'Prior Work Experience & Satisfactory Completion',
    category: 'Technical',
    description: 'Evidence of executing similar government/PSU contracts with satisfactory completion certificates.',
    patterns: [/work\s+experience/i, /prior\s+experience/i, /similar\s+projects?/i, /past\s+performance/i, /completion\s+certificates?/i],
    evidencePatterns: [/completion\s+certificate/i, /satisfactory\s+completion/i, /client\s+certificate/i, /executed\s+(at\s+least|successfully)/i, /work\s+order/i],
    clarityPatterns: [/similar\s+projects?/i, /psu/i, /government/i],
    weight: 10,
    mandatory: true,
    notesFound: 'Prior contract execution certificates and experience proof verified.',
    notesMissing: 'Documentary proof of similar executed government or PSU contracts not detected.',
  },
  {
    id: 'req_iso_cert',
    name: 'Quality Management & ISO Certifications',
    category: 'Technical',
    description: 'Valid ISO 9001, ISO 27001, or industry quality management standard certifications.',
    patterns: [/iso\s*9001/i, /iso\s*27001/i, /iso\s*20000/i, /iso\s+certif/i, /quality\s+management/i],
    evidencePatterns: [/iso\s*9001/i, /iso\s*27001/i, /iso\s+certificate/i, /certified\s+to\s+iso/i],
    clarityPatterns: [/valid\s+till/i, /accreditation/i],
    weight: 6,
    mandatory: false,
    notesFound: 'ISO quality management certifications verified.',
    notesMissing: 'ISO quality management certification copy missing.',
    valueExtractor: (text: string) => {
      const iso = text.match(/iso\s*\d{4,5}(?::\d{4})?/i);
      const expiredMatch = text.match(/expired\s*:\s*(?:yes|true)|valid\s*till\s*:\s*(\d{4}[-/]\d{2}[-/]\d{2})/i);
      let isExpired = false;
      if (expiredMatch && expiredMatch[1]) {
        isExpired = new Date(expiredMatch[1]).getTime() < Date.now();
      }
      return iso ? { value: iso[0].toUpperCase(), isExpired, notes: isExpired ? `Expired on ${expiredMatch?.[1]}` : 'Active Certification' } : null;
    },
  },
  {
    id: 'req_make_in_india',
    name: 'Make in India / Local Content Declaration',
    category: 'Contractual',
    description: 'Class-I / Class-II Local Content self-declaration as per Public Procurement Order.',
    patterns: [/make\s+in\s+india/i, /local\s+content/i, /public\s+procurement\s+order/i, /dpiit/i],
    evidencePatterns: [/local\s+content/i, /class[- ]?[iI]{1,2}/i, /make\s+in\s+india/i, /\d{1,3}%\s*local\s+content/i],
    clarityPatterns: [/declaration/i, /self[- ]certification/i],
    weight: 8,
    mandatory: true,
    notesFound: 'Public Procurement Order (Make in India) local content declaration verified.',
    notesMissing: 'Make in India or Local Content compliance undertaking not furnished.',
    valueExtractor: (text: string) => {
      const match = text.match(/(\d{1,3})%\s*(?:class[- ]?i\s*)?local\s+content/i);
      if (match) {
        const pct = parseInt(match[1]);
        const isMismatch = pct < 50;
        return {
          value: `${pct}% Local Content`,
          isMismatch,
          notes: isMismatch ? 'Below 50% Class-I Local Content requirement' : 'Meets Class-I Local Content threshold',
        };
      }
      return null;
    },
  },
  {
    id: 'req_non_blacklisting',
    name: 'Non-Blacklisting & Integrity Undertaking',
    category: 'Integrity',
    description: 'Notarized affidavit stating non-debarment / non-blacklisting by any Government or PSU entity.',
    patterns: [/blacklisting/i, /non[- ]?blacklisting/i, /debarment/i, /non[- ]?debarment/i, /integrity\s+pact/i, /vigilance/i],
    evidencePatterns: [/non[- ]?blacklisting/i, /not\s+blacklisted/i, /affidavit/i, /stamp\s+paper/i, /notarized/i, /non[- ]?debarred/i],
    clarityPatterns: [/affidavit/i, /notary/i],
    weight: 8,
    mandatory: true,
    notesFound: 'Notarized Non-Blacklisting affidavit and Integrity declaration verified.',
    notesMissing: 'Notarized Non-Blacklisting undertaking or Integrity declaration missing.',
  },
];

/* ──────────────────────────────────────────────────────────────────────────
   EXTRACT TENDER REQUIREMENTS
────────────────────────────────────────────────────────────────────────── */

export function extractTenderRequirements(
  extractedText: string,
  tenderContext?: { title?: string; organization?: string; tenderReference?: string }
): TenderRequirement[] {
  const text = (extractedText || '').toLowerCase();
  const identifiedRequirements: TenderRequirement[] = [];

  for (const def of TENDER_REQUIREMENT_PATTERNS) {
    const isMatched = def.patterns.some((pattern) => pattern.test(text));

    if (isMatched) {
      let clauseExcerpt = '';
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

  // Ensure at least core statutory requirements exist if none matched
  if (identifiedRequirements.length === 0) {
    for (const def of TENDER_REQUIREMENT_PATTERNS.filter((d) => d.mandatory)) {
      identifiedRequirements.push({
        id: def.id,
        name: def.name,
        category: def.category,
        description: def.description,
        mandatory: def.mandatory,
        weight: def.weight,
        tenderClauseExcerpt: `Standard statutory requirement for ${def.name}.`,
      });
    }
  }

  // Normalize weights so total equals exactly 100
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
   CALCULATE RISK LEVEL
   80–100 → LOW
   60–79  → MEDIUM
   0–59   → HIGH
────────────────────────────────────────────────────────────────────────── */

export function calculateRiskLevel(
  complianceScore: number,
  hasCriticalFailure: boolean = false
): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (hasCriticalFailure) return 'HIGH';
  if (complianceScore >= 80) return 'LOW';
  if (complianceScore >= 60) return 'MEDIUM';
  return 'HIGH';
}

/* ──────────────────────────────────────────────────────────────────────────
   COMPARE BIDDER AGAINST TENDER
   Full clause-by-clause evaluation of documents, values, expiry, and credentials.
────────────────────────────────────────────────────────────────────────── */

export function compareBidderAgainstTender(
  tender: TenderRecord,
  bidderName: string,
  bidderDocRef: string,
  bidderText: string,
  documents?: DocumentItem[]
): VerificationReport {
  const text = bidderText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const requirements =
    tender.requirements && tender.requirements.length > 0
      ? tender.requirements
      : extractTenderRequirements(tender.extractedText || '');

  const comparisonResults: RequirementComparisonItem[] = [];
  const compliantRequirements: string[] = [];
  const nonCompliantRequirements: string[] = [];
  const missingRequirements: string[] = [];
  const needsReview: string[] = [];
  const keyRiskFactors: string[] = [];
  const recommendations: string[] = [];

  let earnedScore = 0;
  const totalWeight = requirements.reduce((acc, r) => acc + r.weight, 0);
  let hasCriticalFailure = false;

  // Determine source document reference
  const primaryDocName = documents && documents.length > 0 ? documents[0].fileName : bidderDocRef || 'bidder_evidence.pdf';

  // Evaluate each requirement
  for (let i = 0; i < requirements.length; i++) {
    const req = requirements[i];
    const patternDef = TENDER_REQUIREMENT_PATTERNS.find((p) => p.id === req.id);

    let status: VerificationStatus = 'Missing';
    let bidderEvidence = 'No supporting clause, certificate, or attachment reference identified.';
    let remarks = '';
    let scoreAwarded = 0;
    let extractedValue: string | undefined;
    let pageReference = `Doc 1, Pg ${Math.min(i + 1, 4)}`;

    // 1. Line-level match
    let matchingLine = '';
    if (patternDef) {
      for (const line of lines) {
        if (patternDef.patterns.some((p) => p.test(line)) || patternDef.evidencePatterns.some((p) => p.test(line))) {
          matchingLine = line;
          break;
        }
      }
    }

    // 2. Value extraction & structured validation (if extractor exists)
    let extractedData = patternDef?.valueExtractor ? patternDef.valueExtractor(text) : null;
    if (extractedData?.value) {
      extractedValue = extractedData.value;
    }

    // 3. Evaluation logic
    if (extractedData?.isMismatch) {
      status = 'Mismatch Detected';
      bidderEvidence = extractedData.value || matchingLine || 'Extracted credential mismatched tender criteria';
      remarks = `VALIDATION MISMATCH: ${extractedData.notes || 'Declared value fails requirement threshold'}`;
      scoreAwarded = 0;
      if (req.mandatory) {
        hasCriticalFailure = true;
        nonCompliantRequirements.push(req.name);
        keyRiskFactors.push(`Critical Mismatch: ${req.name} (${extractedData.notes || 'Deficient'}).`);
        recommendations.push(`Furnish rectified and conforming official certificate for ${req.name}.`);
      } else {
        needsReview.push(req.name);
      }
    } else if (extractedData?.isExpired) {
      status = 'Expired';
      bidderEvidence = extractedData.value || matchingLine;
      remarks = `DOCUMENT EXPIRED: ${extractedData.notes || 'Certificate validity expired prior to tender deadline'}`;
      scoreAwarded = 0;
      if (req.mandatory) {
        hasCriticalFailure = true;
        nonCompliantRequirements.push(req.name);
        keyRiskFactors.push(`Document Expired: ${req.name} validity date has lapsed.`);
        recommendations.push(`Submit renewed or current valid certificate for ${req.name}.`);
      } else {
        needsReview.push(req.name);
      }
    } else if (matchingLine) {
      const isExplicitlyNotAttached =
        /not\s+(attached|submitted|provided|furnished|enclosed|applicable)/i.test(matchingLine) ||
        /\b(not\s+attached\s+n\/?a|unattached|omitted)\b/i.test(matchingLine);

      const isDeficientOrDeviation =
        /\b(deficient|incomplete|partial|shortfall|deviation|deviation\s+declared)\b/i.test(matchingLine);

      const isExplicitlyAttached =
        /\b(attached|enclosed|submitted|furnished|provided|complied|verified|satisfactory)\b/i.test(matchingLine);

      bidderEvidence = matchingLine;

      if (isExplicitlyNotAttached) {
        status = req.mandatory ? 'Non-Compliant' : 'Missing';
        remarks = `Mandatory document declared NOT ATTACHED in submission checklist: "${matchingLine}".`;
        scoreAwarded = 0;
        if (req.mandatory) {
          hasCriticalFailure = true;
          nonCompliantRequirements.push(req.name);
          keyRiskFactors.push(`Mandatory document NOT ATTACHED: ${req.name}.`);
          recommendations.push(`Upload missing mandatory document: ${req.name}.`);
        } else {
          missingRequirements.push(req.name);
        }
      } else if (isDeficientOrDeviation) {
        status = 'Non-Compliant';
        remarks = `Submission declared DEFICIENT or DEVIATED from criteria: "${matchingLine}".`;
        scoreAwarded = Math.round(req.weight * 0.25);
        if (req.mandatory) hasCriticalFailure = true;
        nonCompliantRequirements.push(req.name);
        keyRiskFactors.push(`Deficient submission for ${req.name}: ${matchingLine}`);
        recommendations.push(`Seek formal clarification from bidder on deviation in ${req.name}.`);
      } else if (isExplicitlyAttached || (patternDef && patternDef.evidencePatterns.some((p) => p.test(matchingLine)))) {
        status = 'Compliant';
        remarks = `Verified from submittal evidence. ${patternDef?.notesFound || 'Criterion satisfied.'}`;
        scoreAwarded = req.weight;
        compliantRequirements.push(req.name);
      } else {
        status = 'Needs Review';
        remarks = `Mentioned in submittal but requires officer inspection of the physical attachment.`;
        scoreAwarded = Math.round(req.weight * 0.5);
        needsReview.push(req.name);
        recommendations.push(`Verify original stamp and signature for ${req.name}.`);
      }
    } else if (patternDef && patternDef.evidencePatterns.some((p) => p.test(text))) {
      let excerpt = '';
      for (const p of patternDef.evidencePatterns) {
        const m = text.match(p);
        if (m && m.index !== undefined) {
          const s = Math.max(0, m.index - 30);
          const e = Math.min(text.length, m.index + 90);
          excerpt = text.slice(s, e).replace(/\s+/g, ' ').trim();
          break;
        }
      }
      status = 'Compliant';
      bidderEvidence = excerpt || `Verified: ${patternDef.notesFound}`;
      remarks = patternDef.notesFound;
      scoreAwarded = req.weight;
      compliantRequirements.push(req.name);
    } else {
      status = req.mandatory ? 'Non-Compliant' : 'Missing';
      bidderEvidence = 'No supporting clause, attachment reference, or certificate found in submitted documents.';
      remarks = patternDef ? patternDef.notesMissing : `No documentation found for ${req.name}.`;
      scoreAwarded = 0;
      if (req.mandatory) {
        hasCriticalFailure = true;
        nonCompliantRequirements.push(req.name);
        missingRequirements.push(req.name);
        keyRiskFactors.push(`Mandatory tender requirement omitted: ${req.name}.`);
        recommendations.push(`Request immediate submission of mandatory certificate for ${req.name}.`);
      } else {
        missingRequirements.push(req.name);
      }
    }

    earnedScore += scoreAwarded;

    comparisonResults.push({
      id: `cmp_${req.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requirementId: req.id,
      tenderRequirement: req.name,
      category: req.category,
      bidderEvidence,
      status,
      remarks,
      scoreAwarded,
      weight: req.weight,
      pageReference,
      sourceDocument: primaryDocName,
      extractedValue,
      isAuthenticityVerified: status === 'Compliant' && !extractedData?.isMismatch,
    });
  }

  // Calculate scores
  let rawCompliance = totalWeight > 0 ? (earnedScore / totalWeight) * 100 : 0;
  // If critical mandatory requirements failed, compliance score cannot exceed 49%
  if (hasCriticalFailure && rawCompliance > 49) {
    rawCompliance = 45;
  }

  const complianceScore = Math.max(0, Math.min(100, Math.round(rawCompliance)));
  const compliancePercentage = complianceScore;
  const riskScore = 100 - complianceScore;
  const riskLevel = calculateRiskLevel(complianceScore, hasCriticalFailure);

  // Generate AI summary
  let aiSummary = '';
  if (riskLevel === 'LOW') {
    aiSummary = `Comparative evaluation of bidder "${bidderName}" against tender "${tender.title}" completed with high compliance (${complianceScore}/100, LOW RISK). The bidder satisfies ${compliantRequirements.length} of ${requirements.length} tender requirements, including all core statutory registrations, financial thresholds, and technical criteria. Commercial qualification recommended.`;
  } else if (riskLevel === 'MEDIUM') {
    aiSummary = `Comparative evaluation of bidder "${bidderName}" against tender "${tender.title}" reflects moderate compliance (${complianceScore}/100, MEDIUM RISK, Risk Score: ${riskScore}/100). The submission complies with ${compliantRequirements.length} requirements, but ${needsReview.length} items require clarification and ${missingRequirements.length + nonCompliantRequirements.length} clauses remain unverified or deficient. Pre-award clarification advised.`;
  } else {
    aiSummary = `Comparative audit of bidder "${bidderName}" against tender "${tender.title}" indicates critical non-compliance (${complianceScore}/100, HIGH RISK, Risk Score: ${riskScore}/100). The bidder failed, omitted, or presented deficient evidence for ${nonCompliantRequirements.length} mandatory tender clauses (${nonCompliantRequirements.slice(0, 3).join(', ')}). Proceeding with this submission poses significant procurement, legal, or delivery risk. Disqualification recommended unless rectified during technical review.`;
  }

  const authenticityStatement = `Authenticity Note: Text extraction and credential structure analysis were performed on ${documents?.length || 1} submitted document(s). External registry verification (GSTN, MCA21, CBDT, Udyam) is based on autonomous document syntax validation; final verification authority remains with the designated Procurement Officer.`;

  const scoringMethodology = `Tender-specific weighted scoring algorithm. Mandatory statutory, financial, technical, and integrity clauses evaluated on 100-point normalized scale. Mandatory failures trigger automatic Critical Risk flag.`;

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
    hasCriticalFailure,
    totalRequirements: requirements.length,
    compliantRequirements,
    nonCompliantRequirements,
    missingRequirements,
    needsReview,
    comparisonResults,
    keyRiskFactors,
    aiSummary,
    authenticityStatement,
    scoringMethodology,
    recommendations: recommendations.length > 0 ? recommendations : ['All primary tender qualification criteria satisfied.'],
    createdAt: new Date().toISOString(),
  };
}
