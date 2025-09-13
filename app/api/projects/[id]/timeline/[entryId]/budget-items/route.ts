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
    
    const items = db.getTimelineBudgetItems(parseInt(entryId))
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching timeline budget items:', error)
    return NextResponse.json({ error: 'Failed to fetch budget items' }, { status: 500 })
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
    
    // Link budget masters to timeline
    db.linkBudgetToTimeline(parseInt(entryId), data.budgetMasterIds || [])
    
    // Return updated timeline budget items
    const items = db.getTimelineBudgetItems(parseInt(entryId))
    
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error linking budget items to timeline:', error)
    return NextResponse.json({ error: 'Failed to link budget items' }, { status: 500 })
  }
}