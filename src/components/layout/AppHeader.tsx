
"use client";
import type { FC } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Landmark, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged, type User } from 'firebase/auth';

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith('/dashboard')) return 'Dashboard';
  if (pathname.startsWith('/add-transaction')) return 'Add Transaction';
  if (pathname.startsWith('/transactions')) return 'Transaction History';
  if (pathname.startsWith('/reports')) return 'Reports & Analytics';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Vishnu Finance Tracker';
};

export const AppHeader: FC = () => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { toggleSidebar, isMobile } = useSidebar();
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);
  
  // Listen for custom event from settings page to update display name if changed
  useEffect(() => {
    const handleProfileUpdate = () => {
      if (auth.currentUser) {
        // Force re-render by creating a new user object reference
        setCurrentUser({...auth.currentUser});
      }
    };
    window.addEventListener('financeProfileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('financeProfileUpdated', handleProfileUpdate);
    };
  }, []);


  const getUserInitials = useCallback(() => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (currentUser?.email) {
      return currentUser.email[0].toUpperCase();
    }
    return 'U';
  }, [currentUser]);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };
  
  const navigateToSettings = () => {
    router.push('/settings');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      {isMobile && (
        <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      )}
      <div className="flex-1">
        {isMobile ? (
          <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:no-underline">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Landmark size={20} />
            </div>
            <span className="text-lg font-semibold font-headline">
              Vishnu Finance
            </span>
          </Link>
        ) : (
          <h1 className="text-xl font-semibold font-headline">{pageTitle}</h1>
        )}
      </div>
      {currentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9">
                {/* Firebase user objects don't typically have photoURL by default unless set */}
                <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User avatar"} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User avatar menu"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.displayName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={navigateToSettings}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={navigateToSettings}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
};
