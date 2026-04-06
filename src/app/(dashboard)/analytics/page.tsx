'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  ArrowUpRight,
  TrendingDown,
  Info,
  CreditCard,
  Smartphone,
  Wallet,
  Globe,
  Search,
  ChevronDown,
  MoreVertical,
  HelpCircle,
  Eye,
  ArrowRight,
  Target,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  CartesianGrid
} from 'recharts';
import { ReportModal } from '@/components/report-modal';

export default function AnalyticsPage() {
  const { transactions, fetchTransactions, loading } = useFinanceStore();
  const { user } = useAuthStore();
  const currency = user?.currencyCode || 'USD';
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const analyticsData = useMemo(() => {
    if (transactions.length === 0) return null;

    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);

    // 1. Health Score (0-100)
    const healthScore = totalIncome > 0 
      ? Math.min(Math.max(((totalIncome - totalExpense) / totalIncome) * 100, 0), 100) 
      : 0;

    // 2. Categories with Sparklines (Top 4)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const categoryStats = transactions
      .filter(t => t.type === 'Expense')
      .reduce((acc: any, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { 
            name: t.category, 
            total: 0, 
            count: 0, 
            history: last7Days.map(date => ({ date, value: 0 })) 
          };
        }
        acc[t.category].total += t.amount;
        acc[t.category].count += 1;
        const txDate = typeof t.date === 'string' ? t.date.split('T')[0] : t.date.toISOString().split('T')[0];
        const historyItem = acc[t.category].history.find((h: any) => h.date === txDate);
        if (historyItem) historyItem.value += t.amount;
        return acc;
      }, {});

    const topCategories = Object.values(categoryStats)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 4);

    // 3. Trends (Daily Cash Flow)
    const dailyTrends = last7Days.map(date => {
      const dayTxs = transactions.filter(t => {
        const txDate = typeof t.date === 'string' ? t.date : t.date.toISOString();
        return txDate.split('T')[0] === date;
      });
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: dayTxs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
        expense: dayTxs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0),
        count: dayTxs.length,
      };
    });

    // 4. Comparison with generic "avg" (Mock for the "92%" figure in image)
    const industryAvg = 82; 

    return {
      healthScore,
      industryAvg,
      topCategories,
      dailyTrends,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      txCount: transactions.length
    };
  }, [transactions]);

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <div className="h-24 w-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/5">
             <BarChart3 className="h-10 w-10 text-muted-foreground opacity-30" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">No Transactions Found</h2>
          <p className="max-w-xs text-muted-foreground text-sm font-medium">Add some transactions to see your deep analytics and AI-powered insights.</p>
       </div>
     );
  }

  return (
    <div className="flex flex-col space-y-8 pb-12">
      
      {/* Top Header Section: Position Tracking Style */}
      <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
        <div className="flex items-center justify-between mb-8 relative z-10">
           <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
             <div className="p-2 bg-primary/20 rounded-xl">
               <Activity className="h-5 w-5 text-primary" />
             </div>
             Financial Health Tracking
           </h3>
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" className="bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground gap-2 hover:text-white">
               Last 30 days <ChevronDown className="h-3 w-3" />
             </Button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
          
          {/* Site Health Gauge */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Financial Score <HelpCircle className="h-3 w-3 opacity-30" />
            </div>
            
            <div className="relative h-48 w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={[{ value: analyticsData.healthScore }]} 
                  startAngle={180} 
                  endAngle={0}
                >
                  <RadialBar 
                    background 
                    dataKey="value" 
                    fill="#34d399" 
                    cornerRadius={12}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                <span className="text-4xl font-black text-white">{analyticsData.healthScore.toFixed(0)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-2 text-muted-foreground"><div className="h-2 w-2 rounded-full bg-emerald-400" /> Your health</span>
                <span className="text-white">{analyticsData.healthScore.toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="flex items-center gap-2 text-muted-foreground"><div className="h-2 w-2 rounded-full bg-rose-400" /> Target health</span>
                <span className="text-white">92%</span>
              </div>
            </div>
          </div>

          {/* Keywords Sparklines */}
          <div className="lg:col-span-4 space-y-8 h-full flex flex-col pt-2">
             <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Top Spending Mix</div>
             <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                {analyticsData.topCategories.map((cat: any, i: number) => (
                  <div key={i} className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Top {i + 1 === 1 ? '3' : i + 1 === 2 ? '10' : i + 1 === 3 ? '20' : '100'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center text-white">
                          <Eye className="h-4 w-4 opacity-50" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-lg font-black text-white leading-none mb-1">{formatCurrency(cat.total).replace('.00', '').replace('$', '').trim()}</span>
                          <span className="text-[10px] font-bold text-emerald-400">+{cat.count} tx</span>
                       </div>
                    </div>
                    <div className="h-10 w-full opacity-60">
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={cat.history}>
                            <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot={false} />
                         </LineChart>
                       </ResponsiveContainer>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Top Keywords Table */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Significant Spending Items</div>
            <div className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-4 py-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest w-1/2">Category</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">Volume</th>
                      <th className="px-4 py-3 text-[9px] font-black uppercase text-muted-foreground tracking-widest text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topCategories.slice(0, 5).map((cat: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group/row">
                        <td className="px-4 py-3">
                           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black rounded-lg truncate max-w-[140px] uppercase tracking-widest px-2 py-0.5">{cat.name}</Badge>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-white text-center group-hover/row:scale-105 transition-transform">{cat.count.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-black text-white text-right whitespace-nowrap">{formatCurrency(cat.total).replace('.00', '')}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* User Overview Section: Bottom Left style */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl flex-1 flex flex-col group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
               <MoreHorizontal className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
            
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white tracking-tight">User Overview</h3>
              <div className="flex items-center gap-4 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-primary" /> Active</span>
                <span className="flex items-center gap-1.5"><div className="h-1 w-1 rounded-full bg-emerald-400/50" /> 7-Day</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-10">
              <div className="space-y-4 flex flex-col items-center">
                 <div className="h-14 w-14 rounded-full border-[6px] border-primary/20 border-t-primary relative flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary absolute opacity-40" />
                 </div>
                 <div className="text-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">DR</span>
                    <p className="text-sm font-black text-white mt-1">87 <span className="text-[8px] text-emerald-400 font-bold ml-0.5">+4.1K</span></p>
                 </div>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                 <div className="h-14 w-14 rounded-full border-[6px] border-emerald-400/10 border-t-emerald-400 relative flex items-center justify-center">
                    <Activity className="h-4 w-4 text-emerald-400 absolute opacity-40" />
                 </div>
                 <div className="text-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">UR</span>
                    <p className="text-sm font-black text-white mt-1">55 <span className="text-[8px] text-emerald-400 font-bold ml-0.5">+3.4K</span></p>
                 </div>
              </div>
              <div className="space-y-4 flex flex-col items-center">
                 <div className="h-14 w-14 rounded-full border-[6px] border-rose-400/5 border-t-rose-400 relative flex items-center justify-center">
                    <Target className="h-4 w-4 text-rose-400 absolute opacity-40" />
                 </div>
                 <div className="text-center">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">AR</span>
                    <p className="text-sm font-black text-white mt-1">55 <span className="text-[8px] text-rose-400 font-bold ml-0.5">-2.4K</span></p>
                 </div>
              </div>
            </div>

            <div className="h-48 w-full mt-auto relative">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.dailyTrends} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userColorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="userColorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="income" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#userColorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#userColorTrend)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <div className="flex items-center justify-between mt-6 px-1">
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-30">Apr 12</span>
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-30">Apr 17</span>
            </div>
          </Card>
        </div>

        {/* Sessions & Engagement Section: Bottom Right style */}
        <div className="lg:col-span-8 space-y-8 flex flex-col">
          <Card className="bg-[#161818] border-none rounded-[2.5rem] p-8 shadow-2xl relative group overflow-hidden flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-8 relative z-10">
               <h3 className="text-lg font-bold text-white tracking-tight">Sessions & Engagement</h3>
               <Button 
                variant="link" 
                onClick={() => setReportModalOpen(true)}
                className="text-[10px] font-black uppercase text-primary hover:text-primary/80 tracking-widest p-0 h-auto flex items-center gap-2 group/btn"
              >
                 View Full Report <ArrowUpRight className="h-3 w-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
               </Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 relative z-10 border-b border-white/5 pb-10">
                <div className="space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Visits <HelpCircle className="h-2.5 w-2.5 opacity-20" /></div>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white">{analyticsData.txCount.toLocaleString()}</span>
                      <span className="text-[10px] font-black text-emerald-400 mb-1 leading-none">+10.32%</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Unique <HelpCircle className="h-2.5 w-2.5 opacity-20" /></div>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white">{(analyticsData.txCount * 0.7).toFixed(0)}</span>
                      <span className="text-[10px] font-black text-rose-400 mb-1 leading-none">-4.8%</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Pages/Visit <HelpCircle className="h-2.5 w-2.5 opacity-20" /></div>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white">4.12</span>
                      <span className="text-[10px] font-black text-rose-400 mb-1 leading-none">-11.8%</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Avg. Duration <HelpCircle className="h-2.5 w-2.5 opacity-20" /></div>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white">04:03</span>
                      <span className="text-[10px] font-black text-emerald-400 mb-1 leading-none">+1.32%</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.15em]">Traffic Rank <HelpCircle className="h-2.5 w-2.5 opacity-20" /></div>
                   <div className="flex items-end gap-2">
                      <span className="text-2xl font-black text-white">1,128</span>
                      <span className="text-[10px] font-black text-emerald-400 mb-1 leading-none">+3.21%</span>
                   </div>
                </div>
             </div>

             <div className="h-[300px] w-full mt-auto relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={analyticsData.dailyTrends} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(255,255,255,0.2)' }} 
                        hide
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0C0E0E', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 900,
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 1)',
                          padding: '16px'
                        }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#34d399" 
                        strokeWidth={4} 
                        dot={{ r: 0 }} 
                        activeDot={{ r: 6, strokeWidth: 4, stroke: '#161818', fill: '#34d399' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        dot={{ r: 0 }} 
                        strokeDasharray="4 4"
                      />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </div>
      </div>
      
      <ReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
      />
    </div>
  );
}
