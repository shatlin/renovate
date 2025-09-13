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
    
    // Return empty array for now as we're transitioning to master-detail
    const masters = []
    
    return NextResponse.json(masters)
  } catch (error) {
    console.error('Error fetching budget masters:', error)
    return NextResponse.json({ error: 'Failed to fetch budget masters' }, { status: 500 })
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
    
    const masterId = db.createBudgetMaster({
      project_id: parseInt(id),
      name: data.name,
      description: data.description || null,
      room_id: data.room_id || null,
      status: data.status || 'pending',
      created_by: session.userId
    })
    
    const master = db.getBudgetMasterById(masterId)
    
    return NextResponse.json(master, { status: 201 })
  } catch (error) {
    console.error('Error creating budget master:', error)
    return NextResponse.json({ error: 'Failed to create budget master' }, { status: 500 })
  }
}