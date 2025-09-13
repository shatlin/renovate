import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { getSession } from '@/lib/auth/session'

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
    const details = db.getBudgetDetails(parseInt(id))
    
    return NextResponse.json(details)
  } catch (error) {
    console.error('Error fetching budget details:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    
    const detail = db.createBudgetDetail(parseInt(id), data)
    
    return NextResponse.json(detail)
  } catch (error) {
    console.error('Error creating budget detail:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}