import { useState, useEffect, useCallback } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { FileUpload } from '../components/FileUpload';
import { ManualEntryForm } from '../components/ManualEntryForm';
import { StatusBadge } from '../components/StatusBadge';
import { uploadEvidence, uploadManualEntry, getEvidenceList } from '../lib/services';
import type { SourceType, Evidence } from '../types';

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
      {recentUploads.length > 0 && (
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
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
        </section>
      )}
    </div>
  );
}
