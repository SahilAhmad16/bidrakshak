import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const metrics = await dbStore.getDashboardMetrics(user.id);
    return NextResponse.json({ success: true, metrics });
  } catch (err) {
    console.error('[Dashboard Metrics Error]', err);
    return NextResponse.json({ error: 'Failed to load dashboard metrics.' }, { status: 500 });
  }
}
