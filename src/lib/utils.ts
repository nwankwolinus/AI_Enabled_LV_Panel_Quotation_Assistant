import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// Tailwind class merge helper
// ============================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================
// Format currency (₦ for Nigeria — fits your project)
// ============================================

export function formatCurrency(
  amount: number,
  currency: string = 'NGN'
): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// ============================================
// Format date
// ============================================

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '-';

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ============================================
// Get initials from full name
// ============================================

export function getInitials(name: string): string {
  if (!name) return 'U';

  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';

  return (
    (parts[0][0] || '') + (parts[parts.length - 1][0] || '')
  ).toUpperCase();
}

// ============================================
// Generate quote number (fallback helper)
// ============================================

export function generateQuoteNumber(prefix = 'PPL'): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);

  return `${prefix}-${yyyy}${mm}${dd}-${rand}`;
}

// ============================================
// Safe number helper
// ============================================

export function toNumber(value: any, fallback = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}
