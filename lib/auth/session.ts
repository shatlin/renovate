import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { SQLiteAdapter } from '../db/adapters/sqlite.adapter'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

interface SessionPayload {
  userId: number
  email: string
  name: string
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  const db = SQLiteAdapter.getInstance()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  // Generate a unique session ID
  const sessionId = crypto.randomUUID()
  
  try {
    await db.execute(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, payload.userId, expiresAt.toISOString()]
    )
  } catch (error) {
    console.error('Session creation error:', error)
    // If session already exists, delete old one and create new
    await db.execute('DELETE FROM sessions WHERE user_id = ?', [payload.userId])
    await db.execute(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, payload.userId, expiresAt.toISOString()]
    )
  }

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  })

  return token
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (!sessionCookie) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
    
    // Verify session still exists in database
    const db = SQLiteAdapter.getInstance()
    const session = await db.queryOne<{ user_id: number }>(
      "SELECT user_id FROM sessions WHERE user_id = ? AND expires_at > datetime('now')",
      [(payload as SessionPayload).userId]
    )

    if (!session) {
      // Session expired or deleted, clear cookie
      cookieStore.delete('session')
      return null
    }

    return payload as SessionPayload
  } catch (error) {
    console.error('Session verification error:', error)
    // Clear invalid cookie
    cookieStore.delete('session')
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
      const db = SQLiteAdapter.getInstance()
      // Delete all sessions for this user
      await db.execute('DELETE FROM sessions WHERE user_id = ?', [(payload as SessionPayload).userId])
    } catch (error) {
      console.error('Error destroying session:', error)
    }
  }

  cookieStore.delete('session')
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  
  if (!session) {
    throw new Error('Unauthorized')
  }

  return session
}