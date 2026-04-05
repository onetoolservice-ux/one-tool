'use client';

import { useEffect } from 'react';
import { useToast } from '@/app/components/ui/toast-system';

/** Listens for ot-storage-quota-exceeded and shows a user-facing toast. */
export function StorageQuotaToast() {
  const { toast } = useToast();

  useEffect(() => {
    const handler = () => {
      toast(
        'Storage full — your browser\'s local storage is almost full. Export a backup to avoid losing data.',
        'error'
      );
    };
    window.addEventListener('ot-storage-quota-exceeded', handler);
    return () => window.removeEventListener('ot-storage-quota-exceeded', handler);
  }, [toast]);

  return null;
}
