import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function PUT(
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
    
    const entry = db.updateTimelineEntry(parseInt(entryId), data)
    
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    
    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating timeline entry:', error)
    return NextResponse.json({ error: 'Failed to update timeline entry' }, { status: 500 })
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
    const db = getDb()
    
    const success = db.deleteTimelineEntry(parseInt(entryId))
    
    if (!success) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting timeline entry:', error)
    return NextResponse.json({ error: 'Failed to delete timeline entry' }, { status: 500 })
  }
}