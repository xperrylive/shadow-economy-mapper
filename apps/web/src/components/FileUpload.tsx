import { useState, useRef, DragEvent } from 'react';
import type { SourceType } from '../types';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

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

export function FileUpload({ onUpload, uploading, progress, result, onClearResult }: FileUploadProps) {
  const [sourceType, setSourceType] = useState<SourceType>('whatsapp');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentOption = SOURCE_TYPE_OPTIONS.find((o) => o.value === sourceType)!;

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
    if (file) setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    await onUpload(selectedFile, sourceType);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Source Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Type</label>
        <select
          value={sourceType}
          onChange={(e) => { setSourceType(e.target.value as SourceType); setSelectedFile(null); }}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
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
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : selectedFile
              ? 'border-green-300 bg-green-50'
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
          <div className="flex items-center justify-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={32} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Accepts: {currentOption.accept}
            </p>
          </>
        )}
      </div>

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
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{result.message}</span>
          <button onClick={onClearResult} className="p-1 hover:bg-black/5 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || uploading}
        className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload Evidence'}
      </button>
    </div>
  );
}
