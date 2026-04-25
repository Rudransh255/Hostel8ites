'use client';

import { useState, useRef } from 'react';
import { useToast } from './ToastProvider';

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void;
}

export default function ImageUpload({ onImageSelected }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5 MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelected(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-sm font-medium text-[#4B5563]">Item Image (Optional)</label>
      
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-[120px] bg-[#F5F6F8] rounded-[14px] border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#EEF0F3] transition"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <span className="text-sm text-[#9CA3AF]">Tap to upload photo</span>
          <span className="text-[10px] text-[#9CA3AF]">Max 5MB (JPEG, PNG)</span>
        </div>
      ) : (
        <div className="relative w-full h-[200px] rounded-[14px] overflow-hidden border border-[#E5E7EB]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button 
            onClick={clearImage}
            className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 backdrop-blur-sm"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      )}

      <input 
        type="file" 
        accept="image/jpeg, image/png, image/webp" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
