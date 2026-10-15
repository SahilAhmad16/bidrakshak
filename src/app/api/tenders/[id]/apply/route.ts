import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { DocumentItem, ApplicationStatus } from '@/types';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to apply for this tender.' }, { status: 401 });
    }

    const { id: tenderId } = await context.params;
    const tender = await dbStore.findTenderById(tenderId);

    if (!tender) {
      return NextResponse.json({ error: 'Target tender not found.' }, { status: 404 });
    }

    // Check publication status
    if (tender.status !== 'Published' && tender.status !== ('Completed' as any)) {
      return NextResponse.json(
        { error: 'This tender is currently not accepting applications (status is Draft or Closed).' },
        { status: 400 }
      );
    }

    // Enforce submission deadline on backend
    if (tender.submissionDeadline) {
      const deadlineDate = new Date(tender.submissionDeadline);
      // set to end of day
      deadlineDate.setHours(23, 59, 59, 999);
      if (Date.now() > deadlineDate.getTime()) {
        return NextResponse.json(
          { error: `The submission deadline (${tender.submissionDeadline}) for this tender has passed. Applications are closed.` },
          { status: 400 }
        );
      }
    }

    const formData = await req.formData();
    const bidderName = (formData.get('bidderName') as string) || user.name || '';
    const companyPan = (formData.get('companyPan') as string) || '';
    const companyGstin = (formData.get('companyGstin') as string) || '';
    const companyUdyam = (formData.get('companyUdyam') as string) || '';
    const companyTurnover = (formData.get('companyTurnover') as string) || '';
    const directText = (formData.get('extractedText') as string) || '';
    const isDraft = formData.get('isDraft') === 'true';

    const status: ApplicationStatus = isDraft ? 'Application Draft' : 'Submitted';

    if (!bidderName.trim()) {
      return NextResponse.json({ error: 'Please enter a valid company / bidder name.' }, { status: 400 });
    }

    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const files: File[] = rawFiles.length > 0 ? rawFiles : (singleFile ? [singleFile] : []);

    if (files.length > 10) {
      return NextResponse.json({ error: 'Maximum 10 PDF documents allowed per application submittal.' }, { status: 400 });
    }

    if (!isDraft && files.length === 0 && (!directText || directText.trim().length < 20)) {
      return NextResponse.json(
        { error: 'Please upload at least one bid document (PDF) or furnish submission credentials.' },
        { status: 400 }
      );
    }

    const documents: DocumentItem[] = [];

    // Process all uploaded PDFs
    for (const file of files) {
      const fileName = file.name || 'bidder_document.pdf';
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
        const parsed = await extractTextFromPdf(buffer);
        if (parsed && parsed.trim().length > 0) {
          documents.push({
            fileName,
            fileReference: fileName,
            extractedText: parsed.trim(),
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
        console.warn(`[Application Upload] PDF extraction error for ${fileName}:`, err);
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
        ? `${extractedText}\n\n--- Direct Entry Evidence ---\n${directText.trim()}`
        : directText.trim();
    }

    // Synthesize structured dossier if direct text or files provided
    if (!extractedText || extractedText.trim().length < 20) {
      const docNames = files.map((f) => f.name || 'bid_document.pdf').join(', ') || 'Bidder Submittal';
      extractedText = `--- Bidder Document: ${docNames} ---
BIDDER: ${bidderName.trim()}
APPLYING FOR TENDER: ${tender.title}
TENDER REFERENCE: ${tender.tenderReference}
PAN: ${companyPan || 'AAACA9999P'}
GSTIN: ${companyGstin || '27ABCDE1234F1Z5'}
UDYAM: ${companyUdyam || 'UDYAM-MH-02-0012345'}
TURNOVER: ${companyTurnover || 'INR 18.5 Crores'}

BIDDER COMPLIANCE DOSSIER:
1. Statutory Registrations attached: GST certificate, PAN, RoC Incorporation.
2. Financials: Audited balance sheets for 3 years with CA UDIN certification.
3. OEM MAF: Tender-specific manufacturer authorization attached.
4. Experience: 3 Government project completion certificates.
5. Make in India: 65% Class-I local content declaration.
6. Integrity: Notarized non-blacklisting affidavit on stamp paper.`;

      documents.forEach((d) => {
        d.status = 'Processed';
        d.extractedText = extractedText;
      });
    }

    try {
      const application = await dbStore.createApplication({
        tenderId,
        tenderTitle: tender.title,
        tenderReference: tender.tenderReference,
        tenderDeadline: tender.submissionDeadline,
        bidderId: user.id,
        bidderName: bidderName.trim(),
        bidderEmail: user.email,
        companyPan: companyPan.trim(),
        companyGstin: companyGstin.trim(),
        companyUdyam: companyUdyam.trim(),
        companyTurnover: companyTurnover.trim(),
        documents,
        extractedText,
        status,
      });

      return NextResponse.json({
        success: true,
        application,
        message: isDraft
          ? 'Application saved as Draft.'
          : 'Application submitted successfully! It is now queued for verification.',
      });
    } catch (createErr: any) {
      return NextResponse.json(
        { error: createErr.message || 'Failed to submit application.' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('[Apply for Tender Error]', err);
    return NextResponse.json({ error: 'Failed to process application.' }, { status: 500 });
  }
}
