import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { username, email, phone, avatar } = await req.json();
    
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    
    return NextResponse.json({ 
      id: user._id, 
      username: user.username, 
      email: user.email, 
      role: user.role, 
      country: user.country, 
      currencyCode: user.currencyCode, 
      phone: user.phone, 
      avatar: user.avatar 
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Profile update failed: ' + err.message }, { status: 500 });
  }
}
