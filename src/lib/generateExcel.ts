import * as XLSX from 'xlsx';

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

export function generateExcelWorkbook(
  transactions: Transaction[],
  user: ReportUser,
  dateRange: string
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Calculate Summary
  const income = transactions
    .filter((t) => t.type === 'Income')
    .reduce((s, t) => s + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  // 1. Summary Sheet
  const summaryData = [
    ['Financial Summary Report'],
    ['User:', user.username],
    ['Email:', user.email],
    ['Period:', dateRange],
    ['Currency:', user.currencyCode || 'USD'],
    [''],
    ['Metric', 'Amount'],
    ['Total Income', income],
    ['Total Expenses', expenses],
    ['Net Balance', net],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // 2. Transactions Sheet
  const txData = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => ({
      Date: new Date(t.date).toLocaleDateString('en-CA'),
      Title: t.title,
      Category: t.category,
      Type: t.type,
      Amount: t.amount,
    }));

  const wsTransactions = XLSX.utils.json_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  return wb;
}
