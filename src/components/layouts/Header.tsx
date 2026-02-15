// ============================================
// HEADER COMPONENT
// File: src/components/layouts/Header.tsx
// ============================================

'use client';

import { User } from '@/types/user.types';
import { Button } from '@/components/ui/button';
import { Bell, LogOut, User as UserIcon } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface HeaderProps {
  user: User | null;
  onLogout?: () => void;
}


export default function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Search or breadcrumbs can go here */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          {/* Dynamic page title */}
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-ppl-navy text-white flex items-center justify-center font-medium">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(user.full_name)}</span>
              )}
            </div>

            {/* Logout */}
            {onLogout && (
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
