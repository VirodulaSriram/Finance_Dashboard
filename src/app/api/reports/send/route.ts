import { NextResponse } from 'next/server';
import { generateCustomReport } from '@/lib/generateReport';
import { generateExcelWorkbook } from '@/lib/generateExcel';
import { sendReportEmail } from '@/lib/sendReportEmail';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const { transactions, user, dateRange, format } = await req.json();

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
