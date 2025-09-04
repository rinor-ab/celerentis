'use client';

import { useEffect } from 'react';
import { TopNav } from './top-nav';
import { SideNav } from './side-nav';
import { CommandPalette } from './command-palette';
import { ProtectedRoute } from '../auth/protected-route';
import { useUIStore } from '@/lib/store';
import { enableMocking } from '@/lib/mocks';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    // Enable MSW in development
    enableMocking();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex">
        <SideNav />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          }`}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
