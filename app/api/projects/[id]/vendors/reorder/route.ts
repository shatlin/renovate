import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { vendorOrders } = await request.json()

    const db = getDb()
    
    // Update display_order for each vendor
    for (const order of vendorOrders) {
      db.prepare(
        'UPDATE vendors SET display_order = ? WHERE id = ? AND project_id = ?'
      ).run(order.display_order, order.id, parseInt(id))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}