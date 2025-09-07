import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { roomOrders } = await request.json()

    const db = getDb()
    
    // Update display_order for each room
    for (const order of roomOrders) {
      db.updateRoom(order.id, { display_order: order.display_order })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}