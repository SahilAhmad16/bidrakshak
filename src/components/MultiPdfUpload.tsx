'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, X, AlertCircle, Loader2 } from 'lucide-react';

interface MultiPdfUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  isProcessing?: boolean;
  maxFiles?: number;
  label?: string;
  hint?: string;
  accentColor?: 'blue' | 'emerald';
  disabled?: boolean;
}

export function MultiPdfUpload({
  files,
  onChange,
  isProcessing = false,
  maxFiles = 10,
  label = 'Upload PDF Documents (.pdf)',
  hint = 'Select or drag & drop 1–10 PDFs (Max 25MB each)',
  accentColor = 'blue',
  disabled = false,
}: MultiPdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEmerald = accentColor === 'emerald';

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processIncomingFiles = (incomingList: FileList | File[]) => {
    setUploadError('');
    const incoming = Array.from(incomingList);
    if (incoming.length === 0) return;

    // Filter PDFs
    const pdfFiles: File[] = [];
    const nonPdfCount = incoming.filter((f) => {
      const isPdf = f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf';
      if (isPdf) {
        pdfFiles.push(f);
      }
      return !isPdf;
    }).length;

    let errorMsg = '';
    if (nonPdfCount > 0) {
      errorMsg = `${nonPdfCount} non-PDF file${nonPdfCount > 1 ? 's' : ''} ignored. Only .pdf files are accepted.`;
    }

    // Check batch capacity (Max 10 files)
    const availableSlots = maxFiles - files.length;
    if (availableSlots <= 0) {
      setUploadError(`Maximum ${maxFiles} PDFs allowed per batch.`);
      return;
    }

    if (pdfFiles.length > availableSlots) {
      const excess = pdfFiles.length - availableSlots;
      errorMsg = errorMsg
        ? `${errorMsg} Also, ${excess} file${excess > 1 ? 's were' : ' was'} omitted (Maximum ${maxFiles} PDFs per batch).`
        : `Maximum ${maxFiles} PDFs allowed per batch. Only first ${availableSlots} file${availableSlots > 1 ? 's were' : ' was'} added.`;
    }

    const filesToAdd = pdfFiles.slice(0, availableSlots);
    if (filesToAdd.length > 0) {
      onChange([...files, ...filesToAdd]);
    }

    if (errorMsg) {
      setUploadError(errorMsg);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processIncomingFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processIncomingFiles(e.target.files);
    }
    // Reset file input value so user can re-select the same file if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    if (isProcessing) return;
    setUploadError('');
    onChange(files.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (isProcessing) return;
    setUploadError('');
    onChange([]);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {files.length} / {maxFiles} PDFs
        </span>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* Dropzone Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && !isProcessing && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? isEmerald
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
            : isEmerald
            ? 'border-slate-300 dark:border-emerald-500/25 hover:border-emerald-400 dark:hover:border-emerald-500/50 bg-slate-50/50 dark:bg-[#071224]/50'
            : 'border-slate-300 dark:border-blue-500/25 hover:border-blue-400 dark:hover:border-blue-500/50 bg-slate-50/50 dark:bg-[#071224]/50'
        } ${disabled || isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDragging
                ? isEmerald
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-cyan-300'
                : isEmerald
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                : 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Click to browse or drag &amp; drop PDF files
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{hint}</p>
          </div>
        </div>
      </div>

      {/* Validation Error Message */}
      {uploadError && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Selected File List */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span>Selected Files ({files.length}):</span>
            {!isProcessing && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-white dark:bg-[#0a1628] border border-slate-200 dark:border-blue-500/20 text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center ${
                      isEmerald
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 dark:text-slate-200 truncate text-[11px] leading-tight">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {isProcessing ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isEmerald
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                          : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-500/30'
                      }`}
                    >
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Processing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Waiting
                    </span>
                  )}

                  {!isProcessing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      title={`Remove ${file.name}`}
                      className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
