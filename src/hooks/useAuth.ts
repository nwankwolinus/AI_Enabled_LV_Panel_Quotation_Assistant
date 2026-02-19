// ============================================
// AUTH HOOK - WITH USER PROFILE
// File: src/hooks/useAuth.ts
// ============================================

'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  return useAuthContext();
}

// Get user profile data (full_name, role, etc.)
export function useUserProfile() {
  const { userProfile, loading } = useAuth();
  return { userProfile, loading };
}

// Get auth user (from Supabase Auth)
export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

// Get session
export function useSession() {
  const { session, loading } = useAuth();
  return { session, loading };
}

// Check if user is authenticated
export function useRequireAuth() {
  const { user, userProfile, loading } = useAuth();
  
  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
  };
}