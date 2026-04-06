import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const userId = req.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get('from');
    const toStr = searchParams.get('to');

    const query: any = { userId };
    if (fromStr && toStr) {
      const start = new Date(fromStr);
      const end = new Date(toStr);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    
    const formatted = transactions.map(t => ({ 
      id: t._id, 
      userId: t.userId, 
      title: t.title, 
      date: t.date, 
      amount: t.amount, 
      category: t.category, 
      type: t.type,
      paymentMethod: t.paymentMethod,
      status: t.status || 'Success'
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

    const body = await req.json();
    console.log('API POST Body:', body);
    const { title, date, amount, category, type, paymentMethod, status } = body;
    if (!title || !date || amount == null || !category || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTx = new Transaction({ 
      userId, 
      title, 
      date, 
      amount, 
      category, 
      type, 
      paymentMethod: paymentMethod || 'Other',
      status: status || 'Success'
    });
    await newTx.save();
    
    return NextResponse.json({ 
      id: newTx._id, 
      userId: newTx.userId, 
      title: newTx.title, 
      date: newTx.date, 
      amount: newTx.amount, 
      category: newTx.category, 
      type: newTx.type,
      paymentMethod: newTx.paymentMethod,
      status: newTx.status
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to save transaction: ' + err.message }, { status: 500 });
  }
}
