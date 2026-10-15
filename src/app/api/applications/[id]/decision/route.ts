import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';
import { OfficerDecision } from '@/types';

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
    const body = await req.json();
    const { status, remarks } = body;

    if (!status || !['Approved', 'Rejected', 'Needs Clarification'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid decision status. Must be Approved, Rejected, or Needs Clarification.' },
        { status: 400 }
      );
    }

    const decision: OfficerDecision = {
      status,
      remarks: remarks?.trim() || '',
      officerId: user.id,
      officerName: user.name,
      decidedAt: new Date().toISOString(),
    };

    const success = await dbStore.updateApplicationDecision(id, decision);
    if (!success) {
      return NextResponse.json({ error: 'Failed to record officer decision.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      decision,
      message: `Procurement officer decision recorded: ${status}`,
    });
  } catch (err) {
    console.error('[Officer Decision Error]', err);
    return NextResponse.json({ error: 'Failed to record decision.' }, { status: 500 });
  }
}
