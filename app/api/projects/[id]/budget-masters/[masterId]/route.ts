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
    
    const master = db.getBudgetMasterById(parseInt(masterId))
    if (!master) {
      return NextResponse.json({ error: 'Budget master not found' }, { status: 404 })
    }
    
    return NextResponse.json(master)
  } catch (error) {
    console.error('Error fetching budget master:', error)
    return NextResponse.json({ error: 'Failed to fetch budget master' }, { status: 500 })
  }
}

export async function PUT(
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
    
    db.updateBudgetMaster(parseInt(masterId), {
      name: data.name,
      description: data.description,
      room_id: data.room_id,
      status: data.status,
      updated_by: session.userId
    })
    
    const master = db.getBudgetMasterById(parseInt(masterId))
    
    return NextResponse.json(master)
  } catch (error) {
    console.error('Error updating budget master:', error)
    return NextResponse.json({ error: 'Failed to update budget master' }, { status: 500 })
  }
}

export async function DELETE(
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
    
    db.deleteBudgetMaster(parseInt(masterId))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting budget master:', error)
    return NextResponse.json({ error: 'Failed to delete budget master' }, { status: 500 })
  }
}