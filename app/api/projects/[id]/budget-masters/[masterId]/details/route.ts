import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; masterId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { masterId } = await params
    const db = getDb()
    
    const details = db.getBudgetDetailsByMaster(parseInt(masterId))
    
    return NextResponse.json(details)
  } catch (error) {
    console.error('Error fetching budget details:', error)
    return NextResponse.json({ error: 'Failed to fetch budget details' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; masterId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { masterId } = await params
    const data = await request.json()
    const db = getDb()
    
    const detailId = db.createBudgetDetail({
      master_id: parseInt(masterId),
      type: data.type,
      name: data.name,
      description: data.description || null,
      quantity: data.quantity || 1,
      unit_price: data.unit_price || 0,
      estimated_cost: data.estimated_cost || 0,
      actual_cost: data.actual_cost || null,
      vendor: data.vendor || null,
      status: data.status || 'pending',
      category_id: data.category_id || null,
      notes: data.notes || null,
      long_notes: data.long_notes || null,
      created_by: session.userId
    })
    
    const detail = db.getBudgetDetailById(detailId)
    
    return NextResponse.json(detail, { status: 201 })
  } catch (error) {
    console.error('Error creating budget detail:', error)
    return NextResponse.json({ error: 'Failed to create budget detail' }, { status: 500 })
  }
}