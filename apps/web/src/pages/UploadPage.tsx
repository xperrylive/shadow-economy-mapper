import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { FileUpload } from '../components/FileUpload';
import { ManualEntryForm } from '../components/ManualEntryForm';
import { StatusBadge } from '../components/StatusBadge';
import { uploadEvidence, uploadManualEntry, getEvidenceList } from '../lib/services';
import type { SourceType, Evidence } from '../types';
import { CheckCircle, AlertCircle, X, Package } from 'lucide-react';

export function UploadPage() {
  const { currentBusiness } = useBusiness();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileResult, setFileResult] = useState<{ success: boolean; message: string } | null>(null);
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualResult, setManualResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recentUploads, setRecentUploads] = useState<Evidence[]>([]);

  const fetchRecent = useCallback(async () => {
    if (!currentBusiness) return;
    try {
      const res = await getEvidenceList(currentBusiness.id);
      setRecentUploads(res.results.slice(0, 5));
    } catch {
      // ignore
    }
  }, [currentBusiness]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  const handleFileUpload = async (file: File, sourceType: SourceType) => {
    if (!currentBusiness) return;
    setUploading(true);
    setProgress(0);
    setFileResult(null);
    try {
      const res = await uploadEvidence(
        currentBusiness.id,
        sourceType,
        file,
        (p) => setProgress(p)
      );
      setFileResult({ success: true, message: `${res.message} (ID: ${res.evidence_id})` });
      fetchRecent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setFileResult({ success: false, message: msg });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleManualEntry = async (data: {
    date: string;
    total_sales: number;
    order_count?: number;
    notes?: string;
  }) => {
    if (!currentBusiness) return;
    setManualSubmitting(true);
    setManualResult(null);
    try {
      const res = await uploadManualEntry({
        business_id: currentBusiness.id,
        source_type: 'manual',
        ...data,
      });
      setManualResult({ success: true, message: res.message });
      fetchRecent();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed.';
      setManualResult({ success: false, message: msg });
      throw err; // Re-throw so the form knows submission failed
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Upload Evidence</h1>

      {/* File Upload */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upload File</h2>
        <FileUpload
          onUpload={handleFileUpload}
          uploading={uploading}
          progress={progress}
          result={fileResult}
          onClearResult={() => setFileResult(null)}
        />
      </section>

      {/* Manual Entry Result (shown at page level so it persists after form reset) */}
      {manualResult && (
        <div className={`flex items-start gap-2 p-4 rounded-xl shadow text-sm ${
          manualResult.success
            ? 'bg-green-50 text-green-900 border border-green-200'
            : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          {manualResult.success ? (
            <CheckCircle size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className="font-medium">{manualResult.success ? 'Entry submitted!' : 'Submission failed'}</p>
            <p className="mt-1">{manualResult.message}</p>
            {manualResult.success && (
              <p className="mt-1 text-green-700">Your entry is now visible in the Dashboard and Ledger.</p>
            )}
          </div>
          <button
            onClick={() => setManualResult(null)}
            className="p-1 hover:bg-black/5 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Manual Entry */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-1">Manual Entry</h2>
        <p className="text-sm text-gray-500 mb-4">
          Record sales from cash transactions or events without digital records.
        </p>
        <ManualEntryForm
          onSubmit={handleManualEntry}
          submitting={manualSubmitting}
          result={manualResult}
          onClearResult={() => setManualResult(null)}
        />
      </section>

      {/* Recent Uploads */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
        {recentUploads.length > 0 ? (
          <div className="space-y-2">
            {recentUploads.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.original_filename || 'Manual entry'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.uploaded_at).toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Package size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No uploads yet.</p>
            <p className="text-xs text-gray-400 mt-1">Upload a file or create a manual entry above to get started.</p>
          </div>
        )}
      </section>
    </div>
  );
}
