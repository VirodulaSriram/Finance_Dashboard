import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const userId = req.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await Transaction.find({ userId });
    
    const formatted = transactions.map(t => ({ 
      id: t._id, 
      userId: t.userId, 
      title: t.title, 
      date: t.date, 
      amount: t.amount, 
      category: t.category, 
      type: t.type 
    }));
    
    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = req.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, date, amount, category, type } = await req.json();
    if (!title || !date || amount == null || !category || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTx = new Transaction({ userId, title, date, amount, category, type });
    await newTx.save();
    
    return NextResponse.json({ 
      id: newTx._id, 
      userId: newTx.userId, 
      title: newTx.title, 
      date: newTx.date, 
      amount: newTx.amount, 
      category: newTx.category, 
      type: newTx.type 
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save transaction: ' + err.message }, { status: 500 });
  }
}
