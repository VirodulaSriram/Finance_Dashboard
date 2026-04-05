import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendReportEmail(
  to: string,
  username: string,
  dateRange: string,
  buffer: Buffer,
  format: 'pdf' | 'excel'
): Promise<void> {
  const extension = format === 'pdf' ? 'pdf' : 'xlsx';
  const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const fileName = `finance-report-${dateRange.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${extension}`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; background: #f8f9fa; padding: 32px 16px;">
      <div style="background: #3741c8; border-radius: 0px; padding: 28px 32px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Finance Dashboard</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Financial Report — ${dateRange}</p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0px; padding: 28px 32px; margin-bottom: 24px;">
        <p style="margin: 0 0 12px; font-size: 15px; color: #111827;">Hi <strong>${username}</strong>,</p>
        <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280; line-height: 1.6;">
          Your financial report for <strong>${dateRange}</strong> is ready. 
          Please find it attached as a ${format.toUpperCase()} file below.
        </p>
        <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
          This report includes your income, expenses, category breakdown, and full transaction history for the selected period.
        </p>
      </div>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 0px; padding: 20px 32px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #9ca3af;">
          📎 Attached: <strong>${fileName}</strong>
        </p>
      </div>
      <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
        This is an automated report from Finance Dashboard. Do not reply to this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Finance Dashboard" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your Financial Report (${dateRange}) is Ready`,
    html: htmlBody,
    attachments: [
      {
        filename: fileName,
        content: buffer,
        contentType: contentType,
      },
    ],
  });
}
