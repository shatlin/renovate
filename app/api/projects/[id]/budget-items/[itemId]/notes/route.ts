import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const db = getDb();
    const notes = db.getBudgetMasterNotes(parseInt(itemId));
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching budget master notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const data = await request.json();
    const session = await getSession();
    
    const db = getDb();
    const note = db.createBudgetMasterNote({
      budget_master_id: parseInt(itemId),
      note: data.note,
      created_by: session?.userId
    });
    
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Error creating budget master note:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}