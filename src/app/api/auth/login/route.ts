import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Account not found. Please create one to continue.' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    return NextResponse.json({
      token: `mock-jwt-token-${user._id}`,
      user: {
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role, 
        country: user.country, 
        currencyCode: user.currencyCode, 
        phone: user.phone, 
        avatar: user.avatar 
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed: ' + err.message }, { status: 500 });
  }
}
