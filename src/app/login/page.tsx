'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Plus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Logo } from '@/components/ui/logo';

// --- Decorative Components for Visual Side ---

const FloatingCard = ({ children, className, delay = 0, duration = 4 }: { children: React.ReactNode, className?: string, delay?: number, duration?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [0, -10, 0],
    }}
    transition={{ 
      opacity: { duration: 0.5, delay: delay * 0.2 },
      y: { duration, repeat: Infinity, ease: "easeInOut", delay }
    }}
    className={`absolute p-4 rounded-2xl bg-white/80 dark:bg-card/40 backdrop-blur-md border border-white/40 dark:border-border/40 shadow-xl dark:shadow-2xl dark:shadow-black/20 z-10 ${className}`}
  >
    {children}
  </motion.div>
);

const BalanceCard = () => (
  <FloatingCard className="top-[5%] left-[10%] w-48" delay={0.2}>
    <div className="bg-blue-50 dark:bg-blue-900/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
      <CreditCard className="w-5 h-5 text-[#0066FF]" />
    </div>
    <p className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Current Balance</p>
    <p className="text-xl font-bold text-foreground mt-1">$24,359</p>
  </FloatingCard>
);

const TransactionCard = () => (
  <FloatingCard className="bottom-[5%] left-[5%] w-56 border-dashed border-2 bg-transparent dark:bg-transparent backdrop-blur-none shadow-none ring-1 ring-inset ring-foreground/5 dark:ring-foreground/10" delay={0.5} duration={5}>
    <div className="flex flex-col items-center justify-center py-4 bg-white/40 dark:bg-card/20 rounded-xl">
      <div className="bg-[#0066FF] w-10 h-10 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-blue-200 dark:shadow-blue-900/30">
        <Plus className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-semibold text-foreground">New transaction</p>
      <p className="text-[10px] text-muted-foreground mt-1">or upload .xls file</p>
    </div>
  </FloatingCard>
);

const SpendingChart = () => (
  <FloatingCard className="top-[25%] right-[10%] w-44" delay={0.8} duration={4.5}>
    <div className="relative w-24 h-24 mx-auto mb-2">
      {/* Semi-circular doughnut chart (SVG) */}
      <svg viewBox="0 0 100 100" className="rotate-[-90deg]">
        <circle cx="50" cy="50" r="40" className="stroke-muted-foreground/10 dark:stroke-muted" strokeWidth="12" fill="none" />
        <circle 
          cx="50" cy="50" r="40" 
          stroke="#0066FF" 
          strokeWidth="12" 
          fill="none" 
          strokeDasharray="251.2" 
          strokeDashoffset={251.2 * (1 - 0.34)} 
          strokeLinecap="round"
        />
        <circle 
          cx="50" cy="50" r="40" 
          stroke="#EF4444" 
          strokeWidth="12" 
          fill="none" 
          strokeDasharray="251.2" 
          strokeDashoffset={251.2 * (1 - 0.12)}
          className="opacity-20"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">34%</span>
        <span className="text-[8px] font-medium text-muted-foreground uppercase">Food</span>
      </div>
    </div>
  </FloatingCard>
);

// --- Main Page Component ---

const SLIDES = [
  {
    title: "Welcome back!",
    description: "Start managing your finance faster and better",
  },
  {
    title: "Track everything",
    description: "Monitor your spending and income in real-time with our unified dashboard",
  },
  {
    title: "AI Insights",
    description: "Get personalized financial advice and spending trends powered by AI",
  },
  {
    title: "Secure & Private",
    description: "Your financial data is encrypted and protected with OTP authentication",
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(1); 
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  const handlePrev = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      setAuth(response.data.user, response.data.token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950/40 p-4 md:p-8 lg:p-12 xl:p-16 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30 selection:text-blue-600 overflow-hidden text-foreground">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex w-full max-w-[1600px] h-full min-h-[750px] bg-background rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl shadow-blue-500/5 transition-all relative"
      >
        {/* Left Column: Visuals (Hidden on small screens) */}
        <div className="hidden lg:flex w-1/2 bg-slate-50/50 dark:bg-slate-900/10 relative overflow-hidden flex-col border-r border-border/40">
          {/* Brand Logo */}
          <div className="pt-12 pl-12 flex items-center gap-3 relative z-20">
            <div className="w-10 h-10">
              <Logo className="w-full h-full" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#001D4D] dark:text-blue-400">FncBoard</span>
          </div>

          {/* Floating Visual Elements */}
          <div className="flex-1 relative">
            <BalanceCard />
            <SpendingChart />
            <TransactionCard />
          </div>

          {/* Welcome Text & Controls */}
          <div className="p-12 pb-20 relative z-20">
            <div className="h-48 flex flex-col justify-end">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="max-w-sm"
                >
                  <h2 className="text-4xl font-bold text-foreground mb-4">{SLIDES[currentSlide].title}</h2>
                  <p className="text-muted-foreground text-lg mb-10 leading-relaxed min-h-[56px]">
                    {SLIDES[currentSlide].description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center gap-10">
                {/* Pagination Dots */}
                <div className="flex gap-2">
                  {SLIDES.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-6 bg-[#0066FF]' : 'w-1.5 bg-muted'
                      }`}
                    />
                  ))}
                </div>
                
                {/* Arrows */}
                <div className="flex gap-4">
                  <button 
                    onClick={handlePrev}
                    className="p-2.5 bg-background border border-border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                  <button 
                    onClick={handleNext}
                    className="p-2.5 bg-background border border-border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-20 lg:px-24 xl:px-32 relative bg-background">
          <div className="max-w-md w-full mx-auto">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-10">
              <Logo className="w-10 h-10" />
              <span className="text-xl font-bold tracking-tight text-[#001D4D] dark:text-blue-400">FncBoard</span>
            </div>

            <header className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back!</h1>
              <p className="text-muted-foreground">Start managing your finance faster and better</p>
            </header>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-4 mb-6 flex items-center gap-3 overflow-hidden"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="you@exmaple.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-border/40 focus:border-blue-500/50 rounded-xl focus:ring-4 focus:ring-[#0066FF]/10 focus:bg-muted/50 transition-all text-foreground placeholder:text-muted-foreground font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 bg-muted/30 border border-border/40 focus:border-blue-500/50 rounded-xl focus:ring-4 focus:ring-[#0066FF]/10 focus:bg-muted/50 transition-all text-foreground placeholder:text-muted-foreground font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link href="/forgot-password" title="Forgot Password" className="text-sm font-semibold text-[#0066FF] hover:underline underline-offset-4">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-[#0066FF] hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all active:scale-[0.98] border-none"
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <p className="mt-20 text-center text-muted-foreground text-sm">
              Don't you have an account?{' '}
              <Link href="/register" className="text-[#0066FF] font-bold hover:underline underline-offset-4">
                Sign Up
              </Link>
            </p>

            <footer className="mt-24 text-center text-[10px] tracking-widest text-muted-foreground/50 flex flex-col gap-2">
              <div>© 2024 ALL RIGHTS RESERVED</div>
            </footer>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


