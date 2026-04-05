import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/lib/models/Budget';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const budgets = await Budget.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    return NextResponse.json(budgets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const budget = await Budget.create({ ...data, userId: new mongoose.Types.ObjectId(userId) });
    return NextResponse.json(budget);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // "Reset" budgets - delete all for user
    await Budget.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    return NextResponse.json({ message: 'All budgets reset successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
