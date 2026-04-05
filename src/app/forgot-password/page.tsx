'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/otp/request', { email });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return setError('Please enter a 6-digit OTP.');
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/otp/verify', { email, otp });
      setStep('reset');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 4) {
      return setError('Password must be at least 4 characters long.');
    }
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/otp/reset', { email, otp, newPassword });
      setStep('success');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2 text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Forgot password?</h2>
              <p className="text-sm text-balance text-muted-foreground">
                Enter your email address and we'll send you an OTP to reset your password.
              </p>
            </div>
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    className="pl-9 h-11 bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 focus-visible:ring-primary transition-all"
                    placeholder="jane@example.com"
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold group" disabled={loading}>
                {loading ? 'Sending OTP...' : <span className="flex items-center gap-2">Send OTP Code <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></span>}
              </Button>
            </form>
          </motion.div>
        );
      case 'otp':
        return (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2 text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Enter OTP</h2>
              <p className="text-sm text-muted-foreground">
                We've sent a 6-digit code to <strong>{email}</strong>.
              </p>
            </div>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">6-Digit Code</Label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="otp" 
                    className="pl-9 h-11 bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 text-center text-lg tracking-[0.5em] font-mono focus-visible:ring-primary transition-all"
                    placeholder="000000"
                    maxLength={6}
                    required 
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button 
                variant="ghost" 
                type="button" 
                className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setStep('email')}
              >
                Change Email Address
              </Button>
            </form>
          </motion.div>
        );
      case 'reset':
        return (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="space-y-2 text-center mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Set New Password</h2>
              <p className="text-sm text-muted-foreground">
                Your identity has been verified. Choose a new secure password.
              </p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">New Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="newPassword" 
                      type={showPassword ? 'text' : 'password'}
                      className="pl-9 pr-10 h-11 bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 focus-visible:ring-primary transition-all"
                      placeholder="••••••••"
                      required 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="confirmPassword" 
                      type={showPassword ? 'text' : 'password'}
                      className="pl-9 pr-10 h-11 bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 focus-visible:ring-primary transition-all"
                      placeholder="••••••••"
                      required 
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading ? 'Updating Password...' : 'Reset Password'}
              </Button>
            </form>
          </motion.div>
        );
      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-6"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Password Reset Successful</h2>
                <p className="text-sm text-muted-foreground">
                  Your password has been successfully updated. You can now log in with your new credentials.
                </p>
              </div>
            </div>
            <Link href="/login" className="block w-full">
              <Button className="w-full h-11 font-semibold">
                Go to Login
              </Button>
            </Link>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="flex flex-col items-center mb-8 gap-3">
          <Logo className="w-12 h-12" />
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Account Security</p>
          </div>
        </div>

        <Card className="border border-border/40 shadow-xl overflow-hidden backdrop-blur-sm bg-background/95">
          <div className="h-1 bg-primary/40 w-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step === 'email' ? 0.25 : step === 'otp' ? 0.5 : step === 'reset' ? 0.75 : 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <CardContent className="pt-8">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 flex items-center gap-2 mb-6 font-medium"
                >
                  <div className="w-1 h-1 rounded-full bg-destructive" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-border/20 py-4 flex flex-col items-center justify-center">
            {step !== 'success' && (
              <Link href="/login" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group">
                <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
              </Link>
            )}
            {step === 'success' && (
              <p className="text-xs text-muted-foreground">Secure your account with 2FA in settings after login.</p>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
