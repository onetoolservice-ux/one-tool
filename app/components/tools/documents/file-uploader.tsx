"use client";
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, ShieldCheck } from 'lucide-react';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes: Record<string, string[]>;
  title?: string;
  description?: string;
  multiple?: boolean;
}

export function FileUploader({
  onFilesSelected,
  acceptedFileTypes,
  title = 'Drag & Drop Files',
  description = 'Secure client-side processing. Your documents never leave this browser tab.',
  multiple = true,
}: FileUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple,
  });

  return (
    <div className="w-full max-w-3xl mx-auto h-full flex flex-col justify-center">
      <div
        {...getRootProps()}
        className={`
          relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all cursor-pointer
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 scale-105' 
            : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-indigo-400'}
        `}
      >
        <input {...getInputProps()} />
        <div className="p-5 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
          <UploadCloud size={48} />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          {isDragActive ? 'Drop files here...' : title}
        </h3>
        <p className="mb-8 text-center text-slate-500 max-w-md">
          {description}
        </p>
        <button className="px-8 py-3 text-sm font-bold text-white transition-colors rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg">
          Select Documents
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 mt-8 text-xs font-bold text-[#4a6b61] bg-[#638c80]/10 dark:bg-emerald-900/20 border border-[#638c80]/20 dark:border-emerald-900 px-4 py-2 rounded-full w-fit mx-auto">
        <ShieldCheck size={14} />
        <span>100% Private & Offline Capable</span>
      </div>
    </div>
  );
}
