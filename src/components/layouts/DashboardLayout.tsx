// ============================================
// DASHBOARD LAYOUT - WITH COLLAPSIBLE SIDEBAR
// File: src/components/layouts/DashboardLayout.tsx
// ============================================

'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components';
import { useUIStore } from '@/store/useUIStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { loading } = useAuth();
  const { isSidebarCollapsed } = useUIStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {!isSidebarCollapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => useUIStore.getState().toggleSidebar()}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div
          className={`
            flex-1 flex flex-col overflow-hidden transition-all duration-300
            ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
          `}
        >
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
