
"use client";
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';


const HomePage: FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
      // setLoading(false); // Potentially not needed if redirect is quick
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);


  // Optional: Show a loading state while redirecting
  // This loading state is primarily for the initial check.
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
