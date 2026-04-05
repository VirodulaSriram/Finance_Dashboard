import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import { generateMonthlyReport } from '@/lib/generateReport';
import { sendReportEmail } from '@/lib/sendReportEmail';

// This route is called by Vercel Cron at end of month
// Schedule in vercel.json: "0 18 28-31 * *" (runs on days 28-31 at 6pm UTC)
export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized calls
  const secret = req.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only run on the actual last day of the month
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isLastDay = tomorrow.getDate() === 1;

  if (!isLastDay) {
    return NextResponse.json({ message: 'Not the last day of month, skipping.' });
  }

  try {
    await dbConnect();

    const targetMonth = now.getMonth();
    const targetYear = now.getFullYear();
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    const monthName = startDate.toLocaleString('default', { month: 'long' });

    // Get all users
    const users = await User.find({}).lean();
    const results: { email: string; status: string }[] = [];

    for (const user of users) {
      try {
        const transactions = await Transaction.find({
          userId: user._id,
          date: { $gte: startDate, $lte: endDate },
        }).lean();

        const pdfBuffer = generateMonthlyReport(
          transactions.map((t: any) => ({
            title: t.title,
            date: t.date,
            amount: t.amount,
            category: t.category,
            type: t.type,
          })),
          { username: user.username, email: user.email, currencyCode: user.currencyCode },
          targetMonth,
          targetYear
        );

        const dateRangeStr = `${monthName} ${targetYear}`;
        await sendReportEmail(user.email, user.username, dateRangeStr, pdfBuffer, 'pdf');
        results.push({ email: user.email, status: 'sent' });
      } catch (err: any) {
        results.push({ email: user.email, status: `failed: ${err.message}` });
      }
    }

    return NextResponse.json({
      message: `Monthly reports processed for ${monthName} ${targetYear}`,
      results,
    });
  } catch (err: any) {
    console.error('Cron report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
