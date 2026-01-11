/**
 * useCopyToClipboard Hook
 * 
 * Reusable hook for copying text to clipboard with feedback
 * Standardizes copy functionality across the platform
 */

import { useState, useCallback } from 'react';
import { showToast } from '@/app/shared/Toast';
import { logger } from '@/app/lib/utils/logger';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(successMessage, 'success');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      logger.error('Failed to copy:', error);
      showToast('Failed to copy to clipboard', 'error');
      setCopied(false);
    }
  }, []);

  return { copy, copied };
}
