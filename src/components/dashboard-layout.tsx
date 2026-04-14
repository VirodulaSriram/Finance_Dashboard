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
  TrendingDown,
  Shield,
  PlusCircle,
  Gem
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
import { IncomeModal } from './income-modal';

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
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, _hasHydrated, compactMode, accentColor } = useAuthStore();
  const { transactions, fetchTransactions } = useFinanceStore();
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ transactions: any[], goals: any[], budgets: any[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Search Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: { 'user-id': user?.id || '' }
          });
          const data = await res.json();
          setSearchResults(data);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user?.id]);

  // Build nav items - Admin Console only visible to Admin users
  const allSidebarItems = [
    ...sidebarItems,
    ...(user?.role === 'Admin' ? [{ label: 'Admin Console', icon: Shield, href: '/admin' }] : []),
  ];

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
      className="flex h-screen bg-background p-2 md:p-3 lg:p-4 gap-4 overflow-hidden relative font-sans selection:bg-primary/20 selection:text-primary"
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
          "fixed md:relative flex flex-col bg-sidebar/50 backdrop-blur-2xl z-50 h-full overflow-hidden transition-all duration-300 border-r border-sidebar-border/50 shadow-2xl md:shadow-none",
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
                <span className="font-bold text-xl leading-tight text-foreground tracking-tight">FncBoard</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Financial Assistant</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto scrollbar-hide flex flex-col">
          {/* Main Menu */}
          <div className="space-y-1.5">
            {isSidebarOpen && <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Menu</p>}
            {allSidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && setIsSidebarOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 h-12 text-sm font-bold rounded-2xl transition-all duration-300 group py-6 fluid-hover",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                      "w-full justify-start gap-4 h-12 text-sm font-bold rounded-2xl transition-all duration-300 group py-6 fluid-hover",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          
          {/* Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-border/50">
             <Button
               onClick={() => setIsIncomeModalOpen(true)}
               className={cn(
                 "w-full justify-start gap-4 h-12 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300 py-6 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white group shadow-lg shadow-emerald-500/10 fluid-hover",
                 !isSidebarOpen && "px-0 justify-center"
               )}
             >
               <PlusCircle className={cn("h-5 w-5 shrink-0 transition-transform", "group-hover:scale-110")} />
               {isSidebarOpen && <span>Add Income</span>}
             </Button>
          </div>
          {/* Activity Chart Section */}
          {isSidebarOpen && (
            <div className="mt-auto mb-4 p-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-[2.5rem] p-5 relative overflow-hidden group shadow-xl"
              >
                <div className="absolute -right-4 -top-4 bg-primary/5 h-24 w-24 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                
                <div className="flex items-center justify-between mb-4 px-1 relative z-10">
                  <h3 className="font-bold text-xs text-foreground flex items-center gap-2">
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
                        cursor={{ fill: 'var(--accent)', radius: 4 }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border p-2 rounded-xl shadow-2xl backdrop-blur-md">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.date}</p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[9px] text-muted-foreground font-bold uppercase">In</span>
                                    <span className="text-[10px] font-black text-emerald-500">+{payload[0].value}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-[9px] text-muted-foreground font-bold uppercase">Out</span>
                                    <span className="text-[10px] font-black text-rose-500">-{payload[1].value}</span>
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

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border pt-4 relative z-10">
                   <div className="flex flex-col">
                     <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Avg In</span>
                     <span className="text-xs font-black text-foreground leading-none">
                       {user?.currencyCode || '$'}{(activityData.reduce((s, d) => s + d.income, 0) / 7).toFixed(0)}
                     </span>
                   </div>
                   <div className="flex flex-col text-right">
                     <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Avg Out</span>
                     <span className="text-xs font-black text-foreground leading-none">
                       {user?.currencyCode || '$'}{(activityData.reduce((s, d) => s + d.expense, 0) / 7).toFixed(0)}
                     </span>
                   </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Logout - pinned at bottom */}
          <div className="pb-4 mt-auto">
             <Button
               variant="ghost"
               onClick={handleLogout}
               className={cn(
                 "w-full justify-start gap-4 h-12 text-sm font-bold rounded-2xl transition-all duration-300 group py-6",
                 "text-destructive hover:bg-destructive/10 hover:text-destructive"
               )}
             >
               <LogOut className={cn("h-5 w-5 shrink-0 transition-all", "group-hover:scale-110")} />
               {isSidebarOpen && <span>Logout</span>}
             </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 bg-background rounded-[3rem] shadow-2xl shadow-black/5 relative overflow-hidden transition-all duration-300",
        compactMode && "compact"
      )}>
        {/* Header */}
        <header className="h-24 glass-surface px-8 flex items-center justify-between sticky top-0 z-30 border-b border-border/40">
          <div className="flex items-center gap-4">
             <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-foreground tracking-tight leading-none mb-1">{user?.username}</h2>
                <p className="text-xs text-muted-foreground font-medium">Hello, Welcome back!</p>
              </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search transactions, goals, budgets..." 
                className="h-12 w-full bg-background border border-border rounded-2xl pl-12 text-sm focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-muted rounded-md text-[10px] font-bold text-muted-foreground border border-border uppercase tracking-widest hidden sm:block shadow-sm">
                {isSearching ? <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : '↵'}
              </div>

              {/* Dynamic Search Results Dropdown */}
              <AnimatePresence>
                {showResults && searchResults && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-14 left-0 right-0 bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
                  >
                    <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {/* Transactions Results */}
                      {searchResults.transactions.length > 0 && (
                        <div className="mb-4">
                          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Transactions</p>
                          {searchResults.transactions.map((tx) => (
                            <Link key={tx.id} href={tx.url} onClick={() => setShowResults(false)}>
                              <div className="flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className={cn("p-2 rounded-lg", tx.type === 'Income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")}>
                                    <Receipt className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tx.title}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{tx.category}</p>
                                  </div>
                                </div>
                                <span className={cn("text-xs font-black", tx.type === 'Income' ? "text-emerald-500" : "text-rose-500")}>
                                  {tx.type === 'Income' ? '+' : '-'}{tx.amount}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Goals Results */}
                      {searchResults.goals.length > 0 && (
                        <div className="mb-4">
                          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Goals</p>
                          {searchResults.goals.map((goal) => (
                            <Link key={goal.id} href={goal.url} onClick={() => setShowResults(false)}>
                              <div className="flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                    <Target className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{goal.title}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                      Goal Progression: {Math.round((goal.current / goal.target) * 100)}%
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Budgets Results */}
                      {searchResults.budgets.length > 0 && (
                        <div>
                          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Budgets</p>
                          {searchResults.budgets.map((budget) => (
                            <Link key={budget.id} href={budget.url} onClick={() => setShowResults(false)}>
                              <div className="flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors group">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                    <CreditCard className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{budget.category} Budget</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                      {Math.round((budget.spent / budget.total) * 100)}% Used
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {!searchResults.transactions.length && !searchResults.goals.length && !searchResults.budgets.length && (
                        <div className="py-8 text-center">
                          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No matches found</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-muted/50 border-t border-border flex items-center justify-between">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Global Application Search</p>
                      <X className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => setShowResults(false)} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
               <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-card border border-border/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all relative fluid-hover card-shadow">
                 <Bell className="h-5 w-5" />
                 <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-background shadow-sm" />
               </Button>
               <ReportDialog 
                 trigger={
                   <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-card border border-border/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all fluid-hover card-shadow">
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
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-muted border border-border text-foreground hover:bg-primary/10 hover:text-primary transition-all">
                  <Share2 className="h-5 w-5" />
                </Button>
              } 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-12 w-12 rounded-2xl bg-muted border border-border text-foreground hover:bg-primary/10 hover:text-primary transition-all"
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

      <IncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
      />
    </div>
  );
}
