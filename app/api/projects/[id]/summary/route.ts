import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const summary = db.getProjectSummary(parseInt(id));
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching project summary:', error);
    return NextResponse.json({ error: 'Failed to fetch project summary' }, { status: 500 });
  }
}