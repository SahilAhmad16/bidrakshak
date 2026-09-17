import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';

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
    const verification = await dbStore.findVerificationById(id);

    if (!verification) {
      return NextResponse.json({ error: 'Verification audit report not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, verification });
  } catch (err) {
    console.error('[Get Verification Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve verification audit.' }, { status: 500 });
  }
}
