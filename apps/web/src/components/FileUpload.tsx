import { useState, useRef, DragEvent, useMemo } from 'react';
import type { SourceType } from '../types';
import { Upload, X, CheckCircle, AlertCircle, Camera, FileText } from 'lucide-react';

const SOURCE_TYPE_OPTIONS: { value: SourceType; label: string; accept: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp Chat Export', accept: '.txt' },
  { value: 'telegram', label: 'Telegram Export', accept: '.txt,.json' },
  { value: 'csv_grab', label: 'GrabFood CSV', accept: '.csv' },
  { value: 'csv_shopee', label: 'Shopee CSV', accept: '.csv' },
  { value: 'csv_foodpanda', label: 'Foodpanda CSV', accept: '.csv' },
  { value: 'pdf_bank', label: 'Bank Statement (PDF)', accept: '.pdf' },
  { value: 'pdf_ewallet', label: 'E-Wallet Statement (PDF)', accept: '.pdf' },
  { value: 'screenshot', label: 'Screenshot', accept: '.png,.jpg,.jpeg' },
  { value: 'voice', label: 'Voice Note', accept: '.mp3,.m4a,.wav,.ogg' },
];

interface FileUploadProps {
  onUpload: (file: File, sourceType: SourceType) => Promise<void>;
  uploading: boolean;
  progress: number;
  result: { success: boolean; message: string } | null;
  onClearResult: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function getErrorMessage(error: string): { message: string; suggestion: string } {
  if (error.includes('too large')) {
    return {
      message: 'File too large',
      suggestion: 'Please select a file smaller than 10MB. Try compressing images or splitting large documents.',
    };
  }
  if (error.includes('format') || error.includes('type')) {
    return {
      message: 'Unsupported format',
      suggestion: 'Please upload WhatsApp chats (.txt), CSV files, PDF documents, or images (PNG, JPG).',
    };
  }
  if (error.includes('network')) {
    return {
      message: 'Network error',
      suggestion: 'Please check your internet connection and try again.',
    };
  }
  return {
    message: 'Upload failed',
    suggestion: 'Please try again in a few moments. If the problem persists, contact support.',
  };
}

export function FileUpload({ onUpload, uploading, progress, result, onClearResult }: FileUploadProps) {
  const [sourceType, setSourceType] = useState<SourceType>('whatsapp');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const currentOption = SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType)!;
  
  // Use useMemo to avoid recalculating on every render
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }, []);

  const validateFile = (file: File): boolean => {
    setFileError(null);
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File too large');
      return false;
    }

    // Check file type
    const acceptedTypes = currentOption.accept.split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.some(type => fileExtension === type || file.type.includes(type.replace('.', '')))) {
      setFileError('Unsupported format');
      return false;
    }

    return true;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      // Estimate upload time (rough calculation)
      const estimatedSeconds = Math.ceil(file.size / (500 * 1024)); // Assume 500KB/s
      setEstimatedTime(estimatedSeconds);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      const estimatedSeconds = Math.ceil(file.size / (500 * 1024));
      setEstimatedTime(estimatedSeconds);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      const estimatedSeconds = Math.ceil(file.size / (500 * 1024));
      setEstimatedTime(estimatedSeconds);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile, sourceType);
      setSelectedFile(null);
      setEstimatedTime(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    } catch (error) {
      // Error handled by parent component
    }
  };

  const errorInfo = fileError ? getErrorMessage(fileError) : null;

  return (
    <div className="space-y-4">
      {/* Header with info */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <FileText size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-teal-900">
            <p className="font-medium mb-1">Accepted formats</p>
            <p className="text-teal-700">WhatsApp chats, CSV, PDF, images (PNG, JPG)</p>
            <p className="text-teal-700 mt-1">Max file size: 10MB per file</p>
          </div>
        </div>
      </div>

      {/* Source Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
        <select
          value={sourceType}
          onChange={(e) => { 
            setSourceType(e.target.value as SourceType); 
            setSelectedFile(null); 
            setFileError(null);
          }}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white min-h-[44px]"
        >
          {SOURCE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition min-h-[200px] flex items-center justify-center ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
              ? 'border-green-300 bg-green-50'
              : fileError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={currentOption.accept}
          onChange={handleFileChange}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle size={32} className="text-green-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedFile(null); 
                setEstimatedTime(null);
              }}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 min-h-[44px]"
            >
              Change file
            </button>
          </div>
        ) : (
          <div>
            <Upload size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-900 font-medium text-lg mb-1">
              Drag files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Accepts: {currentOption.accept}
            </p>
          </div>
        )}
      </div>

      {/* Mobile camera capture */}
      {isMobile && (sourceType === 'screenshot' || sourceType === 'pdf_bank') && (
        <div>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition min-h-[44px]"
          >
            <Camera size={20} />
            <span className="font-medium">Take Photo</span>
          </button>
        </div>
      )}

      {/* File Error */}
      {fileError && errorInfo && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-900">{errorInfo.message}</p>
              <p className="text-red-700 mt-1">{errorInfo.suggestion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {estimatedTime && progress < 100 && (
            <p className="text-xs text-gray-500 mt-1">
              Estimated time remaining: {Math.max(1, Math.ceil(estimatedTime * (100 - progress) / 100))} seconds
            </p>
          )}
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className={`flex items-start gap-2 p-4 rounded-lg text-sm ${
          result.success 
            ? 'bg-green-50 text-green-900 border border-green-200' 
            : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          {result.success ? (
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium">{result.success ? 'Upload successful!' : 'Upload failed'}</p>
            <p className="mt-1">{result.message}</p>
          </div>
          <button 
            onClick={onClearResult} 
            className="p-1 hover:bg-black/5 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || uploading || !!fileError}
        className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px]"
      >
        {uploading ? 'Uploading...' : 'Upload Evidence'}
      </button>
    </div>
  );
}
