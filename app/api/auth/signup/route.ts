import { NextRequest, NextResponse } from 'next/server'
import { hashPassword } from '@/lib/utils/auth'

// Mock database - replace with your actual database
const users = new Map()

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    if (users.has(email)) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const userId = `user_${Date.now()}`
    
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    }

    // Save to mock database
    users.set(email, newUser)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}