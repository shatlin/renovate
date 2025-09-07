import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/db/repositories/user.repository'
import { createSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const userRepo = new UserRepository()
    const user = await userRepo.findByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const isValidPassword = await userRepo.validatePassword(user, password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}