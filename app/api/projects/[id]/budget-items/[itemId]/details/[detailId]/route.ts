import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string; detailId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { detailId } = await params
    const db = getDb()
    const detail = db.getBudgetDetail(parseInt(detailId))
    
    if (!detail) {
      return NextResponse.json({ error: 'Detail not found' }, { status: 404 })
    }
    
    return NextResponse.json(detail)
  } catch (error) {
    console.error('Error fetching budget detail:', error)
    return NextResponse.json({ error: 'Failed to fetch budget detail' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string; detailId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, detailId } = await params
    const data = await request.json()
    const db = getDb()
    
    // Update the detail
    const detail = db.updateBudgetDetail(parseInt(detailId), {
      category_id: data.category_id,
      type: data.type,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit_price: data.unit_price,
      estimated_cost: data.estimated_cost,
      actual_cost: data.actual_cost,
      vendor: data.vendor,
      notes: data.notes,
      long_notes: data.long_notes,
      status: data.status
    })
    
    if (!detail) {
      return NextResponse.json({ error: 'Detail not found' }, { status: 404 })
    }
    
    // Return updated detail with updated master totals
    const updatedMaster = db.getBudgetMaster(parseInt(itemId))
    
    return NextResponse.json({
      detail,
      master: updatedMaster
    })
  } catch (error) {
    console.error('Error updating budget detail:', error)
    return NextResponse.json({ error: 'Failed to update budget detail' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string; detailId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId, detailId } = await params
    const db = getDb()
    
    // Delete the detail
    const result = db.deleteBudgetDetail(parseInt(detailId))
    
    if (!result || result.changes === 0) {
      return NextResponse.json({ error: 'Detail not found' }, { status: 404 })
    }
    
    // Return updated master totals
    const updatedMaster = db.getBudgetMaster(parseInt(itemId))
    
    return NextResponse.json({
      success: true,
      master: updatedMaster
    })
  } catch (error) {
    console.error('Error deleting budget detail:', error)
    return NextResponse.json({ error: 'Failed to delete budget detail' }, { status: 500 })
  }
}