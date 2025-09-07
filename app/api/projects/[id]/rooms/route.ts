import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const rooms = db.getRoomsByProject(parseInt(id));
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const db = getDb();
    
    // Use the createRoom method from DatabaseManager
    const roomData = {
      project_id: parseInt(id),
      name: data.name,
      area_sqft: data.area_sqft || undefined,
      renovation_type: data.renovation_type || undefined,
      status: data.status || 'planned'
    };
    
    const room = db.createRoom(roomData);
    
    if (!room) {
      throw new Error('Failed to create room');
    }
    
    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room', details: error.message }, { status: 500 });
  }
}