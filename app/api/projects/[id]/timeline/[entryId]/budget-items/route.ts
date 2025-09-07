import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, entryId } = await params
    const db = getDb()
    
    const items = db.db.prepare(`
      SELECT 
        tbi.*,
        bi.name as budget_item_name,
        bi.description as budget_item_description,
        bi.estimated_cost,
        bi.actual_cost as budget_item_actual_cost,
        bi.room_id,
        bi.category_id,
        bi.vendor,
        bi.status as budget_item_status,
        r.name as room_name,
        c.name as category_name
      FROM timeline_budget_items tbi
      JOIN budget_items bi ON tbi.budget_item_id = bi.id
      LEFT JOIN rooms r ON bi.room_id = r.id
      LEFT JOIN categories c ON bi.category_id = c.id
      WHERE tbi.timeline_entry_id = ?
      ORDER BY tbi.created_at DESC
    `).all(parseInt(entryId))
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching timeline budget items:', error)
    return NextResponse.json({ error: 'Failed to fetch budget items' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, entryId } = await params
    const { budget_item_id, allocated_amount, actual_amount, notes } = await request.json()
    
    const db = getDb()
    
    // Check if this budget item is already linked
    const existing = db.db.prepare(`
      SELECT * FROM timeline_budget_items 
      WHERE timeline_entry_id = ? AND budget_item_id = ?
    `).get(parseInt(entryId), budget_item_id)
    
    if (existing) {
      // Update existing link
      const stmt = db.db.prepare(`
        UPDATE timeline_budget_items
        SET allocated_amount = ?, actual_amount = ?, notes = ?
        WHERE timeline_entry_id = ? AND budget_item_id = ?
      `)
      
      stmt.run(
        allocated_amount || 0,
        actual_amount || 0,
        notes || '',
        parseInt(entryId),
        budget_item_id
      )
      
      return NextResponse.json({ 
        message: 'Budget item link updated',
        id: existing.id 
      })
    } else {
      // Create new link
      const stmt = db.db.prepare(`
        INSERT INTO timeline_budget_items (
          timeline_entry_id, 
          budget_item_id, 
          allocated_amount, 
          actual_amount, 
          notes
        ) VALUES (?, ?, ?, ?, ?)
      `)
      
      const result = stmt.run(
        parseInt(entryId),
        budget_item_id,
        allocated_amount || 0,
        actual_amount || 0,
        notes || ''
      )
      
      return NextResponse.json({ 
        message: 'Budget item linked successfully',
        id: result.lastInsertRowid 
      })
    }
  } catch (error) {
    console.error('Error linking budget item:', error)
    return NextResponse.json({ error: 'Failed to link budget item' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entryId } = await params
    const { budget_item_id } = await request.json()
    
    const db = getDb()
    
    const stmt = db.db.prepare(`
      DELETE FROM timeline_budget_items 
      WHERE timeline_entry_id = ? AND budget_item_id = ?
    `)
    
    const result = stmt.run(parseInt(entryId), budget_item_id)
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Budget item unlinked successfully' })
  } catch (error) {
    console.error('Error unlinking budget item:', error)
    return NextResponse.json({ error: 'Failed to unlink budget item' }, { status: 500 })
  }
}