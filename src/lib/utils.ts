import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getSupabaseClient } from './supabase/client';

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
// Generate quote number (database-aware sequential)
// ============================================

/**
 * Generate next sequential quote number
 * Format: PPL/YYYY/NNN
 * Example: PPL/2024/001, PPL/2024/002, etc.
 * 
 * @param prefix - Quote number prefix (default: 'PPL')
 * @returns Promise<string> - Generated quote number
 */
export async function generateQuoteNumber(prefix = 'PPL'): Promise<string> {
  const supabase = getSupabaseClient();
  const currentYear = new Date().getFullYear();
  const yearPrefix = `${prefix}/${currentYear}/`;

  try {
    // Get the highest quote number for current year
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .like('quote_number', `${yearPrefix}%`)
      .order('quote_number', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching last quote number:', error);
      // Fallback to timestamp-based
      return `${yearPrefix}${Date.now().toString().slice(-6)}`;
    }

    let nextNumber = 1;

    if (data && data.length > 0) {
      // Extract the sequence number from the last quote
      const lastQuoteNumber = data[0].quote_number;
      const match = lastQuoteNumber.match(/\/(\d+)$/);
      
      if (match) {
        const lastSequence = parseInt(match[1], 10);
        nextNumber = lastSequence + 1;
      }
    }

    // Format with leading zeros (3 digits)
    const sequence = nextNumber.toString().padStart(3, '0');
    
    return `${yearPrefix}${sequence}`;
  } catch (error) {
    console.error('Error generating quote number:', error);
    // Fallback to timestamp-based
    const timestamp = Date.now().toString().slice(-6);
    return `${yearPrefix}${timestamp}`;
  }
}

/**
 * Validate if quote number already exists
 * 
 * @param quoteNumber - Quote number to validate
 * @returns Promise<boolean> - True if unique, false if exists
 */
export async function isQuoteNumberUnique(quoteNumber: string): Promise<boolean> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('id')
      .eq('quote_number', quoteNumber)
      .limit(1);

    if (error) {
      console.error('Error checking quote number:', error);
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error('Error validating quote number:', error);
    return false;
  }
}

/**
 * Generate unique quote number with retry logic
 * Ensures the generated quote number doesn't already exist
 * 
 * @param prefix - Quote number prefix (default: 'PPL')
 * @param maxRetries - Maximum number of retry attempts (default: 5)
 * @returns Promise<string> - Unique quote number
 */
export async function generateUniqueQuoteNumber(prefix = 'PPL', maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const quoteNumber = await generateQuoteNumber(prefix);
    const isUnique = await isQuoteNumberUnique(quoteNumber);
    
    if (isUnique) {
      return quoteNumber;
    }

    // If not unique, wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Last resort: use timestamp
  const currentYear = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}/${currentYear}/${timestamp}`;
}

// ============================================
// Safe number helper
// ============================================

export function toNumber(value: any, fallback = 0): number {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}
