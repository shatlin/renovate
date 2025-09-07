import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    const { id, roomId } = await params;
    const data = await request.json();
    const db = getDb();
    
    // Use the updateRoom method from DatabaseManager
    const updateData = {
      name: data.name,
      area_sqft: data.area_sqft || null,
      renovation_type: data.renovation_type || null,
      status: data.status || 'planned'
    };
    
    const updatedRoom = db.updateRoom(parseInt(roomId), updateData);
    
    if (!updatedRoom) {
      throw new Error('Room not found or update failed');
    }
    
    return NextResponse.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  try {
    const { id, roomId } = await params;
    const db = getDb();
    
    // Use the deleteRoom method from DatabaseManager
    const result = db.deleteRoom(parseInt(roomId));
    
    if (!result || result.changes === 0) {
      throw new Error('Room not found or already deleted');
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room', details: error.message }, { status: 500 });
  }
}