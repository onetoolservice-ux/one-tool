import { useState, useEffect } from 'react';
import { logger } from '@/app/lib/utils/logger';

export const usePdfThumbnail = (file: File) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const generateThumbnail = async () => {
      try {
        // 1. DYNAMIC IMPORT (Fixes 'DOMMatrix is not defined' SSR error)
        // We only load PDF.js in the browser, not on the server
        const pdfjsLib = await import('pdfjs-dist');

        // 2. WORKER CONFIG
        // Point to the local worker file we moved to /public earlier
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

        // 3. RENDER
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1); // Get first page
        
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          if (isActive) setThumbnail(canvas.toDataURL());
        }
      } catch (err) {
        // Log error for debugging
        logger.error('PDF thumbnail generation failed:', err);
        // UI will show default icon - this is acceptable for thumbnails
        // No user toast needed as it's a non-critical feature
      } finally {
        if (isActive) setLoading(false);
      }
    };

    generateThumbnail();
    
    return () => { isActive = false; };
  }, [file]);

  return { thumbnail, loading };
};
