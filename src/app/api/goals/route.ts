import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/lib/models/Goal';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const goals = await Goal.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
    return NextResponse.json(goals);
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
    const goal = await Goal.create({ ...data, userId: new mongoose.Types.ObjectId(userId) });
    return NextResponse.json(goal);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const userId = req.headers.get('User-Id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // "Reset" goals - delete all for user
    await Goal.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    return NextResponse.json({ message: 'All goals reset successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
