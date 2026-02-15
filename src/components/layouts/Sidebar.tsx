// ============================================
// SIDEBAR COMPONENT
// File: src/components/layouts/Sidebar.tsx
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileText,
  Package,
  Users,
  Settings,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const menuItems = [
  {
    icon: BarChart3,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: FileText,
    label: 'Quotations',
    href: '/dashboard/quotations',
  },
  {
    icon: Package,
    label: 'Components',
    href: '/dashboard/components',
  },
  {
    icon: Users,
    label: 'Clients',
    href: '/dashboard/clients',
  },
  {
    icon: Lightbulb,
    label: 'AI Insights',
    href: '/dashboard/ai-insights',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/dashboard/settings',
  },
];

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-ppl-navy text-white transition-all duration-300 z-40',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-ppl-navy-700 px-4">
        {!isCollapsed && (
          <h1 className="text-xl font-bold">Power Projects</h1>
        )}
        {isCollapsed && (
          <span className="text-2xl font-bold">PP</span>
        )}
      </div>

      {/* Menu Items */}
      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors',
                'hover:bg-ppl-navy-700',
                isActive && 'bg-ppl-navy-700 border-l-4 border-ppl-gold',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute bottom-6 right-4 p-2 rounded-lg bg-ppl-navy-700 hover:bg-ppl-navy-600 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}
    </aside>
  );
}
