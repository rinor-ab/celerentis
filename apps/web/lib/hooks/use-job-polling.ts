import { useEffect } from 'react';
import { useJob } from './use-api';
import { useJobPollingStore, useNotificationStore } from '../store';

export function useJobPolling(jobId: string | undefined) {
  const { addPollingJob, removePollingJob, isPolling } = useJobPollingStore();
  const { addNotification } = useNotificationStore();
  
  const { data: job, isLoading, error } = useJob(jobId || '', {
    refetchInterval: isPolling(jobId || '') ? 4000 : undefined,
  });

  useEffect(() => {
    if (!jobId) return;

    // Start polling if job is not complete or error
    if (job && job.stage !== 'complete' && job.stage !== 'error') {
      addPollingJob(jobId);
    } else {
      removePollingJob(jobId);
    }

    // Cleanup on unmount
    return () => {
      removePollingJob(jobId);
    };
  }, [jobId, job?.stage, addPollingJob, removePollingJob]);

  // Handle stage changes and notifications
  useEffect(() => {
    if (!job) return;

    const stageMessages = {
      queued: 'Job queued for processing',
      parsing_financials: 'Parsing financial data...',
      mining_documents: 'Mining documents for insights...',
      fetching_public_data: 'Fetching public company data...',
      building_slides: 'Building presentation slides...',
      finalizing: 'Finalizing presentation...',
      complete: 'Job completed successfully!',
      error: 'Job failed to complete',
    };

    const message = stageMessages[job.stage];
    if (message) {
      addNotification({
        type: job.stage === 'error' ? 'error' : 
              job.stage === 'complete' ? 'success' : 'info',
        title: 'Job Update',
        message,
      });
    }
  }, [job?.stage, addNotification]);

  return {
    job,
    isLoading,
    error,
    isPolling: isPolling(jobId || ''),
  };
}
