// ============================================
// HEADER COMPONENT - IMPROVED
// File: src/components/layouts/Header.tsx
// ============================================

'use client';

import { Button } from '@/components';
import { Bell, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const { userProfile, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      setLoading(true);
      try {
        await signOut();
        // signOut already handles redirect
      } catch (error) {
        console.error('Logout error:', error);
        alert('Failed to logout. Please try again.');
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
      <span className={`text-xs px-2 py-0.5 rounded font-medium ${roleConfig.className}`}>
        {roleConfig.label}
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Breadcrumbs or Search */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {userProfile?.full_name?.split(' ')[0] || 'User'}!
          </h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg transition-colors p-2"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-ppl-navy text-white flex items-center justify-center font-semibold">
                {userProfile?.full_name ? (
                  getInitials(userProfile.full_name)
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* User Info */}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900">
                  {userProfile?.full_name || userProfile?.email || 'User'}
                </span>
                <div className="flex items-center gap-2">
                  {getRoleBadge(userProfile?.role)}
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{userProfile?.email}</p>
                  {userProfile?.phone && (
                    <p className="text-xs text-gray-500 mt-1">{userProfile.phone}</p>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to settings
                      window.location.href = '/dashboard/settings';
                    }}
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    disabled={loading || authLoading}
                  >
                    <LogOut className="w-4 h-4" />
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}