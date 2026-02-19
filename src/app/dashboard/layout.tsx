// ============================================
// PROTECTED DASHBOARD LAYOUT - NEXT.JS 15
// File: src/app/dashboard/layout.tsx
// ============================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication on server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <AuthProvider>{children}</AuthProvider>;
}