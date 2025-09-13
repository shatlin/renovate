import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string; noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const db = getDb();
    db.deleteBudgetMasterNote(parseInt(noteId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget master note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}