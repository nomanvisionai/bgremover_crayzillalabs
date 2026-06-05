/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageDropzoneProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
  statusText?: string;
  progressPercent?: number;
}

export default function ImageDropzone({
  onImageSelected,
  isLoading = false,
  statusText = '',
  progressPercent = 0,
}: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Invalid file. Please select a valid JPEG, PNG, or WebP image.');
      return;
    }
    // Limit size to 15MB to prevent memory crash
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File too large. Please upload an image under 15MB.');
      return;
    }
    setErrorMsg(null);
    onImageSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLoading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (!isLoading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div id="image-dropzone-container" className="w-full">
      <div
        id="image-dropzone-boundary"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={`relative flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
          isDragOver
            ? 'border-zinc-900 bg-zinc-50/50 shadow-md ring-2 ring-zinc-900/10'
            : 'border-zinc-200 hover:border-zinc-300 bg-white hover:bg-zinc-50/40'
        } ${isLoading ? 'pointer-events-none opacity-90' : ''}`}
      >
        <input
          id="hidden-file-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div id="dropzone-loading-wrapper" className="flex flex-col items-center justify-center space-y-4">
            {/* Spinning/pulsing animation representing AI removal */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900">
                Removing Background...
              </h3>
              <p className="text-xs text-zinc-500 font-mono tracking-tight max-w-sm">
                {statusText || 'Downloading server models / segmenting foreground...'}
              </p>
            </div>
            
            {progressPercent > 0 && (
              <div className="w-48 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-black h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            )}
            
            <p className="text-[11px] text-zinc-400">
              {progressPercent > 0 ? `${Math.round(progressPercent)}% completed` : 'Analyzing pixel layers...'}
            </p>
          </div>
        ) : (
          <div id="dropzone-idle-wrapper" className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-zinc-50 p-4 text-zinc-800 ring-8 ring-zinc-50/50 transition-colors duration-200 group-hover:bg-zinc-100">
              <UploadCloud className="w-8 h-8 text-zinc-800" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">
                Upload image
              </h3>
              <p className="text-xs text-zinc-500 max-w-xs leading-normal">
                Drag and drop your image here, or <span className="text-zinc-900 font-semibold underline">browse machine</span>.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-600">
                PNG
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-600">
                JPG / JPEG
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-medium text-zinc-600">
                WEBP
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            id="dropzone-error-alert"
            onClick={(e) => e.stopPropagation()} // Prevent clicking parent
            className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
            <button
              id="close-error-btn"
              onClick={() => setErrorMsg(null)}
              className="px-2 py-1 font-semibold hover:bg-rose-100 rounded text-[10px] uppercase transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
