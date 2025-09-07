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
    const db = await getDb()
    
    const entry = await db.db.prepare(
      'SELECT action_plan FROM timeline_entries WHERE id = ?'
    ).get(parseInt(entryId))
    
    return NextResponse.json({ action_plan: entry?.action_plan || '' })
  } catch (error) {
    console.error('Error fetching action plan:', error)
    return NextResponse.json({ error: 'Failed to fetch action plan' }, { status: 500 })
  }
}

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
    const { action_plan } = await request.json()
    const db = await getDb()
    
    await db.db.prepare(
      'UPDATE timeline_entries SET action_plan = ? WHERE id = ?'
    ).run(action_plan, parseInt(entryId))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating action plan:', error)
    return NextResponse.json({ error: 'Failed to update action plan' }, { status: 500 })
  }
}