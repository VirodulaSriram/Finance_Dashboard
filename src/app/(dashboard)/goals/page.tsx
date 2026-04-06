'use client';

import React, { useEffect, useState } from 'react';
import { 
  Target, 
  Plus, 
  Trophy, 
  ArrowUpRight, 
  Calendar,
  Zap,
  Loader2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

const COLORS = [
  { name: 'Blue-Indigo', class: 'from-blue-500 to-indigo-600' },
  { name: 'Emerald-Teal', class: 'from-emerald-500 to-teal-600' },
  { name: 'Purple-Pink', class: 'from-purple-500 to-pink-600' },
  { name: 'Orange-Red', class: 'from-orange-500 to-rose-600' },
];

export default function GoalsPage() {
  const { user } = useAuthStore();
  const { goals, fetchGoals, addGoal, updateGoal, resetGoals, loading } = useFinanceStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBoostOpen, setIsBoostOpen] = useState(false);
  const [savingAmounts, setSavingAmounts] = useState<Record<string, string>>({});
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ 
    title: '', 
    target: '', 
    deadline: '', 
    priority: 'Medium' as any, 
    color: 'from-blue-500 to-indigo-600' 
  });
  const currency = user?.currencyCode || 'USD';

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) return;

    await addGoal({
      title: newGoal.title,
      target: Number(newGoal.target),
      current: 0,
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      color: newGoal.color
    });

    setIsAddOpen(false);
    setNewGoal({ 
      title: '', 
      target: '', 
      deadline: '', 
      priority: 'Medium', 
      color: 'from-blue-500 to-indigo-600' 
    });
  };

  const handleAddSaving = async (goalId: string, currentAmount: number) => {
    const amountToAdd = Number(savingAmounts[goalId]);
    if (!amountToAdd || amountToAdd <= 0) return;

    setIsUpdating(goalId);
    try {
      await updateGoal(goalId, { current: currentAmount + amountToAdd });
      setSavingAmounts(prev => ({ ...prev, [goalId]: '' }));
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Financial Goals</h2>
          <p className="text-muted-foreground">
            Set and track milestones for your future.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 h-11 px-6 text-destructive hover:bg-destructive/5"
            onClick={resetGoals}
            disabled={goals.length === 0}
          >
            <Trash2 className="h-4 w-4" />
            Reset All
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button className="shrink-0 gap-2 h-11 px-6 bg-primary shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-5 w-5" />
                Add New Goal
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>
                  Define a new financial target to track your progress.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGoal} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. New Car, House Downpayment"
                    className="h-11"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Amount ({currency})</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="0.00"
                      className="h-11"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      className="h-11"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newGoal.priority} 
                    onValueChange={(v) => setNewGoal({ ...newGoal, priority: v as any })}
                  >
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <div className="flex gap-2 pt-1">
                    {COLORS.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={cn(
                          "h-10 w-10 rounded-xl bg-gradient-to-br ring-offset-2 transition-all",
                          color.class,
                          newGoal.color === color.class ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                        )}
                        onClick={() => setNewGoal({ ...newGoal, color: color.class })}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter className="pt-4 px-0">
                  <Button type="submit" className="w-full h-11">Add Goal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-muted/20 border border-dashed rounded-3xl">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
          <p className="text-muted-foreground font-medium">Loading your goals...</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 bg-primary/5 border border-dashed border-primary/20 rounded-3xl">
          <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
            <Target className="h-8 w-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold">No goals yet</h3>
            <p className="text-muted-foreground max-w-xs px-4">
              Break down your dreams into tracked financial goals.
            </p>
          </div>
          <Button 
            className="mt-2" 
            variant="outline" 
            onClick={() => setIsAddOpen(true)}
          >
            Start Dreaming
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence>
            {goals.map((goal, index) => {
              const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
              const isAchieved = goal.current >= goal.target;

              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden border-none ring-1 ring-border shadow-md hover:shadow-xl transition-all duration-300 group">
                    <CardHeader className="flex flex-row items-center gap-6 pb-4">
                      <div className={`h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-gradient-to-br ${goal.color} flex items-center justify-center shadow-lg shadow-primary/10 transition-transform group-hover:scale-105`}>
                        {isAchieved ? (
                          <Trophy className="h-8 w-8 md:h-10 md:w-10 text-white animate-bounce" />
                        ) : (
                          <Target className="h-8 w-8 md:h-10 md:w-10 text-white" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl md:text-2xl font-bold">{goal.title}</CardTitle>
                            {isAchieved && (
                               <span className="bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded-full ring-1 ring-emerald-500/30">
                                COMPLETED
                              </span>
                            )}
                            <Badge variant="outline" className="text-[10px] ml-1 uppercase py-0 px-2 h-5 flex items-center group-hover:border-primary transition-colors">
                              {goal.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                            <Calendar className="h-3 w-3" />
                            {isAchieved ? 'Achieved!' : `Due: ${new Date(goal.deadline).toLocaleDateString()}`}
                          </div>
                        </div>
                        <CardDescription className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
                          <div className="flex items-center gap-4 text-foreground">
                            <span className="text-2xl font-black">{formatCurrency(goal.current)}</span>
                            <span className="text-muted-foreground font-medium">of</span>
                            <span className="text-lg font-bold opacity-60">{formatCurrency(goal.target)}</span>
                          </div>
                          
                          {!isAchieved && (
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">{currency}</span>
                                <Input 
                                  type="number" 
                                  placeholder="0.00" 
                                  className="h-9 w-24 pl-8 text-xs font-bold bg-white/5 border-white/10 rounded-xl"
                                  value={savingAmounts[goal.id] || ''}
                                  onChange={(e) => setSavingAmounts({...savingAmounts, [goal.id]: e.target.value})}
                                />
                              </div>
                              <Button 
                                size="sm" 
                                className="h-9 w-9 p-0 rounded-xl bg-primary shadow-lg shadow-primary/20"
                                onClick={() => handleAddSaving(goal.id, goal.current)}
                                disabled={isUpdating === goal.id || !savingAmounts[goal.id]}
                              >
                                {isUpdating === goal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                              </Button>
                            </div>
                          )}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative h-4 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`h-full bg-gradient-to-r ${goal.color} rounded-full relative`}
                        />
                        {isAchieved && (
                          <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {isAchieved ? (
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          )}
                          {percentage}% Achieved
                        </span>
                        <span className="opacity-60 uppercase tracking-tighter">
                          {formatCurrency(Math.max(0, goal.target - goal.current))} Remaining
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      {/* Motivational Toast-like Card */}
      {goals.length > 0 && (
        <Card className="border-none bg-zinc-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Trophy className="h-40 w-40" />
          </div>
          <CardContent className="p-4 flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3 justify-center md:justify-start ring-offset-2">
                <span className="text-amber-400">Achieve faster.</span> Dream bigger.
              </h3>
              <p className="text-zinc-400 font-medium text-md max-w-lg leading-relaxed">
                Stay consistent! Users who track their goals are 40% more likely to achieve them within their deadline.
              </p>
            </div>
            <Button
              className="bg-white text-black font-black px-10 h-14 rounded-2xl hover:bg-zinc-200 transition-colors shadow-xl shrink-0"
              onClick={() => setIsBoostOpen(true)}
            >
              Boost Savings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Boost Savings Dialog - always mounted so it can open from button click */}
      <Dialog open={isBoostOpen} onOpenChange={setIsBoostOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Income</DialogTitle>
            <DialogDescription>Record an income to boost your savings progress.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target as HTMLFormElement);
              const { useFinanceStore: fs } = await import('@/lib/store/useFinanceStore');
              await fs.getState().addTransaction({
                title: (fd.get('category') as string) || 'Income',
                date: fd.get('date') as string,
                amount: Number(fd.get('amount')),
                category: fd.get('category') as string,
                type: 'Income',
                paymentMethod: 'Other',
                status: 'Success',
              });
              setIsBoostOpen(false);
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="boost-category">Category</Label>
              <Select name="category" defaultValue="Salary">
                <SelectTrigger id="boost-category" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Salary">Salary</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Investment Returns">Investment Returns</SelectItem>
                  <SelectItem value="Rental Income">Rental Income</SelectItem>
                  <SelectItem value="Bonus">Bonus</SelectItem>
                  <SelectItem value="Gift">Gift</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boost-amount">Amount</Label>
                <Input id="boost-amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boost-date">Date</Label>
                <Input id="boost-date" name="date" type="date" defaultValue={new Date().toLocaleDateString('en-CA')} required className="h-11" />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full h-11">Add Income</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
      {children}
    </span>
  );
}
