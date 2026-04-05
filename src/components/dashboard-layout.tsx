'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  UserCircle, 
  LogOut, 
  Menu, 
  X, 
  Wallet,
  Settings,
  Bell,
  PieChart,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';

import { Logo } from '@/components/ui/logo';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Receipt, label: 'Transactions', href: '/transactions' },
  { icon: PieChart, label: 'Budgets', href: '/budgets' },
  { icon: Target, label: 'Goals', href: '/goals' },
  { icon: UserCircle, label: 'Profile', href: '/profile' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, _hasHydrated } = useAuthStore();

  React.useEffect(() => {
    // Wait for hydration to be complete before making auth decisions
    if (!_hasHydrated) return;

    if (!user) {
      router.push('/login');
    }
  }, [user, router, _hasHydrated]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!_hasHydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If hydrated and no user, the useEffect will handle redirection. 
  // We return null or a loading state while redirecting to avoid flickering.
  if (!user) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
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
          width: isSidebarOpen ? 260 : (typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : 80),
          x: typeof window !== 'undefined' && window.innerWidth < 768 && !isSidebarOpen ? -260 : 0
        }}
        className={cn(
          "fixed md:relative flex flex-col border-r border-border bg-sidebar text-sidebar-foreground z-50 h-full overflow-hidden",
          !isSidebarOpen && "md:flex hidden"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 drop-shadow-sm shrink-0" />
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <span className="font-bold text-lg leading-tight tracking-tight text-foreground">
                  Finance
                </span>
                <span className="font-medium text-sm leading-tight text-primary">
                  Dashboard
                </span>
              </motion.div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => typeof window !== 'undefined' && window.innerWidth < 768 && setIsSidebarOpen(false)}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-10 text-sm font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary hover:bg-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-10 rounded-md"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background px-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate hidden sm:block">
              {sidebarItems.find(item => pathname === item.href)?.label || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-primary/10 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/10 transition-all hover:border-primary/30">
                      <AvatarImage src={user?.avatar} alt={user?.username} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
