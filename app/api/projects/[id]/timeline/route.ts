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
    const entries = db.getTimelineEntries(parseInt(id))
    
    // For each entry, get its notes and budget items
    // Note: action_plan is already included in the entry from the database
    const entriesWithDetails = entries.map((entry: any) => ({
      ...entry,
      notes: db.getTimelineNotes(entry.id),
      budgetItems: db.getTimelineBudgetItems(entry.id)
    }))
    
    return NextResponse.json(entriesWithDetails)
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 })
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
    
    const entry = db.createTimelineEntry({
      ...data,
      project_id: parseInt(id),
      status: data.status || 'planned'
    })
    
    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating timeline entry:', error)
    return NextResponse.json({ error: 'Failed to create timeline entry' }, { status: 500 })
  }
}