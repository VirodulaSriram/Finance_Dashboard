import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, otp } = await req.json();

    const user = await User.findOne({ email: email.toLowerCase() });

    console.log('OTP Verification Debug:');
    console.log('- Provided Email:', email);
    console.log('- Provided OTP:', otp);
    console.log('- DB OTP:', user?.otp);
    console.log('- DB Expiry:', user?.otpExpires);
    console.log('- Now:', new Date());
    console.log('- Expired?', user?.otpExpires ? user.otpExpires < new Date() : 'N/A');

    if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) {
      return NextResponse.json({ error: 'Invalid or expired OTP. Please try again.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'OTP verified.' });
  } catch (err: any) {
    console.error('OTP Verify error:', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
