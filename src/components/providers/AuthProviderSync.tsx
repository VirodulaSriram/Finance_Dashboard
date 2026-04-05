'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { User } from '@/lib/types';

export function AuthProviderSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { setAuth, logout, user: currentUser } = useAuthStore();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // If signed in via NextAuth but not in Zustand store, or user changed
      const newUser: User = {
        id: session.user.id || session.user.email || 'unknown',
        username: session.user.name || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: 'Viewer', // Default role matching types.ts
        country: 'India', // Default
        currencyCode: 'INR', // Default
        avatar: session.user.image || undefined,
      };

      if (!currentUser || currentUser.email !== newUser.email) {
        setAuth(newUser, 'next-auth-managed-session');
      }
    } else if (status === 'unauthenticated' && currentUser && currentUser.id === 'unknown') {
        // Only logout if it was a next-auth session (this is a bit simplified)
        // In a real app, you'd want to distinguish between credentials and oauth sessions better
    }
  }, [session, status, setAuth, currentUser]);

  return <>{children}</>;
}
