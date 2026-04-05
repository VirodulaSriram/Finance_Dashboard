'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Wallet, Globe, Coins, ArrowRight, UserPlus, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/ui/logo';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/store/useAuthStore';
import type { Role } from '@/lib/types';

interface CountryData {
  name: { common: string };
  cca2: string;
  currencies?: Record<string, { name: string; symbol: string }>;
}

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('Viewer');
  const [country, setCountry] = useState('');
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,currencies');
        const sorted = response.data.sort((a: CountryData, b: CountryData) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sorted);
      } catch (err) {
        console.error('Failed to fetch countries', err);
      }
    };
    fetchCountries();
  }, []);

  const currencyOptions = useMemo(() => {
    const currencyMap: Record<string, string> = {};
    countries.forEach(c => {
      if (c.currencies) {
        Object.entries(c.currencies).forEach(([code, info]) => {
          if (!currencyMap[code]) {
            currencyMap[code] = info.name;
          }
        });
      }
    });
    return Object.entries(currencyMap)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [countries]);

  const handleCountryPageChange = (code: string) => {
    const selected = countries.find(c => c.cca2 === code);
    if (selected) {
      setCountry(selected.name.common);
      if (selected.currencies) {
        const firstCurrency = Object.keys(selected.currencies)[0];
        setCurrencyCode(firstCurrency);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 4) {
      return setError('Password must be at least 4 characters long.');
    }
    if (!country) {
      return setError('Please select your country.');
    }
    setError('');
    setLoading(true);
    
    try {
      await axios.post('/api/auth/register', { 
        username, 
        email, 
        password, 
        role,
        country,
        currencyCode
      });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 font-sans relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-lg z-10"
      >
        <Card className="border-border/40 shadow-2xl backdrop-blur-sm bg-background/80 overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 origin-left"
          />
          <CardHeader className="text-center pt-10 pb-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center mb-6 mx-auto"
            >
              <Logo className="w-20 h-20 drop-shadow-2xl" />
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-balance leading-relaxed">
              Step into a new era of effortless financial mastery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 flex items-center gap-3 mb-6 font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Full Name</Label>
                  <div className="relative group">
                    <Input 
                      id="username"
                      className="bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 h-11 focus-visible:ring-primary pl-4 transition-all"
                      placeholder="Jane Doe"
                      required 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email Address</Label>
                  <Input 
                    id="email"
                    type="email" 
                    className="bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 h-11 focus-visible:ring-primary pl-4 transition-all"
                    placeholder="jane@example.com"
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password</Label>
                  <div className="relative group">
                    <Input 
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className="bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 h-11 focus-visible:ring-primary pl-4 pr-10 transition-all"
                      placeholder="••••••••"
                      required 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
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

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Account Role</Label>
                  <Select value={role} onValueChange={(val) => val && setRole(val as Role)}>
                    <SelectTrigger className="bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 h-11 focus-visible:ring-primary text-sm transition-all">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Base Country</Label>
                  <Select onValueChange={(val: any) => val && handleCountryPageChange(val)}>
                    <SelectTrigger className="bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 h-11 focus-visible:ring-primary text-sm flex gap-2 items-center transition-all">
                      <div className="p-1 px-2.5 flex items-center truncate">
                        <Globe className="w-3.5 h-3.5 mr-2 opacity-60 shrink-0" />
                        <SelectValue placeholder="Select country" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map(c => (
                        <SelectItem key={c.cca2} value={c.cca2}>{c.name.common}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Base Currency</Label>
                  <Select value={currencyCode} onValueChange={val => val && setCurrencyCode(val)}>
                    <SelectTrigger className="bg-zinc-100/50 dark:bg-zinc-900/50 border-border/50 h-11 focus-visible:ring-primary text-sm flex items-center transition-all">
                      <div className="p-1 px-2.5 flex items-center truncate">
                        <Coins className="w-3.5 h-3.5 mr-2 opacity-60 shrink-0" />
                        <SelectValue placeholder="Currency" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {currencyOptions.map(curr => (
                        <SelectItem key={curr.code} value={curr.code}>{curr.code} - {curr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-md font-semibold tracking-wide shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl mt-4" 
                disabled={loading}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                     <ShieldCheck className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4 ml-1" /></span>
                )}
              </Button>
            </form>

          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center p-8 pt-2 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-border/20">
            <p className="text-sm text-muted-foreground font-medium">
              Already a member?{' '}
              <Link href="/login" className="text-primary hover:underline underline-offset-4 decoration-2 font-bold transition-all">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
