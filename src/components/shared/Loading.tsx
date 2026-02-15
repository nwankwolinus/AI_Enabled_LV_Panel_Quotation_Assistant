// ============================================
// LOADING COMPONENT
// File: src/components/shared/Loading.tsx
// ============================================

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-ppl-navy', sizeClasses[size])} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
}

/**
 * Full Page Loading
 */
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading size="lg" text={text} />
    </div>
  );
}

/**
 * Inline Loading (for buttons)
 */
export function InlineLoading() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}
