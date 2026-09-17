import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { compareBidderAgainstTender } from '@/lib/analysis-engine';
import { DocumentItem } from '@/types';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id: tenderId } = await context.params;
    const tender = await dbStore.findTenderById(tenderId);

    if (!tender || tender.userId !== user.id) {
      return NextResponse.json({ error: 'Target tender not found.' }, { status: 404 });
    }

    const formData = await req.formData();
    const bidderName = (formData.get('bidderName') as string) || '';
    const directText = (formData.get('extractedText') as string) || '';

    // Support both multiple files ('files') and legacy single file ('file')
    const rawFiles = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;
    const files: File[] = rawFiles.length > 0 ? rawFiles : (singleFile ? [singleFile] : []);

    if (!bidderName || bidderName.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid Bidder / Organization name.' }, { status: 400 });
    }

    // Rule 6: Maximum 10 PDFs per batch
    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 bidder PDF documents allowed per batch.' },
        { status: 400 }
      );
    }

    if (files.length === 0 && (!directText || directText.trim().length < 20)) {
      return NextResponse.json(
        { error: 'Please upload at least one bidder PDF document or provide submission text.' },
        { status: 400 }
      );
    }

    const documents: DocumentItem[] = [];

    // Process all bidder PDFs in batch: extract text, mark status Processed or Failed
    for (const file of files) {
      const fileName = file.name || 'bidder_document.pdf';
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

      // Validate size (25MB)
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
        console.warn(`[Bidder Upload] PDF extraction error for ${fileName}:`, err);
        documents.push({
          fileName,
          fileReference: fileName,
          extractedText: '',
          status: 'Failed',
          fileSize: file.size,
        });
      }
    }

    // Combine extracted text from ALL successfully processed PDFs into complete bidder evidence set
    const processedDocs = documents.filter((d) => d.status === 'Processed' && d.extractedText);
    const textSegments = processedDocs.map((d) => `--- Bidder Document: ${d.fileName} ---\n${d.extractedText}`);

    let bidderText = textSegments.join('\n\n');
    if (directText.trim()) {
      bidderText = bidderText
        ? `${bidderText}\n\n--- Direct Entry Evidence ---\n${directText.trim()}`
        : directText.trim();
    }

    if (!bidderText || bidderText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from the bidder document(s). Please upload clear PDFs or provide text.' },
        { status: 400 }
      );
    }

    // Determine bidderDocRef string representation
    let bidderDocRef = 'Bidder_Submittal.pdf';
    if (documents.length === 1) {
      bidderDocRef = documents[0].fileName;
    } else if (documents.length > 1) {
      const processedCount = processedDocs.length;
      bidderDocRef = `${processedCount} Document${processedCount === 1 ? '' : 's'} (${documents.map((d) => d.fileName).join(', ')})`;
    }

    // Run clause-by-clause comparison between ALL tender requirements and ALL bidder evidence
    const report = compareBidderAgainstTender(
      tender,
      bidderName.trim(),
      bidderDocRef,
      bidderText,
      documents
    );

    // Save report associated with tender & user
    const saved = await dbStore.saveVerification({
      ...report,
      documents,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      verification: saved,
    });
  } catch (err) {
    console.error('[Verify Bidder Error]', err);
    return NextResponse.json({ error: 'Failed to verify bidder against tender.' }, { status: 500 });
  }
}
