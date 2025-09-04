'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: 'success' | 'warning' | 'error' | 'processing' | 'queued' | 'complete';
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle,
    label: 'Success',
    className: 'bg-success text-success-foreground border-success/20',
  },
  complete: {
    icon: CheckCircle,
    label: 'Complete',
    className: 'bg-success text-success-foreground border-success/20',
  },
  warning: {
    icon: AlertCircle,
    label: 'Warning',
    className: 'bg-warning text-warning-foreground border-warning/20',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    className: 'bg-error text-error-foreground border-error/20',
  },
  processing: {
    icon: Clock,
    label: 'Processing',
    className: 'bg-brand text-brand-foreground border-brand/20',
  },
  queued: {
    icon: Clock,
    label: 'Queued',
    className: 'bg-muted text-muted-foreground border-muted/20',
  },
};

export function StatusPill({ status, className }: StatusPillProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Badge
        variant="outline"
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium',
          config.className,
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    </motion.div>
  );
}
