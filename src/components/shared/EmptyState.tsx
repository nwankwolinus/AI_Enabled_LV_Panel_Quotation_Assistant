// ============================================
// EMPTY STATE COMPONENT
// File: src/components/shared/EmptyState.tsx
// ============================================

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="p-12">
      <div className="text-center">
        {Icon && (
          <Icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        )}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mb-6">{description}</p>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </div>
    </Card>
  );
}
