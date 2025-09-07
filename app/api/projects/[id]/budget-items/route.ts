import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const items = db.getBudgetItemsByProject(parseInt(id));
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return NextResponse.json({ error: 'Failed to fetch budget items' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = getDb();
    const item = db.createBudgetItem({
      ...data,
      project_id: parseInt(id)
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json({ error: 'Failed to create budget item' }, { status: 500 });
  }
}