import type { EvidenceStatus, ConfidenceLevel } from '../types';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

type StatusType = EvidenceStatus | ConfidenceLevel | string;

interface StatusConfig {
  label: string;
  className: string;
  icon?: React.ReactNode;
}

const EVIDENCE_STATUS_CONFIG: Record<EvidenceStatus, StatusConfig> = {
  UPLOADED: { 
    label: 'Uploaded', 
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: <Clock size={12} />
  },
  QUEUED: { 
    label: 'Queued', 
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Clock size={12} />
  },
  EXTRACTED: { 
    label: 'Extracted', 
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Clock size={12} />
  },
  NORMALIZED: { 
    label: 'Normalized', 
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: <Clock size={12} />
  },
  ANALYZED: { 
    label: 'Analyzed', 
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle size={12} />
  },
  REPORTED: { 
    label: 'Reported', 
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: <CheckCircle size={12} />
  },
  FAILED: { 
    label: 'Failed', 
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: <XCircle size={12} />
  },
};

const CONFIDENCE_LEVEL_CONFIG: Record<ConfidenceLevel, StatusConfig> = {
  HIGH: {
    label: 'High Confidence',
    className: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle size={12} />
  },
  MEDIUM: {
    label: 'Medium Confidence',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertCircle size={12} />
  },
  LOW: {
    label: 'Low Confidence',
    className: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertCircle size={12} />
  },
};

interface StatusBadgeProps {
  status: StatusType;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  // Try to find config in evidence status first, then confidence level
  let config: StatusConfig | undefined = 
    EVIDENCE_STATUS_CONFIG[status as EvidenceStatus] || 
    CONFIDENCE_LEVEL_CONFIG[status as ConfidenceLevel];

  // Fallback for unknown statuses
  if (!config) {
    config = {
      label: String(status),
      className: 'bg-gray-100 text-gray-700 border-gray-200',
    };
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-sm';

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.className} ${sizeClasses}`}
      role="status"
      aria-label={config.label}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
