import { Link } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';
import type { Evidence, SourceType } from '../types';
import {
  MessageCircle,
  FileSpreadsheet,
  FileText,
  Image,
  Mic,
  PenLine,
  Package,
} from 'lucide-react';

const SOURCE_ICONS: Record<string, { icon: typeof MessageCircle; label: string }> = {
  whatsapp: { icon: MessageCircle, label: 'WhatsApp' },
  telegram: { icon: MessageCircle, label: 'Telegram' },
  instagram: { icon: MessageCircle, label: 'Instagram' },
  csv_grab: { icon: FileSpreadsheet, label: 'GrabFood CSV' },
  csv_shopee: { icon: FileSpreadsheet, label: 'Shopee CSV' },
  csv_foodpanda: { icon: FileSpreadsheet, label: 'Foodpanda CSV' },
  pdf_bank: { icon: FileText, label: 'Bank PDF' },
  pdf_ewallet: { icon: FileText, label: 'E-Wallet PDF' },
  screenshot: { icon: Image, label: 'Screenshot' },
  manual: { icon: PenLine, label: 'Manual Entry' },
  voice: { icon: Mic, label: 'Voice Note' },
};

function SourceLabel({ sourceType }: { sourceType: SourceType }) {
  const config = SOURCE_ICONS[sourceType] ?? { icon: Package, label: sourceType };
  const Icon = config.icon;
  return (
    <span className="flex items-center gap-2 text-sm">
      <Icon size={14} className="text-gray-400" />
      {config.label}
    </span>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface EvidenceTableProps {
  evidence: Evidence[];
  loading?: boolean;
}

export function EvidenceTable({ evidence, loading }: EvidenceTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex justify-between items-center p-6 pb-4">
        <h2 className="text-lg font-semibold">Evidence ({evidence.length})</h2>
        <Link
          to="/upload"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition"
        >
          + Upload Evidence
        </Link>
      </div>

      {evidence.length === 0 ? (
        <div className="px-6 pb-6 text-center py-8">
          <p className="text-gray-400 mb-3">No evidence uploaded yet.</p>
          <Link
            to="/upload"
            className="text-primary-600 text-sm hover:underline"
          >
            Upload your first evidence
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">File</th>
                <th className="px-6 py-3 text-left">Source</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Size</th>
                <th className="px-6 py-3 text-left">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {evidence.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3">
                    <span className="font-medium text-gray-900 truncate max-w-[200px] block">
                      {item.original_filename || 'Manual entry'}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <SourceLabel sourceType={item.source_type} />
                  </td>
                  <td className="px-6 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {formatFileSize(item.file_size)}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(item.uploaded_at).toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
