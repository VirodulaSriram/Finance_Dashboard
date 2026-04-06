'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Receipt,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Globe,
  Lock,
  Loader2,
  Share2
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/ui/logo';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

export default function SharedDashboardPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedData() {
      try {
        const res = await fetch(`/api/share/${token}`);
        const result = await res.json();
        
        if (!res.ok) throw new Error(result.error || 'Failed to load shared dashboard');
        
        setData(result);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (token) fetchSharedData();
  }, [token]);

  const currency = data?.user?.currencyCode || 'USD';
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse font-medium">Loading Shared Dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-6">
        <div className="h-20 w-20 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center rounded-3xl text-rose-500 animate-bounce">
          <Lock className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Access Restricted</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error || "This shared dashboard is no longer available or the link is incorrect."}
          </p>
        </div>
        <a href="/" className="text-sm font-semibold text-primary hover:underline">
          Return to FncBoard Homepage
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 selection:bg-blue-100 dark:selection:bg-blue-900/30">
      {/* Shared Header */}
      <header className="h-24 bg-background/80 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-2xl">
            <Logo className="h-10 w-10" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">FncBoard Shared</h1>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <Globe className="h-3 w-3 text-blue-500" /> Public View
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 p-2 pr-4 rounded-full border border-border/40">
          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
            <AvatarImage src={data.user.avatar} alt={data.user.username} />
            <AvatarFallback className="bg-blue-500 text-white font-bold">
              {data.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-sm font-bold leading-tight">{data.user.username}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Verified User</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-blue-500/20 text-blue-500 bg-blue-50/50 dark:bg-blue-500/10 mb-2">
            Overview Performance
          </Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Financial Summary</h2>
          <p className="text-muted-foreground text-lg">A real-time snapshot of {data.user.username}'s financial health.</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="border-none shadow-2xl shadow-blue-500/5 bg-background relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet className="h-20 w-20" />
              </div>
              <CardHeader className="pb-2 flex flex-row items-center justify-between pointer-events-none">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Net Balance</CardTitle>
                <div className="h-10 w-10 bg-blue-500/10 flex items-center justify-center rounded-2xl text-blue-500">
                  <Wallet className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative pointer-events-none">
                <div className="text-3xl font-extrabold tracking-tight mb-1">{formatCurrency(data.summary.balance)}</div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
                  Total available assets
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border-none shadow-2xl shadow-emerald-500/5 bg-background relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-emerald-500">
                <TrendingUp className="h-20 w-20" />
              </div>
              <CardHeader className="pb-2 flex flex-row items-center justify-between pointer-events-none">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Income</CardTitle>
                <div className="h-10 w-10 bg-emerald-500/10 flex items-center justify-center rounded-2xl text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative pointer-events-none">
                <div className="text-3xl font-extrabold tracking-tight mb-1 text-emerald-500">{formatCurrency(data.summary.totalIncome)}</div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                   Revenue over all time
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="border-none shadow-2xl shadow-rose-500/5 bg-background relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-rose-500">
                <TrendingDown className="h-20 w-20" />
              </div>
              <CardHeader className="pb-2 flex flex-row items-center justify-between pointer-events-none">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Expenses</CardTitle>
                <div className="h-10 w-10 bg-rose-500/10 flex items-center justify-center rounded-2xl text-rose-500">
                  <TrendingDown className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative pointer-events-none">
                <div className="text-3xl font-extrabold tracking-tight mb-1 text-rose-500">{formatCurrency(data.summary.totalExpense)}</div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                  Spending patterns
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-2xl shadow-blue-500/5 bg-background rounded-3xl overflow-hidden">
              <CardHeader className="pb-8 border-b border-border/40 mb-4 px-8">
                <div className="flex items-center gap-3 mb-2">
                  <LineChartIcon className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-bold">Growth Projection</CardTitle>
                </div>
                <CardDescription>Historical balance progression and trends.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] p-4 pr-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(value: number) => formatCurrency(value).replace(/\.00$/, '')}
                    />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '1.25rem',
                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                        color: 'var(--foreground)',
                        fontWeight: '600'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3b82f6" 
                      strokeWidth={5} 
                      dot={{ r: 5, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} 
                      activeDot={{ r: 8, strokeWidth: 0 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none shadow-2xl shadow-blue-500/5 bg-background rounded-3xl overflow-hidden h-full">
              <CardHeader className="pb-8 border-b border-border/40 mb-4 px-8">
                <div className="flex items-center gap-3 mb-2">
                  <PieChartIcon className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-bold">Category Allocation</CardTitle>
                </div>
                <CardDescription>Visual distribution of expenditures by type.</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col items-center justify-center p-4">
                {data.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={120}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                      >
                        {data.categoryData.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatCurrency(value)}
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          border: '1px solid var(--border)',
                          borderRadius: '1.25rem',
                          color: 'var(--foreground)',
                          fontWeight: '600'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={40} 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs font-bold text-muted-foreground uppercase">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground gap-4 opacity-40">
                    <Receipt className="h-16 w-16" />
                    <p className="font-bold uppercase tracking-widest text-xs">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="pt-12 pb-6 border-t border-border/40 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 opacity-30 grayscale" />
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40">Powered by FncBoard Premium</span>
          </div>
          <p className="text-[10px] text-muted-foreground/30 font-medium">This is a read-only shared view. Interactive features are disabled for external viewers.</p>
        </footer>
      </main>
    </div>
  );
}
