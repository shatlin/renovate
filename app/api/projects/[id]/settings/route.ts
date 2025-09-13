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
    const { searchParams } = new URL(request.url)
    const settingKey = searchParams.get('key')

    if (!settingKey) {
      return NextResponse.json({ error: 'Missing setting key' }, { status: 400 })
    }

    const db = getDb()
    const value = db.getUserSetting(session.userId, parseInt(id), settingKey)
    
    return NextResponse.json({ value })
  } catch (error) {
    console.error('Error fetching project setting:', error)
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
    const { settingKey, settingValue } = data

    if (!settingKey) {
      return NextResponse.json({ error: 'Missing setting key' }, { status: 400 })
    }

    const db = getDb()
    const result = db.setUserSetting(
      session.userId, 
      parseInt(id), 
      settingKey, 
      settingValue
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error saving project setting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}