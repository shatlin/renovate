import { NextRequest, NextResponse } from 'next/server'
import { UserRepository } from '@/lib/db/repositories/user.repository'
import { createSession } from '@/lib/auth/session'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const userRepo = new UserRepository()

    const existingUser = await userRepo.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const user = await userRepo.create({ email, password, name })

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
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}