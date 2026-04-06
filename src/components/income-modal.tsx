'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  Loader2, 
  DollarSign, 
  ArrowUpRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
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
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IncomeModal({ isOpen, onClose }: IncomeModalProps) {
  const { addTransaction } = useFinanceStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Salary',
    title: '',
    date: new Date().toLocaleDateString('en-CA'),
  });

  const currency = user?.currencyCode || 'USD';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    setLoading(true);
    try {
      await addTransaction({
        title: formData.title || formData.category,
        amount: Number(formData.amount),
        category: formData.category,
        date: formData.date,
        type: 'Income',
        paymentMethod: 'Other',
        status: 'Success'
      });
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          amount: '',
          category: 'Salary',
          title: '',
          date: new Date().toLocaleDateString('en-CA'),
        });
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-[#0C0E0E] border-white/5 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8"
            >
              <DialogHeader className="mb-8">
                <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                  <TrendingUp className="h-7 w-7 text-emerald-500 animate-pulse" />
                </div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight leading-tight">
                  Record <br /> New Income
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-2">
                  Track your earnings & growth
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title (Optional)</Label>
                    <Input 
                      placeholder="e.g. Monthly Salary, Freelance project"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="h-12 bg-white/[0.03] border-white/5 rounded-xl text-white font-medium focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount ({currency})</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50 font-black text-xs">$</span>
                        <Input 
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: e.target.value})}
                          className="h-12 bg-white/[0.03] border-white/5 rounded-xl pl-8 text-white font-black focus:bg-white/[0.05] transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                      <Input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="h-12 bg-white/[0.03] border-white/5 rounded-xl text-white font-medium focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Income Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={v => setFormData({...formData, category: v as string })}
                    >
                      <SelectTrigger className="h-12 bg-white/[0.03] border-white/5 rounded-xl text-white font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0C0E0E] border-white/10">
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                        <SelectItem value="Investment Returns">Investment Returns</SelectItem>
                        <SelectItem value="Rental Income">Rental Income</SelectItem>
                        <SelectItem value="Bonus">Bonus</SelectItem>
                        <SelectItem value="Gift">Gift</SelectItem>
                        <SelectItem value="Other">Other Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20 rounded-2xl gap-2 transition-all active:scale-[0.98]"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 fill-white" />
                        Record Income
                        <ArrowUpRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 flex flex-col items-center text-center space-y-6"
            >
              <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 relative">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                <Sparkles className="h-12 w-12 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">Income Recorded!</h3>
                <p className="text-xs text-muted-foreground font-black tracking-widest uppercase opacity-60">
                  Growth is the only way forward.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
