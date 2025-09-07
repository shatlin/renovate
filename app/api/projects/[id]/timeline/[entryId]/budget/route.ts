import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entryId } = await params
    const db = getDb()
    const budgetItems = db.getTimelineBudgetItems(parseInt(entryId))
    
    return NextResponse.json(budgetItems)
  } catch (error) {
    console.error('Error fetching timeline budget items:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline budget items' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entryId } = await params
    const data = await request.json()
    const db = getDb()
    
    db.linkBudgetToTimeline(
      parseInt(entryId),
      data.budgetItemId,
      data.allocatedAmount || 0,
      data.actualAmount || 0,
      data.notes
    )
    
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Error linking budget to timeline:', error)
    return NextResponse.json({ error: 'Failed to link budget to timeline' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { entryId } = await params
    const { budgetItemId } = await request.json()
    const db = getDb()
    
    db.unlinkBudgetFromTimeline(parseInt(entryId), budgetItemId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unlinking budget from timeline:', error)
    return NextResponse.json({ error: 'Failed to unlink budget from timeline' }, { status: 500 })
  }
}