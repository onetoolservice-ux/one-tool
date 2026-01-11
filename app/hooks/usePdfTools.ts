import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import download from 'downloadjs';
import { showToast } from '@/app/shared/Toast';
import { logger } from '@/app/lib/utils/logger';

export const usePdfTools = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const mergePdfs = async (files: File[]) => {
    if (files.length < 2) {
      showToast("Please select at least 2 PDF files to merge.", "error");
      return;
    }

    try {
      setIsProcessing(true);
      
      // 1. Create a new empty doc
      const mergedPdf = await PDFDocument.create();

      // 2. Loop through uploaded files
      for (const file of files) {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 3. Save and Download
      const pdfBytes = await mergedPdf.save();
      download(pdfBytes, "onetool-merged.pdf", "application/pdf");
      showToast("PDFs merged successfully!", "success");
      
    } catch (err) {
      logger.error("PDF merge error:", err);
      showToast("Error merging PDFs. Please ensure files are valid.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return { mergePdfs, isProcessing };
};
