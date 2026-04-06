'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  TrendingUp, 
  CreditCard, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
  Bell,
  Sparkles,
  ArrowUpRight,
  Share2,
  Menu as MenuIcon,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  ResponsiveContainer, 
  Tooltip,
  Cell
} from 'recharts';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from './theme-toggle';
import { Input } from './ui/input';
import { ReportDialog } from './report-dialog';

const sidebarItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Transactions', icon: Receipt, href: '/transactions' },
  { label: 'My Goals', icon: Target, href: '/goals' },
  { label: 'Investment', icon: TrendingUp, href: '/investment' },
  { label: 'Bills and Payment', icon: CreditCard, href: '/bills' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics' },
];

const supportItems = [
  { label: 'Helps', icon: HelpCircle, href: '/help' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, _hasHydrated, compactMode, accentColor } = useAuthStore();
  const { transactions, fetchTransactions } = useFinanceStore();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const activityData = React.useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => {
        const txDate = new Date(t.date).toISOString().split('T')[0];
        return txDate === date;
      });
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        income: dayTransactions.filter(t => t.type === 'Income').reduce((sum: number, t) => sum + t.amount, 0),
        expense: dayTransactions.filter(t => t.type === 'Expense').reduce((sum: number, t) => sum + t.amount, 0),
      };
    });
  }, [transactions]);

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push('/login');
    }
  }, [user, _hasHydrated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!_hasHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Logo className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div 
      className="flex h-screen bg-[#0C0E0E] p-2 md:p-3 lg:p-4 gap-4 overflow-hidden relative font-sans selection:bg-primary/20 selection:text-primary"
      data-accent={accentColor}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop & Mobile Drawer */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 88),
          x: typeof window !== 'undefined' && window.innerWidth < 768 && !isSidebarOpen ? -300 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className={cn(
          "fixed md:relative flex flex-col bg-[#0C0E0E] z-50 h-full overflow-hidden transition-all duration-300 ring-1 ring-white/5",
          !isSidebarOpen && "md:flex hidden"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Logo className="h-7 w-7 text-primary" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-tight text-white tracking-tight">Finomic</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Financial Assistant</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto scrollbar-hide flex flex-col">
          {/* Main Menu */}
          <div className="space-y-1.5">
            {isSidebarOpen && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Menu</p>}
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && setIsSidebarOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 h-12 text-sm font-bold rounded-2xl transition-all duration-300 group py-6",
                      isActive
                        ? "bg-primary text-[#0C0E0E] hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0 transition-all", isActive ? "scale-110" : "group-hover:scale-110")} />
                    {isSidebarOpen && <span>{item.label}</span>}
                    {isActive && isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Support Menu */}
          <div className="space-y-1.5">
             {isSidebarOpen && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Support</p>}
            {supportItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && setIsSidebarOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 h-12 text-sm font-bold rounded-2xl transition-all duration-300 group py-6",
                      isActive
                        ? "bg-primary text-[#0C0E0E] hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0 transition-all", isActive ? "scale-110" : "group-hover:scale-110")} />
                    {isSidebarOpen && <span>{item.label}</span>}
                    {isActive && isSidebarOpen && <ChevronRight className="ml-auto h-4 w-4" />}
                  </Button>
                </Link>
              );
            })}
          </div>
          
          {/* Logout Section */}
          <div className="space-y-1.5 mt-4">
             <Button
               variant="ghost"
               onClick={handleLogout}
               className={cn(
                 "w-full justify-start gap-4 h-12 text-sm font-bold rounded-2xl transition-all duration-300 group py-6",
                 "text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
               )}
             >
               <LogOut className={cn("h-5 w-5 shrink-0 transition-all", "group-hover:scale-110")} />
               {isSidebarOpen && <span>Logout</span>}
             </Button>
          </div>

          {/* Activity Chart Section */}
          {isSidebarOpen && (
            <div className="mt-auto mb-6 p-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-white/10 to-white/5 rounded-[2.5rem] p-5 border border-white/10 relative overflow-hidden group shadow-2xl backdrop-blur-xl"
              >
                <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                
                <div className="flex items-center justify-between mb-4 px-1 relative z-10">
                  <h3 className="font-bold text-xs text-white flex items-center gap-2">
                    <div className="p-1.5 bg-primary/20 rounded-lg">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    </div>
                    Activity
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Last 7D</span>
                </div>
                
                <div className="h-28 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#0C0E0E] border border-white/10 p-2 rounded-xl shadow-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.date}</p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[9px] text-muted-foreground font-bold uppercase">In</span>
                                    <span className="text-[10px] font-black text-emerald-400">+{payload[0].value}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Out</span>
                                    <span className="text-[10px] font-black text-rose-400">-{payload[1].value}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="income" fill="#10b981" radius={[2, 2, 0, 0]} barSize={4} />
                      <Bar dataKey="expense" fill="#f43f5e" radius={[2, 2, 0, 0]} barSize={4} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-4 relative z-10">
                   <div className="flex flex-col">
                     <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Avg In</span>
                     <span className="text-xs font-black text-white leading-none">
                       {user?.currencyCode || '$'}{(activityData.reduce((s, d) => s + d.income, 0) / 7).toFixed(0)}
                     </span>
                   </div>
                   <div className="flex flex-col text-right">
                     <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Avg Out</span>
                     <span className="text-xs font-black text-white leading-none">
                       {user?.currencyCode || '$'}{(activityData.reduce((s, d) => s + d.expense, 0) / 7).toFixed(0)}
                     </span>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 bg-[#161818] rounded-[3rem] shadow-2xl shadow-black relative overflow-hidden border border-white/5 transition-all duration-300",
        compactMode && "compact"
      )}>
        {/* Header */}
        <header className="h-24 bg-[#161818] px-8 flex items-center justify-between sticky top-0 z-30 border-b border-white/5">
          <div className="flex items-center gap-4">
             <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white tracking-tight leading-none mb-1">{user?.username}</h2>
                <p className="text-xs text-muted-foreground font-medium">Hello, Welcome back!</p>
              </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search or type command" 
                className="h-12 w-full bg-[#0C0E0E] border-none rounded-2xl pl-12 text-sm focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/5 rounded-md text-[10px] font-bold text-muted-foreground border border-white/10 uppercase tracking-widest hidden sm:block">F</div>
            </div>

            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-[#0C0E0E] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all relative">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-[#0C0E0E]" />
               </Button>
               <Button className="h-12 px-6 rounded-2xl bg-primary text-[#0C0E0E] font-extrabold text-sm gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  2 New
               </Button>
               <ReportDialog 
                 trigger={
                   <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-[#0C0E0E] text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                      <Share2 className="h-5 w-5" />
                   </Button>
                 } 
               />
               <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ReportDialog 
              trigger={
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white">
                  <Share2 className="h-5 w-5" />
                </Button>
              } 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-12 w-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-[var(--dashboard-padding)] scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-7xl mx-auto space-y-[var(--section-gap)]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
