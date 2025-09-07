import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId } = await params
    const data = await request.json()
    const db = getDb()
    
    const vendor = db.updateVendor(parseInt(vendorId), data)
    
    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
    
    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vendorId: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vendorId } = await params
    const db = getDb()
    
    const success = db.deleteVendor(parseInt(vendorId))
    
    if (!success) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}