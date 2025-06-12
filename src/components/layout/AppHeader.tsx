
"use client";
import type { FC } from 'react';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
import { useRouter }
from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
  const [userName, setUserName] = React.useState<string | null>(null);
  const [userEmail, setUserEmail] = React.useState<string | null>(null);

  const getUserInitials = React.useCallback(() => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (userEmail) {
      return userEmail[0].toUpperCase();
    }
    return 'U';
  }, [userName, userEmail]);

  React.useEffect(() => {
    const handleProfileUpdate = () => {
      setUserName(localStorage.getItem('financeUserName'));
      setUserEmail(localStorage.getItem('financeUserEmail'));
    };

    // Initial load
    handleProfileUpdate();

    // Listen for custom event
    window.addEventListener('financeProfileUpdated', handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener('financeProfileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('financeUserToken');
    localStorage.removeItem('financeUserEmail');
    localStorage.removeItem('financeUserName');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/login');
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar trigger" data-ai-hint="user avatar" />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount> {/* Increased width for avatar */}
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-3"> {/* Use flex row and gap for avatar and text */}
              <Avatar className="h-10 w-10"> {/* Avatar inside the dropdown */}
                <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar menu" data-ai-hint="user avatar small" />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail || "user@example.com"}
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
    </header>
  );
};

