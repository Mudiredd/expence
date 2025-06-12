
"use client";
import type { FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [firebaseUser, setFirebaseUser] = useState<User | null | undefined>(undefined); // undefined means loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (firebaseUser === undefined) {
      // Still loading auth state
      return;
    }

    if (!firebaseUser) {
      // User is not logged in, redirect to login
      // Allow access to login, signup, forgot-password pages
      if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password') {
         router.replace('/login');
      }
    } else {
      // User is logged in
      // If user is on login/signup page, redirect to dashboard
      if (pathname === '/login' || pathname === '/signup') {
        router.replace('/dashboard');
      }
    }
  }, [firebaseUser, router, pathname]);


  // Show loading skeleton if auth state is still being determined AND on a protected route
  if (firebaseUser === undefined && pathname !== '/login' && pathname !== '/signup' && pathname !== '/forgot-password') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-6 p-10 rounded-lg shadow-2xl bg-card w-full max-w-md">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-12 w-1/2 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  // If user is not logged in and trying to access a protected page, AuthGuard will redirect.
  // Children are rendered if user is authenticated OR if the page is public (login, signup).
  // The redirect logic handles this. If no redirect happens, render children.
  if (firebaseUser && (pathname === '/login' || pathname === '/signup')) {
    // If logged in and on login/signup, show loading until redirect to dashboard happens
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-6 p-10 rounded-lg shadow-2xl bg-card w-full max-w-md">
            <Skeleton className="h-10 w-3/4 mx-auto" />
        </div>
      </div>
    );
  }


  return <>{children}</>;
};
