import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/lib/models/Transaction';
import User from '@/lib/models/User';
import { generateCustomReport } from '@/lib/generateReport';
import { generateCustomExcel } from '@/lib/generateExcelReport';
import { sendReportEmail } from '@/lib/sendReportEmail';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const userId = req.headers.get('user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const format = (url.searchParams.get('format') ?? 'pdf') as 'pdf' | 'excel';
    const startParam = url.searchParams.get('startDate');
    const endParam = url.searchParams.get('endDate');

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let startDate: Date;
    let endDate: Date;
    let dateRangeString: string;

    if (startParam && endParam) {
      startDate = new Date(startParam);
      endDate = new Date(endParam);
      endDate.setHours(23, 59, 59, 999);
      dateRangeString = `${startDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      // Default: Last month
      const now = new Date();
      const targetMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      startDate = new Date(targetYear, targetMonth, 1);
      endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
      dateRangeString = startDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    // Fetch transactions for the selected range
    const transactions = await Transaction.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const userInfo = { username: user.username, email: user.email, currencyCode: user.currencyCode };
    const txList = transactions.map((t: any) => ({
      title: t.title,
      date: t.date,
      amount: t.amount,
      category: t.category,
      type: t.type,
    }));

    let buffer: Buffer;
    let filename: string;
    const type = (format.toUpperCase() as 'PDF' | 'EXCEL');

    if (format === 'excel') {
      buffer = generateCustomExcel(txList, userInfo, dateRangeString);
      filename = `Financial_Report_${dateRangeString.replace(/ /g, '_')}.xlsx`;
    } else {
      const doc = generateCustomReport(txList, userInfo, dateRangeString);
      buffer = Buffer.from(doc.output('arraybuffer'));
      filename = `Financial_Report_${dateRangeString.replace(/ /g, '_')}.pdf`;
    }

    // Send email with the attachment
    await sendReportEmail(user.email, user.username, buffer, filename, type);

    // Return success JSON
    return NextResponse.json({ 
      success: true, 
      message: `Report for ${dateRangeString} was generated and sent to your email!`,
      format: type
    });
  } catch (err: any) {
    console.error('Report generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate report' }, { status: 500 });
  }
}
