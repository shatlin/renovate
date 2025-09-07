import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { items } = await request.json();
    const db = getDb();
    
    // Update display_order for each item
    const stmt = db.db.prepare('UPDATE budget_items SET display_order = ? WHERE id = ? AND project_id = ?');
    
    items.forEach((item: { id: number; display_order: number }) => {
      stmt.run(item.display_order, item.id, parseInt(id));
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering budget items:', error);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}