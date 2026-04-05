'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Receipt,
  Download,
  CheckCircle,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Calendar,
  Send,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLORS = ['var(--primary)', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

export default function DashboardPage() {
  const { transactions, fetchTransactions, loading } = useFinanceStore();
  const { user } = useAuthStore();
  const currency = user?.currencyCode || 'USD';
  
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportStatus, setReportStatus] = useState('');
  
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ 
    startDate: '', 
    endDate: '', 
    format: 'pdf' as 'pdf' | 'excel' 
  });

  const handleSendReport = async (options: { format: 'pdf' | 'excel'; startDate?: string; endDate?: string }) => {
    if (!user) return;
    setReportLoading(true);
    setReportSent(false);
    
    try {
      let url = `/api/reports/monthly?format=${options.format}`;
      if (options.startDate && options.endDate) {
        url += `&startDate=${options.startDate}&endDate=${options.endDate}`;
      }
      
      const res = await fetch(url, { headers: { 'User-Id': user.id } });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to send report');
      
      setReportStatus(data.message);
      setReportSent(true);
      if (isCustomOpen) setIsCustomOpen(false);
      
      setTimeout(() => setReportSent(false), 8000);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { totalIncome, totalExpense, balance } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'Income') {
          acc.totalIncome += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.totalExpense += curr.amount;
          acc.balance -= curr.amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [transactions]);

  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const categories: Record<string, number> = {};
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const trendData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    return sorted.map(t => {
      currentBalance += t.type === 'Income' ? t.amount : -t.amount;
      return {
        date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: currentBalance
      };
    });
  }, [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.username}. Here's what's happening with your money.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {reportSent && (
            <motion.span 
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 py-1.5 px-3 rounded-full border border-emerald-100"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {reportStatus}
            </motion.span>
          )}
          
          <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs h-9"
                    disabled={reportLoading}
                  >
                    {reportLoading ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />Preparing...</>
                    ) : (
                      <><Send className="h-3.5 w-3.5" />Share Report<ChevronDown className="h-3 w-3 ml-0.5" /></>
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium border-b border-border mb-1">
                  Email Quick Report
                </div>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => handleSendReport({ format: 'pdf' })}
                >
                  <FileText className="h-4 w-4 text-rose-500" />
                  <div>
                    <p className="text-sm font-medium">Send PDF (Last Month)</p>
                    <p className="text-[10px] text-muted-foreground uppercase py-0.5">Automated Summary</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer"
                  onClick={() => handleSendReport({ format: 'excel' })}
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium">Send Excel (Last Month)</p>
                    <p className="text-[10px] text-muted-foreground uppercase py-0.5">Detailed Data Sheets</p>
                  </div>
                </DropdownMenuItem>
                
                <div className="h-px bg-border my-1" />
                
                <DialogTrigger render={
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <div>
                      <p className="text-sm font-medium">Custom Date Range...</p>
                      <p className="text-[10px] text-muted-foreground uppercase py-0.5">Select Specific Period</p>
                    </div>
                  </DropdownMenuItem>
                } />
              </DropdownMenuContent>
            </DropdownMenu>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Custom Report Generation</DialogTitle>
                <DialogDescription>
                  Select a specific period and format. Results will be sent to <strong>{user?.email}</strong>.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from">Start Date</Label>
                    <Input
                      id="from"
                      type="date"
                      className="h-11"
                      value={customRange.startDate}
                      onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">End Date</Label>
                    <Input
                      id="to"
                      type="date"
                      className="h-11"
                      value={customRange.endDate}
                      onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Report Format</Label>
                  <Select 
                    value={customRange.format} 
                    onValueChange={(v) => setCustomRange({ ...customRange, format: v as any })}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">Professional PDF Summary</SelectItem>
                      <SelectItem value="excel">Detailed Excel Workbook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="px-0">
                <Button 
                  className="w-full h-11 gap-2" 
                  disabled={reportLoading || !customRange.startDate || !customRange.endDate}
                  onClick={() => handleSendReport(customRange)}
                >
                  {reportLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                  Send Report to Email
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border card-shadow hover:card-shadow-hover transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
            <div className="h-8 w-8 bg-primary/10 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current available funds</p>
          </CardContent>
        </Card>
        <Card className="border border-border card-shadow hover:card-shadow-hover transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
            <div className="h-8 w-8 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Money flowing in</p>
          </CardContent>
        </Card>
        <Card className="border border-border card-shadow hover:card-shadow-hover transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            <div className="h-8 w-8 bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Money flowing out</p>
          </CardContent>
        </Card>
      </div>


      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4 border border-border card-shadow-md">
          <CardHeader>
            <CardTitle>Balance Trend</CardTitle>
            <CardDescription>Visualizing your wealth over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: 'var(--foreground)' }}
                  tickFormatter={(value: number) => formatCurrency(value).replace(/\.00$/, '')}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    color: 'var(--foreground)'
                  }}
                  itemStyle={{ color: 'var(--primary)', fontWeight: '600' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'hsl(var(--background))' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border border-border card-shadow-md">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Where your money is going</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '0px',
                      color: 'var(--foreground)'
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Receipt className="h-10 w-10 opacity-20" />
                <p className="text-sm">No expenses recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
