import React, { useState, useRef } from 'react';

interface DragDropAreaProps {
  selectedFile: File | null;
  uploadSuccess: boolean;
  uploadError: string | null;
  transcriptionSuccess: boolean;
  transcriptionError: string | null;
  onFileSelect: (file: File) => void | Promise<void>;
  children: (props: { openFileDialog: () => void }) => React.ReactNode;
}

export function DragDropArea({
  selectedFile,
  uploadSuccess,
  uploadError,
  transcriptionSuccess,
  transcriptionError,
  onFileSelect,
  children,
}: DragDropAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'video/mp4') {
        await onFileSelect(file);
      } else {
        alert('Please select an MP4 file.');
      }
    }
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'video/mp4') {
        await onFileSelect(file);
      } else {
        alert('Please select an MP4 file.');
      }
    }
  }

  let borderColorClass = 'border-gray-300 hover:border-gray-400';
  
  if (dragActive) {
    borderColorClass = 'border-blue-400 bg-blue-50';
  } else if (selectedFile) {
    if (transcriptionSuccess) {
      borderColorClass = 'border-green-400 bg-green-50';
    } else if (transcriptionError) {
      borderColorClass = 'border-red-400 bg-red-50';
    } else if (uploadSuccess) {
      borderColorClass = 'border-green-400 bg-green-50';
    } else if (uploadError) {
      borderColorClass = 'border-red-400 bg-red-50';
    } else {
      borderColorClass = 'border-green-400 bg-green-50';
    }
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${borderColorClass}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        name="video"
        type="file"
        accept=".mp4,video/mp4"
        onChange={handleFileInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer hidden"
      />
      {children({ openFileDialog: () => fileInputRef.current?.click() })}
    </div>
  );
}