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
    
    const actual = db.getBudgetActual(parseInt(id))
    
    if (!actual) {
      return NextResponse.json({ error: 'Budget actual not found' }, { status: 404 })
    }
    
    return NextResponse.json(actual)
  } catch (error) {
    console.error('Error fetching budget actual:', error)
    return NextResponse.json({ error: 'Failed to fetch budget actual' }, { status: 500 })
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
    
    const updatedActual = db.updateBudgetActual(parseInt(id), data)
    
    if (updatedActual) {
      return NextResponse.json(updatedActual)
    } else {
      return NextResponse.json({ error: 'Budget actual not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating budget actual:', error)
    return NextResponse.json({ error: 'Failed to update budget actual' }, { status: 500 })
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
    
    const success = db.deleteBudgetActual(parseInt(id))
    
    if (success) {
      return NextResponse.json({ message: 'Budget actual deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Budget actual not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting budget actual:', error)
    return NextResponse.json({ error: 'Failed to delete budget actual' }, { status: 500 })
  }
}