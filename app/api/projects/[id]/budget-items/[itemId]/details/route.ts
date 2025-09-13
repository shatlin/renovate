import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(
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
    const details = db.getBudgetDetailsByMaster(parseInt(itemId))
    
    return NextResponse.json(details)
  } catch (error) {
    console.error('Error fetching budget details:', error)
    return NextResponse.json({ error: 'Failed to fetch budget details' }, { status: 500 })
  }
}

export async function POST(
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
    
    // Create new detail for this master
    const detail = db.createBudgetDetail({
      master_id: parseInt(itemId),
      category_id: data.category_id || null,
      type: data.type || 'material',
      name: data.name,
      description: data.description || null,
      quantity: data.quantity || 1,
      unit_price: data.unit_price || 0,
      estimated_cost: data.estimated_cost || 0,
      actual_cost: data.actual_cost || null,
      vendor: data.vendor || null,
      notes: data.notes || null,
      long_notes: data.long_notes || null,
      status: data.status || 'pending'
    })
    
    // Return the created detail with updated master totals
    const updatedMaster = db.getBudgetMaster(parseInt(itemId))
    
    return NextResponse.json({
      detail,
      master: updatedMaster
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating budget detail:', error)
    return NextResponse.json({ error: 'Failed to create budget detail' }, { status: 500 })
  }
}