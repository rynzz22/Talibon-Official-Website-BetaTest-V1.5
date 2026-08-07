import React, { useState, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { isMockAllowed } from '../lib/mode';
import { Upload, X, FileText, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  label: string;
  accept?: string;
  folder?: string;
  currentValue?: string;
  bucket?: string;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  'image/*': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  '.pdf': ['application/pdf'],
  '.doc,.docx': [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  '*': [],
};

function getAllowedMimes(accept: string): string[] {
  if (accept === '*') return [];
  const types: string[] = [];
  accept.split(',').forEach((a) => {
    const trimmed = a.trim();
    for (const [key, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
      if (key.includes(trimmed) || trimmed.includes(key)) {
        types.push(...mimes);
      }
    }
  });
  return types;
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .slice(0, 100);
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  label,
  accept = '*',
  folder = 'uploads',
  currentValue,
  bucket = 'public-cms',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
    }

    if (accept !== '*') {
      const allowedMimes = getAllowedMimes(accept);
      if (allowedMimes.length > 0 && !allowedMimes.includes(file.type)) {
        return `Invalid file type. Allowed: ${accept}`;
      }
    }

    const suspiciousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.ps1', '.js', '.php'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (suspiciousExtensions.includes(ext)) {
      return 'This file type is not permitted for security reasons.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const safeName = sanitizeFileName(file.name);
    setFileName(file.name);
    setUploadProgress(10);

    // Fallback if Supabase is not configured or unavailable
    if (!isSupabaseConfigured) {
      if (!isMockAllowed()) {
        setError(`Storage bucket unavailable. Please contact the system administrator. Reference: ${bucket} bucket missing.`);
        setUploadProgress(null);
        return;
      }
      try {
        setUploadProgress(30);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress(70);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadProgress(100);

        let mockUrl = '';
        if (file.type.startsWith('image/')) {
          mockUrl = URL.createObjectURL(file);
        } else {
          mockUrl = `https://talibon.gov.ph/mock-documents/${safeName}`;
        }

        setTimeout(() => {
          onUploadComplete(mockUrl);
          setUploadProgress(null);
        }, 100);
      } catch (err) {
        setError('Local mock upload failed.');
        setUploadProgress(null);
      }
      return;
    }

    try {
      const filePath = `${folder}/${Date.now()}_${safeName}`;

      setUploadProgress(30);

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;
      if (!data?.path) throw new Error('Upload succeeded but no path returned.');

      setUploadProgress(80);

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      if (!publicUrl) throw new Error('Failed to generate public URL.');

      setUploadProgress(100);
      setTimeout(() => {
        onUploadComplete(publicUrl);
        setUploadProgress(null);
      }, 500);
    } catch (err: any) {
      console.error('[FileUpload] Error:', err);
      
      const errorMsg = err?.message || '';
      const isBucketError = errorMsg.toLowerCase().includes('bucket') || errorMsg.toLowerCase().includes('not found');
      
      if (isBucketError) {
        if (!isMockAllowed()) {
          setError(`Storage bucket unavailable. Please contact the system administrator. Reference: ${bucket} bucket missing.`);
          setUploadProgress(null);
          return;
        }
        console.warn('[FileUpload] Falling back to local/blob url due to storage bucket missing or unconfigured:', errorMsg);
        setError(null);
        setUploadProgress(60);
        
        let fallbackUrl = '';
        if (file.type.startsWith('image/')) {
          fallbackUrl = URL.createObjectURL(file);
        } else {
          fallbackUrl = `https://talibon.gov.ph/mock-documents/${safeName}`;
        }
        
        setTimeout(() => {
          setUploadProgress(100);
          setTimeout(() => {
            onUploadComplete(fallbackUrl);
            setUploadProgress(null);
          }, 300);
        }, 300);
        return;
      }

      const message =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      setUploadProgress(null);
    }
  };

  const clearFile = () => {
    onUploadComplete('');
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
        {label}
      </label>

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label={`Upload ${label}`}
        className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-blue-600 bg-blue-50/50'
            : uploadProgress !== null
            ? 'border-blue-400 bg-blue-50/10'
            : currentValue
            ? 'border-green-400 bg-green-50/10'
            : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          aria-hidden="true"
        />

        <AnimatePresence mode="wait">
          {uploadProgress !== null ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-3 w-full max-w-xs"
              aria-live="polite"
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <Loader2 size={32} className="text-blue-600 animate-spin" aria-hidden="true" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-600">
                  {Math.round(uploadProgress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(uploadProgress)} aria-valuemin={0} aria-valuemax={100}>
                <motion.div
                  className="h-full bg-blue-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center truncate w-full px-4">
                Uploading: {fileName}
              </p>
            </motion.div>
          ) : currentValue ? (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle size={24} aria-hidden="true" />
              </div>
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                File Secured
              </p>
              <div className="flex items-center gap-2 mt-2">
                <a
                  href={currentValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1"
                >
                  <FileText size={12} aria-hidden="true" />
                  View Current File
                </a>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  aria-label="Remove file"
                  className="p-1 hover:bg-red-50 text-red-400 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="instruction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Upload size={32} aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">
                  Click or drag to upload
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {accept === '*' ? 'All files' : accept.toUpperCase()} — Max {MAX_FILE_SIZE_MB}MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mt-2 flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest"
          >
            <AlertCircle size={14} aria-hidden="true" />
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
