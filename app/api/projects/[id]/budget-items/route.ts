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
    
    // Ensure all fields are properly set with defaults if undefined
    const item = db.createBudgetItem({
      project_id: parseInt(id),
      name: data.name,
      description: data.description || null,
      room_id: data.room_id || null,
      category_id: data.category_id || null,
      quantity: data.quantity || 1,
      unit_price: data.unit_price || 0,
      estimated_cost: data.estimated_cost || 0,
      actual_cost: data.actual_cost || null,
      vendor: data.vendor || null,
      notes: data.notes || null,
      long_notes: data.long_notes || null,
      status: data.status || 'pending',
      type: data.type || 'material'
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json({ error: 'Failed to create budget item' }, { status: 500 });
  }
}