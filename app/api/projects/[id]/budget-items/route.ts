import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params;
    const db = getDb();
    
    // Get all budget items (master records) with their details
    const items = db.getBudgetItems(parseInt(id));
    
    // For each item, get its details with actuals
    const itemsWithDetails = items.map((item: any) => {
      const details = db.getBudgetDetailsWithActuals(item.id);
      return {
        ...item,
        details,
        isExpanded: false // UI state, will be managed in frontend
      };
    });
    
    return NextResponse.json(itemsWithDetails);
  } catch (error) {
    console.error('Error fetching budget items:', error);
    return NextResponse.json({ error: 'Failed to fetch budget items' }, { status: 500 });
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

    const { id } = await params;
    const data = await request.json();
    const db = getDb();
    
    // Create master budget item
    const item = db.createBudgetItem({
      project_id: parseInt(id),
      name: data.name,
      description: data.description || null,
      room_id: data.room_id || null,
      category_id: data.category_id || null,
      status: data.status || 'pending'
    });
    
    // If initial detail data is provided, create the first detail
    if (data.createInitialDetail) {
      db.createBudgetDetail(item.id, {
        detail_type: data.detail_type || 'material',
        name: data.detail_name || data.name,
        description: data.detail_description || null,
        quantity: data.quantity || 1,
        unit_price: data.unit_price || 0,
        total_amount: data.total_amount || 0,
        vendor: data.vendor || null,
        purchase_date: data.purchase_date || null,
        invoice_number: data.invoice_number || null,
        notes: data.notes || null
      });
    }
    
    // Return the item with its details
    const updatedItem = db.getBudgetItem(item.id);
    const details = db.getBudgetDetails(item.id);
    
    return NextResponse.json({ ...updatedItem, details }, { status: 201 });
  } catch (error) {
    console.error('Error creating budget item:', error);
    return NextResponse.json({ error: 'Failed to create budget item' }, { status: 500 });
  }
}