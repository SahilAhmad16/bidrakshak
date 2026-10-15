import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { dbStore } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tender = await dbStore.findTenderById(id);

    if (!tender) {
      return NextResponse.json({ error: 'Tender record not found.' }, { status: 404 });
    }

    const user = await getSessionUser();
    const isCreator = user && tender.userId === user.id;
    const isPublished = tender.status === 'Published' || tender.status === ('Completed' as any);

    // If tender is not published and viewer is not the creator, restrict access
    if (!isPublished && !isCreator) {
      return NextResponse.json({ error: 'This tender is currently in Draft status and is only visible to its creator.' }, { status: 403 });
    }

    // If creator or authorized officer, include submitted applications list
    let applications: any[] = [];
    if (isCreator) {
      applications = await dbStore.findApplicationsByTender(id);
    }

    return NextResponse.json({
      success: true,
      tender,
      isCreator: !!isCreator,
      applications,
    });
  } catch (err) {
    console.error('[Get Tender Details Error]', err);
    return NextResponse.json({ error: 'Failed to retrieve tender details.' }, { status: 500 });
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
    const tender = await dbStore.findTenderById(id);

    if (!tender || tender.userId !== user.id) {
      return NextResponse.json({ error: 'Tender not found or you are not authorized to update it.' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await dbStore.updateTender(id, user.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update tender.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, tender: updated });
  } catch (err) {
    console.error('[Update Tender Error]', err);
    return NextResponse.json({ error: 'Failed to update tender.' }, { status: 500 });
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
