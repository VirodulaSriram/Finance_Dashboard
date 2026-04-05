'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  MoreHorizontal, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Calendar,
  Receipt
} from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
  const { transactions, fetchTransactions, loading, addTransaction, deleteTransaction } = useFinanceStore();
  const { user } = useAuthStore();
  const role = user?.role || 'Viewer';
  const currency = user?.currencyCode || 'USD';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Groceries',
    type: 'Expense' as TransactionType
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
    const finalCategory = formData.category === 'Other' ? (otherLabel || 'Other') : formData.category;

    await addTransaction({
      ...formData,
      category: finalCategory,
      amount: Number(formData.amount),
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      title: '', 
      date: new Date().toISOString().split('T')[0], 
      amount: '', 
      category: 'Groceries', 
      type: 'Expense' 
    });
    setOtherLabel('');
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Monitor and manage your financial records.</p>
        </div>
        
        {role === 'Admin' && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger
              render={
                <Button className="gap-2 shadow-lg shadow-primary/20" />
              }
            >
              <Plus className="h-4 w-4" /> Add Transaction
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>New Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Grocery Shopping" 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      required 
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ({currency})</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      placeholder="0.00" 
                      required 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(val) => setFormData({...formData, type: val as TransactionType})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Expense">Expense</SelectItem>
                        <SelectItem value="Income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(val) => setFormData({...formData, category: val || 'Other'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
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
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="Salary">Salary</SelectItem>
                            <SelectItem value="Investment">Investment</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.category === 'Other' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="other-label">Custom Category</Label>
                    <Input 
                      id="other-label" 
                      placeholder="Specify category..." 
                      required 
                      value={otherLabel}
                      onChange={e => setOtherLabel(e.target.value)}
                    />
                  </div>
                )}
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full">Save Transaction</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search history..." 
                className="pl-9 bg-muted/50 border-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={filterType} 
                onValueChange={(val) => setFilterType(val as TransactionType | 'All')}
              >
                <SelectTrigger className="w-[140px] bg-muted/50 border-none h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Income">Income</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {role === 'Admin' && <TableHead className="w-[80px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={role === 'Admin' ? 6 : 5} className="h-32 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-muted-foreground">Loading history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={role === 'Admin' ? 6 : 5} className="h-32 text-center text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="group transition-colors">
                      <TableCell className="text-muted-foreground text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(tx.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">{tx.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal bg-muted/50 text-[10px] uppercase tracking-wider">
                          {tx.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.type === 'Income' ? (
                          <div className="flex items-center gap-1.5 text-emerald-500 font-medium text-xs">
                            <ArrowUpCircle className="h-3.5 w-3.5" /> Income
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-500 font-medium text-xs">
                            <ArrowDownCircle className="h-3.5 w-3.5" /> Expense
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-bold tabular-nums",
                        tx.type === 'Income' ? "text-emerald-600" : "text-foreground"
                      )}>
                        {tx.type === 'Income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </TableCell>
                      {role === 'Admin' && (
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                            onClick={() => deleteTransaction(tx.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
