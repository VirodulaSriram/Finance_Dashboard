'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useSearchParams } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  Calendar,
  Receipt,
  ArrowUpRight,
  ChevronRight,
  Smartphone,
  CreditCard,
  Wallet,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionsPage() {
  const { transactions, fetchTransactions, loading, addTransaction, deleteTransaction } = useFinanceStore();
  const { user } = useAuthStore();
  const role = user?.role || 'Viewer';
  const currency = user?.currencyCode || 'USD';

  const formatCurrency = (amount: number, code: string = currency) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
    }).format(amount);
  };

  const getSecondaryAmount = (amount: number) => {
    // Mock conversion rate: 1 INR = 0.011 EUR
    const rate = 0.011;
    return formatCurrency(amount * rate, 'EUR');
  };

  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toLocaleDateString('en-CA'),
    amount: '',
    category: 'Groceries',
    type: 'Expense' as TransactionType,
    paymentMethod: 'UPI' as 'UPI' | 'Card' | 'Cash' | 'Net Banking' | 'Other',
    status: 'Success' as 'Success' | 'Waiting' | 'Declined'
  });
  const [otherLabel, setOtherLabel] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'All' || t.type === filterType;
      return matchSearch && matchType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For Income: use category as title if title is blank
    const finalTitle = formData.type === 'Income' && !formData.title
      ? formData.category
      : formData.title;
    const finalCategory = formData.category === 'Other' ? (otherLabel || 'Other') : formData.category;

    console.log('Final Submission Object:', {
      ...formData,
      category: finalCategory,
      amount: Number(formData.amount),
    });

    await addTransaction({
      ...formData,
      title: finalTitle,
      category: finalCategory,
      amount: Number(formData.amount),
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      date: new Date().toLocaleDateString('en-CA'), 
      amount: '', 
      category: 'Groceries', 
      type: 'Expense',
      paymentMethod: 'UPI',
      status: 'Success'
    });
    setOtherLabel('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-foreground tracking-tighter italic">Transactions</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Monitor and manage your financial records</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search history..." 
              className="h-12 w-full bg-card border border-border/50 rounded-2xl pl-12 text-sm focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {role === 'Admin' && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger>
                <Button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground font-black text-sm gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0">
                  <Plus className="h-4 w-4" /> Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] bg-card border border-border p-8 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground font-black text-2xl tracking-tight">New Transaction</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Title {formData.type === 'Income' && <span className="normal-case tracking-normal font-normal opacity-60">(optional)</span>}
                    </Label>
                    <Input 
                      id="title" 
                      placeholder={formData.type === 'Income' ? 'Leave blank to use category' : 'e.g., Grocery Shopping'}
                      required={formData.type !== 'Income'}
                      className="h-12 bg-background border border-border rounded-xl"
                      value={formData.title}
                      onChange={e => setFormData(p => ({...p, title: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        required 
                        className="h-12 bg-background border border-border rounded-xl"
                        value={formData.date}
                        onChange={e => setFormData(p => ({...p, date: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Amount ({currency})</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        placeholder="0.00" 
                        required 
                        className="h-12 bg-background border border-border rounded-xl"
                        value={formData.amount}
                        onChange={e => setFormData(p => ({...p, amount: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Type</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(val) => setFormData(p => ({...p, type: val as TransactionType}))}
                      >
                        <SelectTrigger className="h-12 bg-background border border-border rounded-xl">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Expense">Expense</SelectItem>
                          <SelectItem value="Income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(val) => setFormData(p => ({...p, category: val || 'Other'}))}
                      >
                        <SelectTrigger className="h-12 bg-background border border-border rounded-xl">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {formData.type === 'Expense' ? (
                            <>
                              <SelectItem value="Groceries">Groceries</SelectItem>
                              <SelectItem value="Utilities">Utilities</SelectItem>
                              <SelectItem value="Rent">Rent</SelectItem>
                              <SelectItem value="EMI">EMI</SelectItem>
                              <SelectItem value="Investments">Investments</SelectItem>
                              <SelectItem value="Traveling">Traveling</SelectItem>
                              <SelectItem value="Savings">Savings</SelectItem>
                              <SelectItem value="Entertainment">Entertainment</SelectItem>
                              <SelectItem value="clothing">Clothing</SelectItem>
                              <SelectItem value="credit card">Credit Card</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Salary">Salary</SelectItem>
                              <SelectItem value="Freelance">Freelance</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Investment Returns">Investment Returns</SelectItem>
                              <SelectItem value="Rental Income">Rental Income</SelectItem>
                              <SelectItem value="Bonus">Bonus</SelectItem>
                              <SelectItem value="Gift">Gift</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="method" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payment Method</Label>
                      <Select 
                        value={formData.paymentMethod} 
                        onValueChange={(val) => setFormData(p => ({...p, paymentMethod: val as any}))}
                      >
                        <SelectTrigger className="h-12 bg-background border border-border rounded-xl">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="UPI">UPI Sync</SelectItem>
                          <SelectItem value="Card">Credit/Debit Card</SelectItem>
                          <SelectItem value="Cash">Physical Cash</SelectItem>
                          <SelectItem value="Net Banking">Net Banking</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(val) => setFormData(p => ({...p, status: val as any}))}
                      >
                        <SelectTrigger className="h-12 bg-background border border-border rounded-xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Success">Success</SelectItem>
                          <SelectItem value="Waiting">Waiting</SelectItem>
                          <SelectItem value="Declined">Declined</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.category === 'Other' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="other-label" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custom Category</Label>
                      <Input 
                        id="other-label" 
                        placeholder="Specify category..." 
                        required 
                        className="h-12 bg-background border border-border rounded-xl"
                        value={otherLabel}
                        onChange={e => setOtherLabel(e.target.value)}
                      />
                    </div>
                  )}
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black shadow-xl shadow-primary/20">Save Transaction</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
         {['All', 'Income', 'Expense'].map((type) => (
           <Button 
             key={type}
             onClick={() => setFilterType(type as any)}
             variant="ghost"
             className={cn(
               "rounded-full px-6 h-10 text-xs font-black uppercase tracking-widest transition-all fluid-hover",
               filterType === type 
                 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                 : "bg-card text-muted-foreground border border-border/50 hover:text-foreground card-shadow-sm"
             )}
           >
             {type}
           </Button>
         ))}
      </div>

      {/* Transactions List */}
      <Card className="bg-card border border-border/40 rounded-[2.5rem] card-shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[600px] p-8 space-y-4">
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                <div className="col-span-6">Type &amp; Description</div>
                <div className="col-span-4 text-right">Amount</div>
                <div className="col-span-2 text-center">Action</div>
              </div>

              <div className="relative">
               {loading && transactions.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading history...</p>
                 </div>
               ) : filteredTransactions.length === 0 ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                    <Receipt className="h-16 w-16 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No records found</p>
                 </div>
               ) : (
                 <motion.div 
                    layout
                    className="space-y-4"
                 >
                    <AnimatePresence mode="popLayout">
                      {filteredTransactions.map((tx) => {
                        return (
                          <motion.div
                            key={tx.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-12 gap-4 py-4 border-b border-border/30 group hover:bg-muted/30 transition-all rounded-[1.5rem] px-2 items-center fluid-hover"
                          >
                            {/* Type & Description Column */}
                            <div className="col-span-6 flex items-center gap-4">
                               <div className={cn(
                                 "h-14 w-14 rounded-[1.25rem] flex items-center justify-center shrink-0 border border-border transition-transform group-hover:scale-110 shadow-sm",
                                 tx.type === 'Income' ? "bg-emerald-500/10 text-emerald-500" : "bg-background text-muted-foreground"
                               )}>
                                 {tx.type === 'Income' ? <ArrowUpRight className="h-7 w-7" /> : <Receipt className="h-7 w-7" />}
                               </div>
                               <div>
                                 <h4 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">{tx.title}</h4>
                                 <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                    {tx.type} • {new Date(tx.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </p>
                               </div>
                            </div>
                            
                            {/* Amount Column */}
                            <div className="col-span-4 text-right">
                               <span className={cn("font-black text-lg tracking-tighter block whitespace-nowrap", tx.type === 'Income' ? "text-emerald-500" : "text-foreground")}>
                                  {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                               </span>
                               <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1 block whitespace-nowrap">
                                  {getSecondaryAmount(tx.amount)} EUR
                               </span>
                            </div>

                            {/* Action Column */}
                            <div className="col-span-2 flex justify-center">
                              {role === 'Admin' ? (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-90 transition-all"
                                  onClick={() => deleteTransaction(tx.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white sm:opacity-0 group-hover:opacity-100 transition-all">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                 </motion.div>
               )}
              </div>
            </div>
          </div>
      </Card>
    </div>
  );
}
