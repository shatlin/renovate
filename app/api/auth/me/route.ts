import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        name: session.name
      }
    })
  } catch (error) {
    console.error('Error fetching user info:', error)
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 })
  }
}