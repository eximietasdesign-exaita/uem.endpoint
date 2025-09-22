import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        {
          // Variants
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'danger',
          'bg-blue-100 text-blue-800': variant === 'info',
          // Sizes
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  online?: boolean;
  className?: string;
}

export function StatusBadge({ online, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant={online ? 'success' : 'danger'} 
      size="sm"
    >
      <div className={clsx(
        'w-2 h-2 rounded-full mr-1',
        online ? 'bg-green-400' : 'bg-red-400'
      )} />
      {online ? 'Online' : 'Offline'}
    </Badge>
  );
}