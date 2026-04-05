'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  Palette,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { motion } from 'framer-motion';

const sections = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'regional', label: 'Regional', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-border/50">
                    <div>
                      <p className="font-semibold text-sm">Theme</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Toggle between dark and light mode</p>
                    </div>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-sm">Compact Mode</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Reduce spacing for a denser layout</p>
                    </div>
                    <button className="w-11 h-6 bg-secondary rounded-full relative transition-all">
                      <span className="absolute left-1 top-1 h-4 w-4 bg-muted-foreground/50 rounded-full shadow-sm" />
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
