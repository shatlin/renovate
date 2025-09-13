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
    const item = db.getBudgetMaster(parseInt(itemId))
    
    if (!item) {
      return NextResponse.json({ error: 'Budget item not found' }, { status: 404 })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching budget item:', error)
    return NextResponse.json({ error: 'Failed to fetch budget item' }, { status: 500 })
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
    
    // Update master budget item
    const item = db.updateBudgetMaster(parseInt(itemId), {
      name: data.name,
      description: data.description,
      room_id: data.room_id,
      status: data.status
    })
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json(item)
  } catch (error) {
    console.error('Error updating budget item:', error)
    return NextResponse.json({ error: 'Failed to update budget item' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await params
    const updates = await request.json()
    const db = getDb()
    
    // Build update object dynamically
    const updateData: any = {}
    
    if (updates.name !== undefined) updateData.name = updates.name
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.room_id !== undefined) updateData.room_id = updates.room_id
    if (updates.status !== undefined) updateData.status = updates.status
    
    const updatedItem = db.updateBudgetMaster(parseInt(itemId), updateData)
    
    if (!updatedItem) {
      return NextResponse.json({ error: 'Budget item not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedItem)
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
    
    // Delete master (will cascade delete all details)
    const result = db.deleteBudgetMaster(parseInt(itemId))
    
    if (!result || result.changes === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget item:', error)
    return NextResponse.json({ error: 'Failed to delete budget item' }, { status: 500 })
  }
}