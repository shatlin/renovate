import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifySession } from '@/lib/auth/session'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { vendorOrders } = await request.json()

    const db = await getDb()
    
    // Update display_order for each vendor
    for (const order of vendorOrders) {
      await db.execute(
        'UPDATE vendors SET display_order = ? WHERE id = ? AND project_id = ?',
        [order.display_order, order.id, id]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering vendors:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}