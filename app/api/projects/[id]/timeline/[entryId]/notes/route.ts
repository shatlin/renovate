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
    const notes = db.getTimelineNotes(parseInt(entryId))
    
    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching timeline notes:', error)
    return NextResponse.json({ error: 'Failed to fetch timeline notes' }, { status: 500 })
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
    
    const note = db.addTimelineNote({
      timeline_entry_id: parseInt(entryId),
      content: data.content,
      author: session.user?.name || session.user?.email || 'Unknown'
    })
    
    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating timeline note:', error)
    return NextResponse.json({ error: 'Failed to create timeline note' }, { status: 500 })
  }
}