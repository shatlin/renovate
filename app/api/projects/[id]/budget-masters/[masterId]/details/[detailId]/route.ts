import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; masterId: string; detailId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { detailId } = await params
    const data = await request.json()
    const db = getDb()
    
    db.updateBudgetDetail(parseInt(detailId), {
      type: data.type,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit_price: data.unit_price,
      estimated_cost: data.estimated_cost,
      actual_cost: data.actual_cost,
      vendor: data.vendor,
      status: data.status,
      category_id: data.category_id,
      notes: data.notes,
      long_notes: data.long_notes,
      updated_by: session.userId
    })
    
    const detail = db.getBudgetDetailById(parseInt(detailId))
    
    return NextResponse.json(detail)
  } catch (error) {
    console.error('Error updating budget detail:', error)
    return NextResponse.json({ error: 'Failed to update budget detail' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; masterId: string; detailId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { detailId } = await params
    const db = getDb()
    
    db.deleteBudgetDetail(parseInt(detailId))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget detail:', error)
    return NextResponse.json({ error: 'Failed to delete budget detail' }, { status: 500 })
  }
}