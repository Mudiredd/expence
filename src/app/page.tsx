"use client";
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const HomePage: FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage is only available on the client side.
    // Ensure this runs after hydration.
    const token = localStorage.getItem('financeUserToken');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
    // setLoading(false); // Not strictly needed if redirecting immediately
  }, [router]);

  // Optional: Show a loading state while redirecting
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 p-8 rounded-lg shadow-xl bg-card">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  return null; 
};

export default HomePage;
