'use client'; // Added to mark as Client Component

import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebarContent } from '@/components/layout/AppSidebarContent';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TransactionProvider } from '@/contexts/TransactionContext';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner'; // Import the banner

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <TransactionProvider>
        <SidebarProvider> {/* Manages open/closed state, cookie for persistence */}          <Sidebar key="main-sidebar" collapsible="icon" className="border-r border-sidebar-border">
            <AppSidebarContent key="sidebar-content" />
            <SidebarRail key="sidebar-rail" />
          </Sidebar>
          <SidebarInset key="main-content-inset">
            <AppHeader key="app-header" />
            <EmailVerificationBanner key="email-banner" />
            <div key="content-div" className="p-4 sm:p-6 lg:p-8 bg-background flex-1 overflow-auto"> {/* Content padding and ensure it fills space */}
              <div className="w-full max-w-7xl mx-auto"> {/* Added max-width and centering */}
                {children}
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TransactionProvider>
    </AuthGuard>
  );
}
