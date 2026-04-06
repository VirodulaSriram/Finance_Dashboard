import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const body = await req.json();
    const { isSharing } = body;

    user.isSharing = isSharing;
    if (isSharing && !user.shareToken) {
      user.shareToken = crypto.randomBytes(16).toString('hex');
    }

    await user.save();

    return NextResponse.json({
      isSharing: user.isSharing,
      shareToken: user.shareToken,
    });
  } catch (err: any) {
    console.error('Toggle Sharing Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
