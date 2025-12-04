"use client";
import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { FileText, X, RotateCw, GripVertical, Loader2 } from 'lucide-react';
import { usePdfThumbnail } from '@/app/hooks/usePdfThumbnail';

interface PdfCardProps {
  file: File;
  index: number;
  rotation: number;
  onRemove: (index: number) => void;
  onRotate: (index: number) => void;
}

export const PdfCard = ({ file, index, rotation, onRemove, onRotate }: PdfCardProps) => {
  const { thumbnail, loading } = usePdfThumbnail(file);

  return (
    <Draggable draggableId={`file-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            relative flex items-center gap-4 p-3 rounded-xl border transition-all select-none
            ${snapshot.isDragging 
              ? 'bg-indigo-50 border-indigo-500 shadow-xl scale-105 z-50' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
            }
          `}
        >
          {/* Drag Handle */}
          <div {...provided.dragHandleProps} className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing">
            <GripVertical size={20} />
          </div>

          {/* Thumbnail Preview */}
          <div className="w-16 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 relative">
             {loading ? (
               <Loader2 size={16} className="animate-spin text-slate-400" />
             ) : thumbnail ? (
               <img 
                 src={thumbnail} 
                 alt="Preview" 
                 className="w-full h-full object-contain bg-white" 
                 style={{ transform: `rotate(${rotation}deg)` }}
               />
             ) : (
               <FileText size={24} className="text-slate-300" />
             )}
          </div>

          {/* Info & Controls */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</h4>
            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            
            <div className="flex items-center gap-3 mt-2">
               <button 
                 onClick={() => onRotate(index)} 
                 className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded"
               >
                 <RotateCw size={12} /> Rotate
               </button>
            </div>
          </div>

          {/* Remove Button */}
          <button 
            onClick={() => onRemove(index)}
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </Draggable>
  );
};
