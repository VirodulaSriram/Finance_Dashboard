import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(
  to: string,
  username: string,
  otp: string
): Promise<void> {
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f8f9fa; padding: 32px 16px;">
      <div style="background: #3741c8; border-radius: 8px; padding: 28px 32px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Finance Dashboard</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Account Recovery</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 28px 32px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; font-size: 15px; color: #111827;">Hi <strong>${username}</strong>,</p>
        <p style="margin: 0 0 24px; font-size: 14px; color: #6b7280; line-height: 1.6;">
          We received a request to reset your password. Use the following One-Time Password (OTP) to proceed. This code is valid for 10 minutes.
        </p>
        <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #3741c8;">${otp}</span>
        </div>
        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
      <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated security email from Finance Dashboard. Do not reply to this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Finance Dashboard" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your Password Reset Code: ${otp}`,
    html: htmlBody,
  });
}
