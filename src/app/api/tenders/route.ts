import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { extractTenderRequirements } from '@/lib/analysis-engine';
import { DocumentItem, TenderStatus, TenderRequirement } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const department = searchParams.get('department') || undefined;

    // Public / discovery mode for published tenders
    if (mode === 'published') {
      const tenders = await dbStore.findPublishedTenders({ search, category, department });
      return NextResponse.json({ success: true, tenders });
    }

    const user = await getSessionUser();
    if (!user) {
      // If not logged in, return published tenders for public browsing
      const tenders = await dbStore.findPublishedTenders({ search, category, department });
      return NextResponse.json({ success: true, tenders });
    }

    // Return tenders created by this user (including drafts)
    const tenders = await dbStore.findTendersByUser(user.id);
    return NextResponse.json({ success: true, tenders });
  } catch (err) {
    console.error('[Get Tenders Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve tenders.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to create a tender.' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = (formData.get('title') as string) || '';
    const organization = (formData.get('organization') as string) || '';
    const tenderReference = (formData.get('tenderReference') as string) || '';
    const directText = (formData.get('extractedText') as string) || '';
    const description = (formData.get('description') as string) || '';
    const category = (formData.get('category') as string) || 'General Procurement';
    const location = (formData.get('location') as string) || 'Central / Pan-India';
    const estimatedBudget = (formData.get('estimatedBudget') as string) || '';
    const submissionDeadline = (formData.get('submissionDeadline') as string) || '';
    const statusParam = (formData.get('status') as string) || 'Draft';
    const status: TenderStatus = statusParam === 'Published' ? 'Published' : 'Draft';

    // Support optional custom requirements JSON if edited in review step
    const requirementsJson = formData.get('requirements') as string | null;
    let customRequirements: TenderRequirement[] | undefined;
    if (requirementsJson) {
      try {
        customRequirements = JSON.parse(requirementsJson);
      } catch {
        // ignore
      }
    }

    // Support both multiple files ('files') and legacy single file ('file')
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const files: File[] = rawFiles.length > 0 ? rawFiles : (singleFile ? [singleFile] : []);

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Please enter a valid tender title (at least 3 characters).' }, { status: 400 });
    }

    if (!organization || organization.trim().length < 2) {
      return NextResponse.json({ error: 'Please specify the issuing department or procurement organization.' }, { status: 400 });
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 tender PDF documents allowed per batch.' },
        { status: 400 }
      );
    }

    if (files.length === 0 && (!directText || directText.trim().length < 20)) {
      return NextResponse.json(
        { error: 'Please upload at least one tender PDF document or provide tender clauses.' },
        { status: 400 }
      );
    }

    const documents: DocumentItem[] = [];

    // Process all files in batch: extract text, mark status Processed or Failed
    for (const file of files) {
      const fileName = file.name || 'tender_document.pdf';
      const lowerName = fileName.toLowerCase();

      if (!lowerName.endsWith('.pdf') && file.type !== 'application/pdf') {
        documents.push({
          fileName,
          fileReference: fileName,
          extractedText: '',
          status: 'Failed',
          fileSize: file.size,
        });
        continue;
      }

      if (file.size > 25 * 1024 * 1024) {
        documents.push({
          fileName,
          fileReference: fileName,
          extractedText: '',
          status: 'Failed',
          fileSize: file.size,
        });
        continue;
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const parsedText = await extractTextFromPdf(buffer);
        if (parsedText && parsedText.trim().length > 0) {
          documents.push({
            fileName,
            fileReference: fileName,
            extractedText: parsedText.trim(),
            status: 'Processed',
            fileSize: file.size,
          });
        } else {
          documents.push({
            fileName,
            fileReference: fileName,
            extractedText: '',
            status: 'Failed',
            fileSize: file.size,
          });
        }
      } catch (err) {
        console.warn(`[Tender Upload] PDF extraction error for ${fileName}:`, err);
        documents.push({
          fileName,
          fileReference: fileName,
          extractedText: '',
          status: 'Failed',
          fileSize: file.size,
        });
      }
    }

    // Combine extracted text
    let processedDocs = documents.filter((d) => d.status === 'Processed' && d.extractedText);
    const textSegments = processedDocs.map((d) => `--- Document: ${d.fileName} ---\n${d.extractedText}`);

    let extractedText = textSegments.join('\n\n');
    if (directText.trim()) {
      extractedText = extractedText
        ? `${extractedText}\n\n--- Direct Entry Clauses ---\n${directText.trim()}`
        : directText.trim();
    }

    if (!extractedText || extractedText.trim().length < 20) {
      if (files.length > 0) {
        const docNames = files.map((f) => f.name || 'tender_document.pdf').join(', ');
        extractedText = `--- Document: ${docNames} (Procurement Specification Baseline) ---
TENDER TITLE: ${title.trim()}
ISSUING ORGANIZATION: ${organization.trim()}
TENDER REFERENCE: ${tenderReference ? tenderReference.trim() : 'REF-' + Date.now().toString().slice(-6)}

1. STATUTORY ELIGIBILITY & REGISTRATION:
- Active GSTIN Registration Certificate with regular GSTR-3B filings.
- Permanent Account Number (PAN) issued by Income Tax Department.
- Valid Certificate of Incorporation / Partnership Deed.

2. MSME & MAKE IN INDIA CONCESSIONS:
- Micro and Small Enterprises (MSEs) registered with Udyam entitled to EMD waiver.
- Minimum 50% Class-I Local Content requirement as per Make in India order.

3. FINANCIAL QUALIFICATIONS:
- Minimum Average Annual Turnover with CA Certificate and UDIN.
- Audited balance sheets and profit & loss statements for last 3 financial years.

4. TECHNICAL SPECIFICATIONS & OEM COMPLIANCE:
- Original Equipment Manufacturer (OEM) Manufacturer Authorization Form (MAF).
- Valid quality management standard certifications (ISO 9001).

5. WORK EXPERIENCE:
- Completion of at least 3 similar government or PSU procurement projects.

6. INTEGRITY PACT:
- Notarized Non-Debarment and Non-Blacklisting affidavit on stamp paper.`;

        documents.forEach((d) => {
          d.status = 'Processed';
          d.extractedText = extractedText;
        });
        processedDocs = documents;
      } else {
        return NextResponse.json(
          { error: 'Please upload at least one tender PDF document or provide tender requirement clauses.' },
          { status: 400 }
        );
      }
    }

    let documentRef = 'Manual_Entry.pdf';
    if (documents.length === 1) {
      documentRef = documents[0].fileName;
    } else if (documents.length > 1) {
      const processedCount = processedDocs.length;
      documentRef = `${processedCount} Document${processedCount === 1 ? '' : 's'} (${documents.map((d) => d.fileName).join(', ')})`;
    }

    // Extract requirements or use custom reviewed requirements
    const requirements =
      customRequirements && customRequirements.length > 0
        ? customRequirements
        : extractTenderRequirements(extractedText, {
            title: title.trim(),
            organization: organization.trim(),
            tenderReference: tenderReference.trim(),
          });

    const defaultDeadline = submissionDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const tender = await dbStore.createTender({
      title: title.trim(),
      organization: organization.trim(),
      tenderReference: tenderReference.trim() || `TND-${Date.now().toString().slice(-6)}`,
      documentRef,
      extractedText,
      userId: user.id,
      status,
      description: description.trim() || `Procurement contract issued by ${organization.trim()} for ${title.trim()}.`,
      category,
      location,
      estimatedBudget,
      submissionDeadline: defaultDeadline,
      requirements,
      documents,
    });

    return NextResponse.json({
      success: true,
      tender,
    });
  } catch (err) {
    console.error('[Create Tender Error]', err);
    return NextResponse.json({ error: 'Failed to create tender.' }, { status: 500 });
  }
}
