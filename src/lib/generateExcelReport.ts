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

export function generateCustomExcel(
  transactions: Transaction[],
  user: ReportUser,
  dateRange: string
): Buffer {
  const currency = user.currencyCode || 'USD';
  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ──────────────────────────────────────────────────────
  const income = transactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expenses;

  const summaryData = [
    [`Finance Dashboard — Financial Report`],
    [`Range: ${dateRange}  |  User: ${user.username}  |  ${user.email}`],
    [],
    ['SUMMARY', ''],
    ['Metric', 'Amount'],
    ['Total Income', fmt(income)],
    ['Total Expenses', fmt(expenses)],
    ['Net Balance', fmt(net)],
    [],
    ['CATEGORY BREAKDOWN', ''],
    ['Category', 'Amount', '% of Total'],
  ];

  const categoryMap: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'Expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, amt]) => {
      summaryData.push([cat, fmt(amt), `${((amt / expenses) * 100).toFixed(1)}%`]);
    });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Column widths
  wsSummary['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }];

  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // ── Sheet 2: Transactions ─────────────────────────────────────────────────
  const txHeaders = ['Date', 'Title', 'Category', 'Type', 'Amount'];
  const txRows = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => [
      new Date(t.date).toLocaleDateString('en-GB'),
      t.title,
      t.category,
      t.type,
      t.amount,
    ]);

  const wsTransactions = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows]);
  wsTransactions['!cols'] = [
    { wch: 12 },
    { wch: 30 },
    { wch: 18 },
    { wch: 10 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');

  // ── Sheet 3: Income Only ───────────────────────────────────────────────────
  const incomeRows = transactions
    .filter((t) => t.type === 'Income')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => [new Date(t.date).toLocaleDateString('en-GB'), t.title, t.category, t.amount]);

  const wsIncome = XLSX.utils.aoa_to_sheet([['Date', 'Title', 'Category', 'Amount'], ...incomeRows]);
  wsIncome['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsIncome, 'Income');

  // ── Sheet 4: Expenses Only ────────────────────────────────────────────────
  const expenseRows = transactions
    .filter((t) => t.type === 'Expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => [new Date(t.date).toLocaleDateString('en-GB'), t.title, t.category, t.amount]);

  const wsExpenses = XLSX.utils.aoa_to_sheet([
    ['Date', 'Title', 'Category', 'Amount'],
    ...expenseRows,
  ]);
  wsExpenses['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

  // Write to Buffer
  const arrayBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return Buffer.from(arrayBuffer);
}
