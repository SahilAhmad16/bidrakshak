import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get('tenderId');

    if (tenderId) {
      const verifications = await dbStore.findVerificationsByTender(tenderId);
      return NextResponse.json({ success: true, verifications });
    }

    const metrics = await dbStore.getDashboardMetrics(user.id);
    return NextResponse.json({
      success: true,
      verifications: metrics.recentVerifications,
    });
  } catch (err) {
    console.error('[Get Verifications List Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve verifications.' }, { status: 500 });
  }
}
