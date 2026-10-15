import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { compareBidderAgainstTender } from '@/lib/analysis-engine';

export async function POST(
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
    if (!tender) {
      return NextResponse.json({ error: 'Associated tender record not found.' }, { status: 404 });
    }

    // Determine document ref string representation
    let docRef = 'Application_Evidence.pdf';
    if (application.documents && application.documents.length === 1) {
      docRef = application.documents[0].fileName;
    } else if (application.documents && application.documents.length > 1) {
      docRef = `${application.documents.length} Documents (${application.documents.map((d) => d.fileName).join(', ')})`;
    }

    // Run clause-by-clause evaluation of application evidence against tender
    const report = compareBidderAgainstTender(
      tender,
      application.bidderName,
      docRef,
      application.extractedText,
      application.documents
    );

    // Save verification report linked to this application
    const saved = await dbStore.saveVerification({
      ...report,
      applicationId: application.id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      verification: saved,
      message: 'Compliance verification completed successfully.',
    });
  } catch (err) {
    console.error('[Run Verification Error]', err);
    return NextResponse.json({ error: 'Failed to execute verification audit.' }, { status: 500 });
  }
}
