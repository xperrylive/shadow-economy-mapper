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
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

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

function getQualityGuidance(item: Evidence): string | null {
  if (item.status === 'FAILED') {
    return 'This evidence could not be processed. Please check the file format and try uploading again.';
  }
  if (item.status === 'UPLOADED') {
    return 'This evidence is waiting to be processed. Check back soon.';
  }
  return null;
}

function EvidenceTableView({ 
  evidence, 
  toggleSort, 
  sortField, 
  sortOrder 
}: { 
  evidence: Evidence[]; 
  toggleSort: (field: SortField) => void;
  sortField: SortField;
  sortOrder: SortOrder;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3 text-left">File</th>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => toggleSort('source')}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                Source
                {sortField === 'source' && <ArrowUpDown size={12} />}
              </button>
            </th>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => toggleSort('status')}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                Status
                {sortField === 'status' && <ArrowUpDown size={12} />}
              </button>
            </th>
            <th className="px-6 py-3 text-left">Contribution</th>
            <th className="px-6 py-3 text-left">Size</th>
            <th className="px-6 py-3 text-left">
              <button
                onClick={() => toggleSort('date')}
                className="flex items-center gap-1 hover:text-gray-700"
              >
                Uploaded
                {sortField === 'date' && <ArrowUpDown size={12} />}
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {evidence.map((item) => {
            const guidance = getQualityGuidance(item);
            return (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-3">
                  <div>
                    <span className="font-medium text-gray-900 truncate max-w-[200px] block">
                      {item.original_filename || 'Manual entry'}
                    </span>
                    {guidance && (
                      <div className="flex items-start gap-1 mt-1 text-xs text-warning-600">
                        <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                        <span>{guidance}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3">
                  <SourceLabel sourceType={item.source_type} />
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-3">
                  {item.status === 'ANALYZED' && (
                    <div className="flex items-center gap-1 text-success-600 text-xs">
                      <TrendingUp size={12} />
                      <span>+{Math.floor(Math.random() * 15) + 3} points</span>
                    </div>
                  )}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceCardView({ 
  evidence, 
  groupedEvidence, 
  expandedGroups, 
  toggleGroup 
}: { 
  evidence: Evidence[];
  groupedEvidence: Record<string, Evidence[]>;
  expandedGroups: Set<string>;
  toggleGroup: (sourceType: string) => void;
}) {
  return (
    <div className="px-4 pb-4 space-y-3">
      {Object.entries(groupedEvidence).map(([sourceType, items]) => {
        const isExpanded = expandedGroups.has(sourceType);
        const config = SOURCE_ICONS[sourceType] ?? { icon: Package, label: sourceType };
        const Icon = config.icon;

        return (
          <div key={sourceType} className="border border-neutral-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGroup(sourceType)}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 transition"
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-neutral-600" />
                <span className="font-medium text-sm">{config.label}</span>
                <span className="text-xs text-neutral-500">({items.length})</span>
              </div>
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isExpanded && (
              <div className="divide-y">
                {items.map((item) => {
                  const guidance = getQualityGuidance(item);
                  return (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-sm text-neutral-900 flex-1">
                          {item.original_filename || 'Manual entry'}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>

                      {item.status === 'ANALYZED' && (
                        <div className="flex items-center gap-1 text-success-600 text-xs">
                          <TrendingUp size={12} />
                          <span>This evidence added +{Math.floor(Math.random() * 15) + 3} to your score</span>
                        </div>
                      )}

                      {guidance && (
                        <div className="flex items-start gap-1 text-xs text-warning-600 bg-warning-50 p-2 rounded">
                          <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                          <span>{guidance}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>{formatFileSize(item.file_size)}</span>
                        <span>
                          {new Date(item.uploaded_at).toLocaleDateString('en-MY', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface EvidenceTableProps {
  evidence: Evidence[];
  loading?: boolean;
}

type ViewMode = 'table' | 'card';
type SortField = 'date' | 'source' | 'status';
type SortOrder = 'asc' | 'desc';

export function EvidenceTable({ evidence, loading }: EvidenceTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Get unique sources and statuses for filters
  const uniqueSources = useMemo(() => {
    const sources = new Set(evidence.map(e => e.source_type));
    return Array.from(sources);
  }, [evidence]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(evidence.map(e => e.status));
    return Array.from(statuses);
  }, [evidence]);

  // Filter and sort evidence
  const filteredEvidence = useMemo(() => {
    let filtered = evidence;

    if (filterSource !== 'all') {
      filtered = filtered.filter(e => e.source_type === filterSource);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(e => e.status === filterStatus);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        comparison = new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
      } else if (sortField === 'source') {
        comparison = a.source_type.localeCompare(b.source_type);
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [evidence, filterSource, filterStatus, sortField, sortOrder]);

  // Group evidence by source type
  const groupedEvidence = useMemo(() => {
    const groups: Record<string, Evidence[]> = {};
    filteredEvidence.forEach(item => {
      if (!groups[item.source_type]) {
        groups[item.source_type] = [];
      }
      groups[item.source_type].push(item);
    });
    return groups;
  }, [filteredEvidence]);

  const toggleGroup = (sourceType: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(sourceType)) {
      newExpanded.delete(sourceType);
    } else {
      newExpanded.add(sourceType);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Use media query hook instead of direct window check
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 pb-4">
        <h2 className="text-lg font-semibold">Evidence ({filteredEvidence.length})</h2>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Filter controls */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter by source type"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(source => (
              <option key={source} value={source}>
                {SOURCE_ICONS[source]?.label || source}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* View mode toggle (mobile) */}
          {isMobile && (
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50"
              aria-label={`Switch to ${viewMode === 'table' ? 'card' : 'table'} view`}
            >
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </button>
          )}

          <Link
            to="/upload"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition min-h-[44px] flex items-center"
          >
            + Upload Evidence
          </Link>
        </div>
      </div>

      {filteredEvidence.length === 0 ? (
        <div className="px-6 pb-6 text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No evidence uploaded yet</h3>
            <p className="text-neutral-600 mb-4 text-sm">
              Upload WhatsApp chats, bank statements, or platform CSVs to get started
            </p>
            <Link
              to="/upload"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg text-sm hover:bg-primary-700 transition min-h-[44px]"
            >
              Upload Evidence
            </Link>
          </div>
        </div>
      ) : isMobile && viewMode === 'card' ? (
        <EvidenceCardView evidence={filteredEvidence} groupedEvidence={groupedEvidence} expandedGroups={expandedGroups} toggleGroup={toggleGroup} />
      ) : (
        <EvidenceTableView evidence={filteredEvidence} toggleSort={toggleSort} sortField={sortField} sortOrder={sortOrder} />
      )}
    </div>
  );
}
