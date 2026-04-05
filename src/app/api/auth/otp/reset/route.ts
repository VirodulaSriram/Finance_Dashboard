import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      return NextResponse.json({ error: 'Auth session expired. Please start the process again.' }, { status: 401 });
    }

    if (newPassword.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters long.' }, { status: 400 });
    }

    // Set new password
    user.password = newPassword;
    
    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    
    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err: any) {
    console.error('Password Reset error:', err);
    return NextResponse.json({ error: 'Failed to reset password. Please try again later.' }, { status: 500 });
  }
}
