'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Users,
  Activity,
  Crown,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Viewer';
  country?: string;
  currencyCode: string;
  views: number;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'Admin') router.push('/');
  }, [user, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/users', { headers: { 'user-id': user?.id } });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) fetchUsers(); }, [user?.id]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/users?id=${confirmDelete._id}`, { headers: { 'user-id': user?.id } });
      setUsers(prev => prev.filter(u => u._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleRole = async (targetUser: AdminUser) => {
    setUpdatingRole(targetUser._id);
    const newRole = targetUser.role === 'Admin' ? 'Viewer' : 'Admin';
    try {
      await axios.patch(`/api/admin/users?id=${targetUser._id}`, { role: newRole }, { headers: { 'user-id': user?.id } });
      setUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const totalAdmins = users.filter(u => u.role === 'Admin').length;
  const totalViewers = users.filter(u => u.role === 'Viewer').length;

  if (user?.role !== 'Admin') return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/20 rounded-2xl flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-4xl font-black text-foreground tracking-tighter italic">Admin Console</h2>
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage users, roles and platform access</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          className="gap-2 h-11 px-6 bg-background border border-border hover:bg-muted text-foreground rounded-2xl transition-all"
          disabled={loading}
        >
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary bg-primary/10' },
          { label: 'Admins', value: totalAdmins, icon: Crown, color: 'text-amber-400 bg-amber-400/10' },
          { label: 'Viewers', value: totalViewers, icon: Eye, color: 'text-blue-400 bg-blue-400/10' },
          { label: 'Total Views', value: users.reduce((acc, u) => acc + (u.views || 0), 0), icon: Activity, color: 'text-emerald-400 bg-emerald-400/10' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border border-border/40 rounded-3xl p-6 card-shadow-md fluid-hover group">
            <CardContent className="p-0 flex items-center gap-4">
              <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110', stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Table */}
      <Card className="bg-card border border-border/40 rounded-[2.5rem] card-shadow-md overflow-hidden">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-foreground font-black text-xl">Registered Users</CardTitle>
          <CardDescription>Manage roles and access for all platform users.</CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <div className="min-w-[700px] px-8 pb-8">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-center">Role</div>
              <div className="col-span-1 text-center">Views</div>
              <div className="col-span-1 text-center">Currency</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading users...</p>
              </div>
            ) : (
              <AnimatePresence>
                {users.map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-12 gap-4 py-4 border-b border-border/30 last:border-0 items-center group hover:bg-muted/30 rounded-2xl px-2 transition-all fluid-hover"
                  >
                    {/* Name */}
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-sm shrink-0 shadow-sm">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-foreground leading-tight truncate">{u.username}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3 text-xs text-muted-foreground truncate">{u.email}</div>

                    {/* Role Badge */}
                    <div className="col-span-2 flex justify-center">
                      <span className={cn(
                        'text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full',
                        u.role === 'Admin'
                          ? 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20'
                          : 'bg-blue-400/10 text-blue-400 ring-1 ring-blue-400/20'
                      )}>
                        {u.role}
                      </span>
                    </div>

                    {/* Views */}
                    <div className="col-span-1 text-center text-xs font-bold text-emerald-400">{u.views || 0}</div>

                    {/* Currency */}
                    <div className="col-span-1 text-center text-xs font-bold text-muted-foreground">{u.currencyCode}</div>

                    {/* Actions */}
                    <div className="col-span-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={`Switch to ${u.role === 'Admin' ? 'Viewer' : 'Admin'}`}
                        disabled={updatingRole === u._id || u._id === user?.id}
                        onClick={() => handleToggleRole(u)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {u.role === 'Admin' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete user"
                        disabled={u._id === user?.id}
                        onClick={() => setConfirmDelete(u)}
                        className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="bg-card border-destructive/20 rounded-[2.5rem] p-8 max-w-md shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="h-16 w-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Delete User?</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                This will permanently delete <strong className="text-foreground">{confirmDelete?.username}</strong> and all their data. This cannot be undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="grid grid-cols-2 gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="h-12 rounded-2xl bg-background hover:bg-muted text-foreground font-bold border-border"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-12 rounded-2xl font-black shadow-lg shadow-rose-500/20"
            >
              {isDeleting ? 'Deleting...' : 'Delete Forever'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
