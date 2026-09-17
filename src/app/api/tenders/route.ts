import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { extractTenderRequirements } from '@/lib/analysis-engine';
import { DocumentItem } from '@/types';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

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

    // Rule 6: Maximum 10 PDFs per batch
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

      // Validate format
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

      // Validate file size (25MB)
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

    // Combine extracted text from ALL successfully processed PDFs
    const processedDocs = documents.filter((d) => d.status === 'Processed' && d.extractedText);
    const textSegments = processedDocs.map((d) => `--- Document: ${d.fileName} ---\n${d.extractedText}`);

    let extractedText = textSegments.join('\n\n');
    if (directText.trim()) {
      extractedText = extractedText
        ? `${extractedText}\n\n--- Direct Entry Clauses ---\n${directText.trim()}`
        : directText.trim();
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from the tender document(s). Please ensure the PDFs have readable text or enter clauses.' },
        { status: 400 }
      );
    }

    // Determine documentRef string representation
    let documentRef = 'Manual_Entry.pdf';
    if (documents.length === 1) {
      documentRef = documents[0].fileName;
    } else if (documents.length > 1) {
      const processedCount = processedDocs.length;
      documentRef = `${processedCount} Document${processedCount === 1 ? '' : 's'} (${documents.map((d) => d.fileName).join(', ')})`;
    }

    // AI extracts this specific tender's requirement criteria from ALL combined documents
    const requirements = extractTenderRequirements(extractedText, {
      title: title.trim(),
      organization: organization.trim(),
      tenderReference: tenderReference.trim(),
    });

    const tender = await dbStore.createTender({
      title: title.trim(),
      organization: organization.trim(),
      tenderReference: tenderReference.trim() || `TND-${Date.now().toString().slice(-6)}`,
      documentRef,
      extractedText,
      userId: user.id,
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
