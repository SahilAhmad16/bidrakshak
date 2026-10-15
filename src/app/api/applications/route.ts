import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get('tenderId');
    const role = searchParams.get('role');

    // If tenderId is specified, fetch applications for that specific tender
    if (tenderId) {
      const applications = await dbStore.findApplicationsByTender(tenderId);
      return NextResponse.json({ success: true, applications });
    }

    // Default: fetch applications submitted by this bidder
    const applications = await dbStore.findApplicationsByBidder(user.id);
    return NextResponse.json({ success: true, applications });
  } catch (err) {
    console.error('[Get Applications Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve applications.' }, { status: 500 });
  }
}
