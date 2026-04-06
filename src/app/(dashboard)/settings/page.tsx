'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useFinanceStore } from '@/lib/store/useFinanceStore';
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  Palette,
  ShieldCheck,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'regional', label: 'Regional', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, color: 'bg-white border-slate-200' },
    { id: 'dark', label: 'Dark', icon: Moon, color: 'bg-slate-900 border-slate-800' },
    { id: 'system', label: 'System', icon: Laptop, color: 'bg-gradient-to-br from-white to-slate-900 border-slate-300' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex flex-col gap-3 group relative transition-all ${
            theme === t.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
          }`}
        >
          <div className={`w-full aspect-[4/3] rounded-2xl border-2 transition-all p-3 flex flex-col gap-2 overflow-hidden ${
            t.color
          } ${
            theme === t.id ? 'ring-2 ring-primary ring-offset-2 border-primary/50' : 'border-transparent'
          }`}>
            <t.icon className={`h-5 w-5 ${t.id === 'light' ? 'text-orange-500' : t.id === 'dark' ? 'text-primary' : 'text-slate-400'}`} />
            <div className="flex flex-col gap-1.5 mt-auto">
              <div className={`h-1.5 w-full rounded-full ${t.id === 'light' ? 'bg-slate-100' : 'bg-slate-800/50'}`} />
              <div className={`h-1.5 w-2/3 rounded-full ${t.id === 'light' ? 'bg-slate-100' : 'bg-slate-800/50'}`} />
            </div>
            {theme === t.id && (
              <motion.div 
                layoutId="active-theme" 
                className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <Check className="h-3 w-3 stroke-[3]" />
              </motion.div>
            )}
          </div>
          <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${
            theme === t.id ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  );
};

const ColorSelector = () => {
  const { accentColor, setAccentColor } = useAuthStore();
  
  const colors = [
    { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { id: 'blue', label: 'Ocean', class: 'bg-blue-500' },
    { id: 'emerald', label: 'Nature', class: 'bg-emerald-500' },
    { id: 'rose', label: 'Passion', class: 'bg-rose-500' },
    { id: 'amber', label: 'Sunlight', class: 'bg-amber-500' },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((c) => (
        <button
          key={c.id}
          onClick={() => setAccentColor(c.id)}
          className={cn(
            "group relative flex flex-col items-center gap-2 outline-none"
          )}
        >
          <div className={cn(
            "h-12 w-12 rounded-2xl transition-all duration-200 flex items-center justify-center border-4",
            c.class,
            accentColor === c.id ? "border-primary ring-2 ring-primary/20 ring-offset-2 scale-110" : "border-transparent hover:scale-105"
          )}>
            {accentColor === c.id && (
              <Check className="h-5 w-5 text-white stroke-[3px]" />
            )}
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-colors",
            accentColor === c.id ? "text-primary" : "text-muted-foreground"
          )}>
            {c.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default function SettingsPage() {
  const { user, logout, compactMode, setCompactMode, accentColor, setAccentColor } = useAuthStore();
  const { resetGoals, resetBudgets } = useFinanceStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetGoals();
      await resetBudgets();
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axios.delete('/api/user/delete-account', {
        headers: { 'user-id': user?.id }
      });
      logout();
      router.push('/register');
    } catch (err: any) {
      console.error('Failed to delete account', err);
      // Optional: Show error toast here
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and settings.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Side Nav */}
        <Card className="md:w-60 shrink-0 border-none ring-1 ring-border shadow-md h-fit">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  {section.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === 'profile' && (
              <Card className="border-none ring-1 ring-border shadow-md">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Full Name</Label>
                      <Input id="username" defaultValue={user?.username} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" defaultValue={user?.email} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" defaultValue={user?.phone || ''} placeholder="+1 (555) 000-0000" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Role</Label>
                      <Input disabled value={user?.role || 'Viewer'} className="h-11 opacity-60" />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="rounded-full px-8 h-11">
                    {saved ? <><ShieldCheck className="h-4 w-4 mr-2" /> Saved!</> : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'security' && (
              <Card className="border-none ring-1 ring-border shadow-md">
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Update your password to keep your account secure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" className="h-11" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" className="h-11" placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" className="h-11" placeholder="••••••••" />
                  </div>
                  <Button onClick={handleSave} className="rounded-full px-8 h-11 mt-2">
                    Update Password
                  </Button>

                  <div className="pt-8 mt-8 border-t border-rose-500/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-rose-500">Danger Zone</h4>
                        <p className="text-xs text-muted-foreground">Irreversible account actions</p>
                      </div>
                    </div>

                    {/* Reset Data */}
                    <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-4">
                      <div className="space-y-1">
                        <p className="font-bold text-sm">Reset Goals &amp; Budgets</p>
                        <p className="text-xs text-muted-foreground max-w-sm">Clears all your saved goals and budgets. Your transactions will not be affected.</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleResetData}
                        disabled={isResetting}
                        className="rounded-xl px-6 h-10 font-bold gap-2 text-rose-500 border-rose-500/30 hover:bg-rose-500/10 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isResetting ? 'Resetting...' : 'Reset Data'}
                      </Button>
                    </div>
                    <div className="bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="space-y-1">
                        <p className="font-bold text-sm">Delete Account</p>
                        <p className="text-xs text-muted-foreground max-w-sm">This will permanently remove your profile, transactions, budgets, and goals. This action cannot be undone.</p>
                      </div>
                      
                      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger render={
                          <Button variant="destructive" className="rounded-xl px-6 h-10 font-bold gap-2">
                            <Trash2 className="h-4 w-4" /> Delete Account
                          </Button>
                        } />
                        <DialogContent className="bg-[#161818] border-rose-500/20 rounded-[2.5rem] p-8 max-w-md">
                          <DialogHeader className="space-y-4">
                            <div className="h-16 w-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto">
                              <AlertTriangle className="h-8 w-8" />
                            </div>
                            <div className="space-y-2 text-center">
                              <DialogTitle className="text-2xl font-black text-white tracking-tight">Are you absolutely sure?</DialogTitle>
                              <DialogDescription className="text-muted-foreground font-medium">
                                This action is permanent. You will lose access to all your financial history, categories, and goals across all devices.
                              </DialogDescription>
                            </div>
                          </DialogHeader>
                          <DialogFooter className="grid grid-cols-2 gap-4 mt-8">
                            <Button 
                              variant="ghost" 
                              onClick={() => setIsDeleteDialogOpen(false)}
                              className="h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold"
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                              className="h-12 rounded-2xl font-black shadow-lg shadow-rose-500/20"
                            >
                              {isDeleting ? "Deleting..." : "Delete Forever"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === 'regional' && (
              <Card className="border-none ring-1 ring-border shadow-md">
                <CardHeader>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>Configure your country and currency preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input defaultValue={user?.country || ''} placeholder="Select your country" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input defaultValue={user?.currencyCode || 'USD'} className="h-11" />
                  </div>
                  <Button onClick={handleSave} className="rounded-full px-8 h-11">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === 'notifications' && (
              <Card className="border-none ring-1 ring-border shadow-md">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Choose what updates you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {['Budget alerts', 'Transaction updates', 'Goal milestones', 'Weekly summaries', 'Security alerts'].map((item) => (
                    <div key={item} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <span className="font-medium text-sm">{item}</span>
                      <button className="w-11 h-6 bg-primary rounded-full relative transition-all">
                        <span className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === 'appearance' && (
              <Card className="border-none ring-1 ring-border shadow-md">
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize how the dashboard looks and feels.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm">Theme Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Select your preferred interface appearance</p>
                    </div>
                    <ThemeSelector />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                      <p className="font-semibold text-sm">Accent Color</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Customize the primary brand color of your dashboard</p>
                    </div>
                    <ColorSelector />
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-t border-border/50">
                    <div>
                      <p className="font-semibold text-sm">Compact Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing for a denser layout</p>
                    </div>
                    <button 
                      onClick={() => setCompactMode(!compactMode)}
                      className={cn(
                        "w-11 h-6 rounded-full relative transition-all duration-200 outline-none",
                        compactMode ? "bg-primary" : "bg-secondary"
                      )}
                    >
                      <motion.span 
                        animate={{ x: compactMode ? 20 : 0 }}
                        initial={false}
                        className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm" 
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
