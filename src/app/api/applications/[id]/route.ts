import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { extractTextFromPdf } from '@/lib/pdf-extractor';
import { DocumentItem } from '@/types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = await context.params;
    const application = await dbStore.findApplicationById(id);

    if (!application) {
      return NextResponse.json({ error: 'Application record not found.' }, { status: 404 });
    }

    const tender = await dbStore.findTenderById(application.tenderId);

    return NextResponse.json({
      success: true,
      application,
      tender,
    });
  } catch (err) {
    console.error('[Get Application Details Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve application details.' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await dbStore.findApplicationById(id);

    if (!existing || existing.bidderId !== user.id) {
      return NextResponse.json({ error: 'Application not found or unauthorized.' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    let updateData: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const bidderName = formData.get('bidderName') as string | null;
      const companyPan = formData.get('companyPan') as string | null;
      const companyGstin = formData.get('companyGstin') as string | null;
      const companyUdyam = formData.get('companyUdyam') as string | null;
      const companyTurnover = formData.get('companyTurnover') as string | null;
      const directText = formData.get('extractedText') as string | null;
      const submitNow = formData.get('submit') === 'true';

      if (bidderName) updateData.bidderName = bidderName.trim();
      if (companyPan !== null) updateData.companyPan = companyPan.trim();
      if (companyGstin !== null) updateData.companyGstin = companyGstin.trim();
      if (companyUdyam !== null) updateData.companyUdyam = companyUdyam.trim();
      if (companyTurnover !== null) updateData.companyTurnover = companyTurnover.trim();

      const rawFiles = formData.getAll('files') as File[];
      if (rawFiles.length > 0) {
        const documents: DocumentItem[] = [];
        for (const file of rawFiles) {
          const fileName = file.name || 'bidder_document.pdf';
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const parsed = await extractTextFromPdf(buffer);
            documents.push({
              fileName,
              fileReference: fileName,
              extractedText: parsed.trim(),
              status: parsed ? 'Processed' : 'Failed',
              fileSize: file.size,
            });
          } catch {
            documents.push({
              fileName,
              fileReference: fileName,
              extractedText: '',
              status: 'Failed',
              fileSize: file.size,
            });
          }
        }
        updateData.documents = documents;
        const processedDocs = documents.filter((d) => d.status === 'Processed' && d.extractedText);
        let extractedText = processedDocs.map((d) => `--- Document: ${d.fileName} ---\n${d.extractedText}`).join('\n\n');
        if (directText) extractedText += `\n\n${directText}`;
        updateData.extractedText = extractedText;
      }

      if (submitNow) {
        updateData.status = 'Submitted';
      }
    } else {
      updateData = await req.json();
    }

    const updated = await dbStore.updateApplication(id, user.id, updateData);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update application.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (err) {
    console.error('[Update Application Error]', err);
    return NextResponse.json({ error: 'Failed to update application.' }, { status: 500 });
  }
}
