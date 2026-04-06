import { NextResponse } from 'next/server';
import { generateCustomReport } from '@/lib/generateReport';
import { generateExcelWorkbook } from '@/lib/generateExcel';
import { sendReportEmail } from '@/lib/sendReportEmail';
import * as XLSX from 'xlsx';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import Transaction from '@/lib/models/Transaction';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { download, userId, format: bodyFormat } = body;

    // Download mode — fetch data server-side, return file binary
    if (download && userId) {
      await dbConnect();
      const user = await User.findById(userId, 'username email currencyCode');
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const transactions = await Transaction.find({ userId }).sort({ date: -1 });

      const fmt = bodyFormat || 'pdf';
      const dateRange = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

      if (fmt === 'pdf') {
        const doc = generateCustomReport(transactions, user, dateRange);
        const buffer = Buffer.from(doc.output('arraybuffer'));
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Financial_Report_${dateRange.replace(/ /g, '_')}.pdf"`,
          },
        });
      } else {
        const wb = generateExcelWorkbook(transactions, user, dateRange);
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="Financial_Report_${dateRange.replace(/ /g, '_')}.xlsx"`,
          },
        });
      }
    }

    // Email mode — original behaviour
    const { transactions, user, dateRange, format } = body;

    if (!user?.email) {
      return NextResponse.json({ error: 'User email is required' }, { status: 400 });
    }

    let attachment: Buffer;
    let filename: string;
    let type: 'PDF' | 'EXCEL';

    if (format === 'pdf') {
      const doc = generateCustomReport(transactions, user, dateRange);
      attachment = Buffer.from(doc.output('arraybuffer'));
      filename = `Financial_Report_${dateRange.replace(/ /g, '_')}.pdf`;
      type = 'PDF';
    } else {
      const wb = generateExcelWorkbook(transactions, user, dateRange);
      attachment = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      filename = `Financial_Report_${dateRange.replace(/ /g, '_')}.xlsx`;
      type = 'EXCEL';
    }

    await sendReportEmail(user.email, user.username, attachment, filename, type);

    return NextResponse.json({ message: 'Report sent successfully' });
  } catch (err: any) {
    console.error('Send report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
