'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming' | 'error';
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep?: string;
  className?: string;
}

export function ProgressStepper({ steps, currentStep, className }: ProgressStepperProps) {
  const getStepIcon = (step: Step) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'current':
        return <Clock className="h-5 w-5 text-brand animate-pulse" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-error" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
    }
  };

  const getStepStatus = (step: Step, index: number) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'current') return 'current';
    if (step.status === 'error') return 'error';
    if (currentStep && steps.findIndex(s => s.id === currentStep) > index) return 'completed';
    if (currentStep && step.id === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    status === 'completed' && 'bg-success border-success text-success-foreground',
                    status === 'current' && 'bg-brand border-brand text-brand-foreground',
                    status === 'error' && 'bg-error border-error text-error-foreground',
                    status === 'upcoming' && 'bg-background border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {getStepIcon({ ...step, status })}
                </motion.div>
                
                <div className="mt-2 text-center">
                  <div className={cn(
                    'text-sm font-medium',
                    status === 'completed' && 'text-success',
                    status === 'current' && 'text-brand',
                    status === 'error' && 'text-error',
                    status === 'upcoming' && 'text-muted-foreground'
                  )}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-border relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: status === 'completed' ? '100%' : '0%' 
                      }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-success"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Predefined steps for IM generation
export const IM_GENERATION_STEPS: Step[] = [
  {
    id: 'queued',
    title: 'Queued',
    description: 'Job queued',
    status: 'upcoming',
  },
  {
    id: 'parsing_financials',
    title: 'Parsing',
    description: 'Financial data',
    status: 'upcoming',
  },
  {
    id: 'mining_documents',
    title: 'Mining',
    description: 'Documents',
    status: 'upcoming',
  },
  {
    id: 'fetching_public_data',
    title: 'Fetching',
    description: 'Public data',
    status: 'upcoming',
  },
  {
    id: 'building_slides',
    title: 'Building',
    description: 'Slides',
    status: 'upcoming',
  },
  {
    id: 'finalizing',
    title: 'Finalizing',
    description: 'Presentation',
    status: 'upcoming',
  },
  {
    id: 'complete',
    title: 'Complete',
    description: 'Ready',
    status: 'upcoming',
  },
];
