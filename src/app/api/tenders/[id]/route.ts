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
    const tender = await dbStore.findTenderById(id);

    if (!tender || tender.userId !== user.id) {
      return NextResponse.json({ error: 'Tender record not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, tender });
  } catch (err) {
    console.error('[Get Tender Details Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve tender analysis.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = await context.params;
    const deleted = await dbStore.deleteTender(id, user.id);

    if (!deleted) {
      return NextResponse.json({ error: 'Tender could not be deleted or was not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Tender deleted successfully.' });
  } catch (err) {
    console.error('[Delete Tender Error]', err);
    return NextResponse.json({ error: 'Failed to delete tender.' }, { status: 500 });
  }
}
