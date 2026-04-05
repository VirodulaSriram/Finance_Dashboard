import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // We return success even if user not found for security reasons
    // (prevents email enumeration)
    if (!user) {
      return NextResponse.json({ message: 'If an account exists with this email, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    console.log('OTP Request Success:', {
      email: user.email,
      otpGenerated: otp,
      expirySet: otpExpires
    });

    await sendOtpEmail(user.email, user.username, otp);

    return NextResponse.json({ message: 'If an account exists with this email, an OTP has been sent.' });
  } catch (err: any) {
    console.error('OTP Request error:', err);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again later.' }, { status: 500 });
  }
}
