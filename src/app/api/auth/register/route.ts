import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password, role, country, currencyCode } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Registration failed: User already exists -', email);
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 400 });
    }

    const newUser = new User({ 
      username, 
      email, 
      password, 
      role: role || 'Admin', 
      country, 
      currencyCode: currencyCode || 'USD' 
    });
    
    try {
      await newUser.save();
      console.log('Registration success:', email);
      return NextResponse.json({ message: 'User registered successfully.' }, { status: 201 });
    } catch (saveError: any) {
      console.error('Save error:', saveError);
      return NextResponse.json({ error: 'Failed to create user profile: ' + saveError.message }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Registration processing error:', err);
    return NextResponse.json({ error: 'Internal registration error.' }, { status: 500 });
  }
}
