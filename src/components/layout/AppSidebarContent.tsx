
"use client";
import type { FC } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Landmark, LayoutDashboard, PlusCircle, List, BarChart3, LogOut, Settings, Target } from 'lucide-react';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/add-transaction', label: 'Add Transaction', icon: PlusCircle },
  { href: '/transactions', label: 'Transactions', icon: List },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/goals', label: 'Goals', icon: Target },
];

export const AppSidebarContent: FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { state, isMobile, setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      if (isMobile) setOpenMobile(false);
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: "Could not log out. Please try again.", variant: "destructive" });
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleLinkClick}>
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Landmark size={28} />
          </div>
          {state === 'expanded' && (
            <span className="text-xl font-semibold font-headline text-sidebar-foreground">
              Vishnu Finance
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} onClick={handleLinkClick}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.label, className: "font-body" }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border p-2">
         <SidebarMenu>
           <SidebarMenuItem>
             <Link href="/settings" onClick={handleLinkClick}>
               <SidebarMenuButton 
                  isActive={pathname.startsWith('/settings')}
                  tooltip={{ children: "Settings", className: "font-body" }}
                >
                  <Settings />
                  <span>Settings</span>
               </SidebarMenuButton>
             </Link>
           </SidebarMenuItem>
           <SidebarMenuItem>
             <SidebarMenuButton
                className="text-red-500 hover:bg-red-100 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300"
                onClick={handleLogout}
                tooltip={{ children: "Log Out", className: "font-body" }}
              >
               <LogOut />
               <span>Log Out</span>
             </SidebarMenuButton>
           </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );
};
