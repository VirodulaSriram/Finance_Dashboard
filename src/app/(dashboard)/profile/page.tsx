'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  User as UserIcon, 
  Camera, 
  Save, 
  Phone, 
  Mail, 
  User,
  Shield,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit
        return setMessage({ type: 'danger', text: 'Image size too large (max 500KB)' });
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Corrected URL for Next.js API
      const response = await axios.put(`/api/users/${user?.id}`, formData);
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'danger', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Account Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and account security.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-none shadow-lg h-fit bg-gradient-to-b from-primary/[0.03] to-background ring-1 ring-border">
          <CardHeader className="flex flex-col items-center justify-center pt-8 pb-6 text-center">
            <div className="relative group cursor-pointer">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/20 transition-all group-hover:ring-primary/40">
                <AvatarImage src={formData.avatar} className="object-cover" />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg cursor-pointer transform transition-transform hover:scale-110 active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
            <CardTitle className="mt-4 text-xl tracking-tight">{user?.username}</CardTitle>
            <CardDescription className="flex items-center gap-2 justify-center mt-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold tracking-wider">
                {user?.role?.toUpperCase()}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <Separator />
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary/60" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary/60" />
                <span>{user?.country || 'Earth'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary/60" />
                <span>Basic Account</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="md:col-span-2 border-none shadow-lg ring-1 ring-border overflow-hidden">
          <CardHeader className="bg-muted/[0.08] border-b">
            <CardTitle className="text-lg font-bold">Personal Details</CardTitle>
            <CardDescription>Update your public profile and contact info.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="p-8 space-y-6">
              {message.text && (
                <div className={cn(
                  "flex items-center gap-3 p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2",
                  message.type === 'success' 
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                )}>
                  {message.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {message.text}
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="username" 
                      className="pl-10 h-11 border-none bg-muted/30 focus-visible:ring-primary/40 focus-visible:bg-background transition-all"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Email Address</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="email" 
                      type="email"
                      className="pl-10 h-11 border-none bg-muted/30 focus-visible:ring-primary/40 focus-visible:bg-background transition-all"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Phone Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors" />
                    <Input 
                      id="phone" 
                      type="tel"
                      placeholder="+1 234 567 890"
                      className="pl-10 h-11 border-none bg-muted/30 focus-visible:ring-primary/40 focus-visible:bg-background transition-all"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2 opacity-70">
                  <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Primary Location</Label>
                  <Input 
                    disabled 
                    className="h-11 bg-muted/50 border-none italic cursor-not-allowed" 
                    value={user?.country || 'Fixed at registration'} 
                  />
                </div>
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="p-8 justify-end bg-muted/[0.03]">
              <Button 
                type="submit" 
                className="w-full sm:w-auto h-11 px-8 font-bold gap-2 shadow-xl shadow-primary/20"
                disabled={loading}
              >
                {loading ? 'Processing...' : <><Save className="h-4 w-4" /> Save Changes</>}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
