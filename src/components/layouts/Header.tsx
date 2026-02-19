// ============================================
// HEADER COMPONENT - FIXED TYPES
// File: src/components/layouts/Header.tsx
// ============================================

'use client';

import { Button } from '@/components';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Header() {
  const { userProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      setLoading(true);
      try {
        await signOut();
      } catch (error) {
        console.error('Logout error:', error);
        setLoading(false);
      }
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role?: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      admin: { label: 'Admin', className: 'bg-red-100 text-red-800' },
      manager: { label: 'Manager', className: 'bg-blue-100 text-blue-800' },
      engineer: { label: 'Engineer', className: 'bg-green-100 text-green-800' },
      viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-800' },
    };

    const roleConfig = config[role || 'engineer'] || config.engineer;

    return (
      <span className={`text-xs px-2 py-0.5 rounded ${roleConfig.className}`}>
        {roleConfig.label}
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - can add breadcrumbs or search here */}
        <div className="flex-1">
          {/* Placeholder for breadcrumbs or search */}
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-ppl-navy text-white flex items-center justify-center font-semibold">
              {userProfile?.full_name ? (
                getInitials(userProfile.full_name)
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                {userProfile?.full_name || 'User'}
              </span>
              <div className="flex items-center gap-2">
                {getRoleBadge(userProfile?.role)}
              </div>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
              className="text-gray-600 hover:text-red-600 hover:bg-red-50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}