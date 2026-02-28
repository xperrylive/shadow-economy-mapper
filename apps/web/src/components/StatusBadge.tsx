import type { EvidenceStatus } from '../types';

const STATUS_CONFIG: Record<EvidenceStatus, { label: string; className: string }> = {
  UPLOADED: { label: 'Uploaded', className: 'bg-gray-100 text-gray-700' },
  QUEUED: { label: 'Queued', className: 'bg-yellow-100 text-yellow-700' },
  EXTRACTED: { label: 'Extracted', className: 'bg-blue-100 text-blue-700' },
  NORMALIZED: { label: 'Normalized', className: 'bg-indigo-100 text-indigo-700' },
  ANALYZED: { label: 'Analyzed', className: 'bg-green-100 text-green-700' },
  REPORTED: { label: 'Reported', className: 'bg-emerald-100 text-emerald-700' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-700' },
};

export function StatusBadge({ status }: { status: EvidenceStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.UPLOADED;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
