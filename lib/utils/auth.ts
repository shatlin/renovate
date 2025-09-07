import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-minimum-32-characters'
)

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: any): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return {
    id: payload.id as string,
    name: payload.name as string,
    email: payload.email as string,
    role: payload.role as string,
  }
}

export async function setSession(user: User): Promise<void> {
  const token = await createToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })

  const cookieStore = cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete('session')
}