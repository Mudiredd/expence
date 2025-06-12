import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebarContent } from '@/components/layout/AppSidebarContent';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TransactionProvider } from '@/contexts/TransactionContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <TransactionProvider>
        <SidebarProvider> {/* Manages open/closed state, cookie for persistence */}
          <Sidebar collapsible="icon" className="border-r border-sidebar-border">
            <AppSidebarContent />
            <SidebarRail />
          </Sidebar>
          <SidebarInset>
            <AppHeader />
            <div className="p-4 sm:p-6 lg:p-8 bg-background flex-1 overflow-auto"> {/* Content padding and ensure it fills space */}
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </TransactionProvider>
    </AuthGuard>
  );
}
