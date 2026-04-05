import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  title: string;
  date: string | Date;
  amount: number;
  category: string;
  type: 'Income' | 'Expense';
}

interface ReportUser {
  username: string;
  email: string;
  currencyCode?: string;
}

export function generateMonthlyReport(
  transactions: Transaction[],
  user: ReportUser,
  month: number,
  year: number
): Buffer {
  const dateRange = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
  return generateCustomReport(transactions, user, dateRange);
}

export function generateCustomReport(
  transactions: Transaction[],
  user: ReportUser,
  dateRange: string
): Buffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const currency = user.currencyCode || 'USD';

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(55, 65, 200); // indigo
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Finance Dashboard', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Financial Report — ${dateRange}`, 14, 20);
  doc.text(`Prepared for: ${user.username}`, 14, 26);

  // ── Summary ───────────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', 14, 42);

  const income = transactions
    .filter((t) => t.type === 'Income')
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  autoTable(doc, {
    startY: 46,
    head: [['Metric', 'Amount']],
    body: [
      ['Total Income', fmt(income)],
      ['Total Expenses', fmt(expenses)],
      ['Net Balance', fmt(net)],
    ],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [55, 65, 200], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } },
    alternateRowStyles: { fillColor: [245, 246, 255] },
    margin: { left: 14, right: 14 },
  });

  // ── Expense Breakdown by Category ─────────────────────────────────────────
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'Expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryRows = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => [cat, fmt(amt), `${((amt / expenses) * 100).toFixed(1)}%`]);

  const afterSummary = (doc as any).lastAutoTable?.finalY ?? 80;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Expense Breakdown by Category', 14, afterSummary + 10);

  autoTable(doc, {
    startY: afterSummary + 14,
    head: [['Category', 'Amount', '% of Total']],
    body: categoryRows.length > 0 ? categoryRows : [['No expenses', '-', '-']],
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [55, 65, 200], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    alternateRowStyles: { fillColor: [245, 246, 255] },
    margin: { left: 14, right: 14 },
  });

  // ── Transaction List ───────────────────────────────────────────────────────
  const afterBreakdown = (doc as any).lastAutoTable?.finalY ?? 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('All Transactions', 14, afterBreakdown + 10);

  const txRows = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => [
      new Date(t.date).toLocaleDateString('en-GB'),
      t.title,
      t.category,
      t.type,
      fmt(t.amount),
    ]);

  autoTable(doc, {
    startY: afterBreakdown + 14,
    head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
    body: txRows.length > 0 ? txRows : [['No transactions found', '', '', '', '']],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [55, 65, 200], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 4: { halign: 'right' } },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    didParseCell: (data) => {
      if (data.column.index === 3) {
        data.cell.styles.textColor =
          data.cell.raw === 'Income' ? [22, 163, 74] : [220, 38, 38];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Finance Dashboard — ${dateRange} Report   |   Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 8
    );
  }

  return Buffer.from(doc.output('arraybuffer'));
}
