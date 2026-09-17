import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id: verificationId } = await context.params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || !['helpful', 'not_helpful'].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating. Please select Helpful or Not Helpful.' }, { status: 400 });
    }

    const updated = await dbStore.submitVerificationFeedback(verificationId, {
      rating,
      comment: typeof comment === 'string' ? comment.trim() : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Verification report not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully.',
    });
  } catch (err) {
    console.error('[Feedback Submission Error]', err);
    return NextResponse.json({ error: 'Failed to record feedback.' }, { status: 500 });
  }
}
