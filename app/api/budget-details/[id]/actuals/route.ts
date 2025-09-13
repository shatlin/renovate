import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const db = getDb()
    
    // Get all actuals for this budget detail
    const actuals = db.getBudgetActuals(parseInt(id))
    
    return NextResponse.json(actuals)
  } catch (error) {
    console.error('Error fetching budget actuals:', error)
    return NextResponse.json({ error: 'Failed to fetch budget actuals' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const db = getDb()
    
    // Create new actual for this budget detail
    const actual = db.createBudgetActual({
      detail_id: parseInt(id),
      name: data.name,
      quantity: data.quantity || 1,
      unit_price: data.unit_price || 0,
      total_amount: data.total_amount || (data.quantity * data.unit_price),
      vendor: data.vendor,
      invoice_number: data.invoice_number,
      purchase_date: data.purchase_date,
      payment_method: data.payment_method,
      notes: data.notes
    })
    
    return NextResponse.json(actual)
  } catch (error) {
    console.error('Error creating budget actual:', error)
    return NextResponse.json({ error: 'Failed to create budget actual' }, { status: 500 })
  }
}