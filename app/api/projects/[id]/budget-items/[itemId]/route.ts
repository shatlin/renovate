import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params
    const updates = await request.json()
    const db = getDb()
    
    // Build update query dynamically based on provided fields
    const updateFields = [];
    const values = [];
    
    if (updates.actual_cost !== undefined) {
      updateFields.push('actual_cost = ?');
      values.push(updates.actual_cost);
    }
    
    if (updates.status !== undefined) {
      updateFields.push('status = ?');
      values.push(updates.status);
    }
    
    if (updates.notes !== undefined) {
      updateFields.push('notes = ?');
      values.push(updates.notes);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    
    // Add updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add IDs for WHERE clause
    values.push(parseInt(itemId), parseInt(id));
    
    const query = `
      UPDATE budget_items 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND project_id = ?
    `;
    
    const result = db.db.prepare(query).run(...values);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Budget item not found' }, { status: 404 });
    }
    
    // Fetch and return the updated item
    const updatedItem = db.db.prepare(`
      SELECT bi.*, r.name as room_name, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM budget_items bi
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE bi.id = ? AND bi.project_id = ?
    `).get(parseInt(itemId), parseInt(id));
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating budget item:', error)
    return NextResponse.json({ error: 'Failed to update budget item' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await params
    const data = await request.json()
    const db = getDb()
    
    const item = db.updateBudgetItem(parseInt(itemId), data)
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating budget item:', error)
    return NextResponse.json({ error: 'Failed to update budget item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await params
    const db = getDb()
    
    const success = db.deleteBudgetItem(parseInt(itemId))
    
    if (!success) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget item:', error)
    return NextResponse.json({ error: 'Failed to delete budget item' }, { status: 500 })
  }
}