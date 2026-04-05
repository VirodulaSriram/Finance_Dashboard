'use client';

import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Plus, 
  TrendingDown, 
  Wallet, 
  AlertCircle,
  MoreVertical,
  Loader2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Housing',
  'Health',
  'Education',
  'Other'
];

const COLORS = [
  { name: 'Indigo', class: 'bg-indigo-500' },
  { name: 'Rose', class: 'bg-rose-500' },
  { name: 'Emerald', class: 'bg-emerald-500' },
  { name: 'Amber', class: 'bg-amber-500' },
  { name: 'Blue', class: 'bg-blue-500' },
  { name: 'Orange', class: 'bg-orange-500' },
  { name: 'Purple', class: 'bg-purple-500' },
];

export default function BudgetsPage() {
  const { user } = useAuthStore();
  const { budgets, fetchBudgets, addBudget, resetBudgets, loading } = useFinanceStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: '', total: '', color: 'bg-indigo-500' });
  const currency = user?.currencyCode || 'USD';

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category || !newBudget.total) return;
    
    await addBudget({
      category: newBudget.category,
      total: Number(newBudget.total),
      spent: 0,
      color: newBudget.color
    });
    
    setIsCreateOpen(false);
    setNewBudget({ category: '', total: '', color: 'bg-indigo-500' });
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Manage your monthly spending limits and stay on track.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 h-11 px-6 text-destructive hover:bg-destructive/5"
            onClick={resetBudgets}
            disabled={budgets.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Reset All
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger render={
              <Button className="shrink-0 gap-2 h-11 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-5 w-5" />
                Create Budget
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a monthly spending limit for a specific category.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateBudget} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newBudget.category} 
                    onValueChange={(v) => setNewBudget({ ...newBudget, category: v })}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Monthly Limit ({currency})</Label>
                  <Input
                    id="total"
                    type="number"
                    placeholder="0.00"
                    className="h-11"
                    value={newBudget.total}
                    onChange={(e) => setNewBudget({ ...newBudget, total: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={cn(
                          "h-8 w-8 rounded-full transition-all ring-offset-2",
                          color.class,
                          newBudget.color === color.class ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                        )}
                        onClick={() => setNewBudget({ ...newBudget, color: color.class })}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter className="pt-4 px-0">
                  <Button type="submit" className="w-full h-11">Create Budget</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-muted/20 border border-dashed rounded-3xl">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-muted-foreground font-medium">Loading your budgets...</p>
        </div>
      ) : budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-primary/5 border border-dashed border-primary/20 rounded-3xl">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Wallet className="h-8 w-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold">No budgets set</h3>
            <p className="text-muted-foreground max-w-xs px-4">
              Create your first budget to start tracking your monthly spending limits.
            </p>
          </div>
          <Button 
            className="mt-2" 
            variant="outline" 
            onClick={() => setIsCreateOpen(true)}
          >
            Get Started
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {budgets.map((budget, index) => {
              const percentage = Math.min((budget.spent / budget.total) * 100, 100);
              const isOver = budget.spent > budget.total;

              return (
                <motion.div
                  key={budget.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-none ring-1 ring-border shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold">{budget.category}</CardTitle>
                        <CardDescription className="text-xs uppercase tracking-wider font-semibold opacity-70">
                          Monthly Limit
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Limit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Reset Budget</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-baseline justify-between">
                        <div className="space-y-1">
                          <span className="text-2xl font-black">{formatCurrency(budget.spent)}</span>
                          <span className="text-muted-foreground text-sm font-medium ml-1">
                            of {formatCurrency(budget.total)}
                          </span>
                        </div>
                        {isOver && (
                          <div className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                            <AlertCircle className="h-3 w-3" />
                            OVER LIMIT
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : budget.color} relative`}
                          >
                            {!isOver && (
                              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
                            )}
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
                          <span>{Math.round(percentage)}% USED</span>
                          <span>{formatCurrency(Math.max(0, budget.total - budget.spent))} REMAINING</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      {/* Summary Footer */}
      {budgets.length > 0 && (
        <Card className="border-none bg-primary/5 ring-1 ring-primary/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <PieChart className="h-32 w-32" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingDown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">Smart Saving Tip</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  Setting budgets for "Shopping" and "Food" is the fastest way to save for your goals.
                </p>
              </div>
            </div>
            <Button variant="outline" className="rounded-full px-8 bg-background border-primary/20 hover:bg-primary/5 transition-colors">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
