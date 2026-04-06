'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  ArrowUpRight, 
  Wallet,
  Receipt,
  Plus,
  ArrowRight,
  TrendingUp,
  Heart,
  Cpu,
  MoreHorizontal,
  Filter,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { transactions, fetchTransactions, loading } = useFinanceStore();
  const { user } = useAuthStore();
  const currency = user?.currencyCode || 'USD';

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const { totalIncome, totalExpense, balance, transactionCount } = useMemo(() => {
    return transactions.reduce(
      (acc, curr) => {
        if (curr.type === 'Income') {
          acc.totalIncome += curr.amount;
          acc.balance += curr.amount;
        } else {
          acc.totalExpense += curr.amount;
          acc.balance -= curr.amount;
        }
        acc.transactionCount += 1;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 }
    );
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
  }, [transactions]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dataMap = last7Days.reduce((acc, date) => {
      acc[date] = { date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }), income: 0, expense: 0 };
      return acc;
    }, {} as Record<string, any>);

    transactions.forEach(t => {
      const date = t.date.split('T')[0];
      if (dataMap[date]) {
        if (t.type === 'Income') dataMap[date].income += t.amount;
        else dataMap[date].expense += t.amount;
      }
    });

    return Object.values(dataMap);
  }, [transactions]);

  // Mock Calendar Data for visual representation
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const activeDays = [1, 10, 17, 24];

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
      
      {/* Left Section: Overview & Recent Transactions */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Top Widgets row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Overview Widget */}
          <Card className="md:col-span-2 bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Financial Trends</h3>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground opacity-50">Last 7 Days Overview</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">{transactionCount}</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground mt-1 opacity-60">Total TX</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-emerald-400">{transactions.filter(t => t.type === 'Income').length}</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 mt-1 opacity-60">Incomes</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-primary">{transactions.filter(t => t.type === 'Expense').length}</span>
                <span className="text-[9px] uppercase font-black tracking-widest text-primary mt-1 opacity-60">Outcomes</span>
              </div>
            </div>

            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB7185" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.3)' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'rgba(255,255,255,0.3)' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0C0E0E', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 700,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                    itemStyle={{ padding: '2px 0' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#34d399" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorIncome)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#FB7185" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorExpense)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Your Balance Card */}
          <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-bold text-white tracking-tight">Your Balance</h3>
               <Badge className="bg-white/5 border-white/5 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">{currency} <ArrowUpRight className="ml-1 h-3 w-3" /></Badge>
             </div>

             <div className="space-y-1 mb-8">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Balance</p>
               <div className="flex items-end gap-3">
                 <h2 className="text-4xl font-black text-white tracking-tight">{formatCurrency(balance).replace('$', '').trim()}</h2>
                 <div className="mb-1.5 p-1.5 bg-primary/10 rounded-lg text-primary border border-primary/20">
                    <Wallet className="h-4 w-4" />
                 </div>
               </div>
               <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
                 Compared to last month <span className="px-1.5 py-0.5 bg-emerald-400/10 rounded-md">+24.17%</span>
               </p>
             </div>

             <div className="mt-auto relative z-10">
               <div className="bg-gradient-to-br from-white/10 to-transparent p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-wide">Finance Health</span>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mb-4">is updating health status now...</p>
                  
                  {/* Decorative Globe-like element */}
                  <div className="h-24 w-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
                    <div className="h-20 w-32 border-2 border-dashed border-primary/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                      <div className="h-10 w-20 border-2 border-primary/30 rounded-full" />
                    </div>
                  </div>
               </div>
             </div>
          </Card>
        </div>

        {/* Recent Transactions List */}
        <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
            <Button variant="ghost" size="sm" className="bg-white/5 border border-white/5 rounded-full text-xs font-bold text-muted-foreground gap-2 hover:text-white">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>

          <div className="space-y-0 text-sm">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
              <div className="col-span-7">Type & Description</div>
              <div className="col-span-5 text-right">Amount</div>
            </div>

            {recentTransactions.map((t, i) => {
              const eurAmount = (t.amount * 0.011).toFixed(2);
              return (
                <div key={t.id} className="grid grid-cols-12 gap-4 py-6 border-b border-white/5 group hover:bg-white/[0.02] transition-colors rounded-3xl px-1">
                  <div className="col-span-7 flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5",
                      t.type === 'Income' ? "bg-emerald-400/5 text-emerald-400" : "bg-primary/5 text-primary"
                    )}>
                      {t.type === 'Income' ? <ArrowUpRight className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">{t.title}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{t.type} • {new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="col-span-5 flex flex-col justify-center text-right">
                    <span className={cn("font-black text-xl tracking-tighter", t.type === 'Income' ? "text-emerald-400" : "text-white")}>
                      {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">€{eurAmount} EUR</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Right Section */}
      <div className="lg:col-span-4 space-y-8">
        {/* Income Overview Tile */}
        <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-24 w-24 text-emerald-400" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-lg font-bold text-white tracking-tight">Income Summary</h3>
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 opacity-50">Total Earnings</p>
              <h2 className="text-4xl font-black text-emerald-400 tracking-tighter">
                {formatCurrency(totalIncome)}
              </h2>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Growth rate</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">+12.5%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              <p className="text-[9px] text-muted-foreground font-medium">You've reached 65% of your monthly income target.</p>
            </div>

            <Button 
              className="w-full mt-4 h-12 bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-white/5 transition-all"
              onClick={() => {
                // This could open the IncomeModal if we passed the setter down, 
                // but for now it's a visual summary.
              }}
            >
              Analyze Sources
            </Button>
          </div>
        </Card>

        {/* Quick Savings Goal Progress - Optional but looks good */}
        <Card className="bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
           <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Savings Progress</h4>
                <p className="text-[10px] text-muted-foreground font-medium">You are $450 away from your next goal</p>
              </div>
              <Button size="sm" className="rounded-xl px-6 bg-primary font-bold text-[10px] uppercase tracking-widest">
                Boost Now
              </Button>
           </div>
        </Card>
      </div>

    </div>
  );
}
