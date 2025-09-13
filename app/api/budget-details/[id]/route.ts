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
    
    // Get the budget detail
    const detail = db.getBudgetDetail(parseInt(id))
    
    if (!detail) {
      return NextResponse.json({ error: 'Budget detail not found' }, { status: 404 })
    }
    
    return NextResponse.json(detail)
  } catch (error) {
    console.error('Error fetching budget detail:', error)
    return NextResponse.json({ error: 'Failed to fetch budget detail' }, { status: 500 })
  }
}

export async function DELETE(
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
    
    // Delete the budget detail
    const success = db.deleteBudgetDetail(parseInt(id))
    
    if (success) {
      return NextResponse.json({ message: 'Budget detail deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Budget detail not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting budget detail:', error)
    return NextResponse.json({ error: 'Failed to delete budget detail' }, { status: 500 })
  }
}

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
    const data = await request.json()
    const db = getDb()
    
    // Update the budget detail
    const updatedDetail = db.updateBudgetDetail(parseInt(id), data)
    
    if (updatedDetail) {
      return NextResponse.json(updatedDetail)
    } else {
      return NextResponse.json({ error: 'Budget detail not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating budget detail:', error)
    return NextResponse.json({ error: 'Failed to update budget detail' }, { status: 500 })
  }
}