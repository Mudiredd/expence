"use client";
import type { FC, ReactNode} from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('financeUserToken');
    if (!token) {
      router.replace('/login');
    } else {
      setIsVerified(true);
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
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

  if (!isVerified) {
    // This case should ideally be handled by the redirect,
    // but as a fallback, prevent rendering children.
    return null; 
  }

  return <>{children}</>;
};
