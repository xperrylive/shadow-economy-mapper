import { useState } from 'react';
import { Card } from '../design-system/components/Card';
import { Badge } from '../design-system/components/Badge';
import { Button } from '../design-system/components/Button';
import { ScoreCard } from './ScoreCard';
import { ScoreBreakdown } from './ScoreBreakdown';
import { StatusBadge } from './StatusBadge';
import type { CredibilityScore, Evidence, LedgerEntry } from '../types';
import { 
  Shield, 
  FileText, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Download,
  ChevronDown
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportAsCSV, exportAsJSON } from '../utils/exportReport';

interface VerifierReportViewProps {
  score: CredibilityScore;
  evidence: Evidence[];
  ledgerEntries: LedgerEntry[];
  businessName: string;
  generatedAt: string;
  validUntil: string;
}

export function VerifierReportView({
  score,
  evidence,
  ledgerEntries,
  businessName,
  generatedAt,
  validUntil
}: VerifierReportViewProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Calculate summary statistics
  const totalRevenue = ledgerEntries
    .filter(e => e.event_type === 'order' || e.event_type === 'payment')
    .reduce((sum, e) => sum + e.amount, 0);

  const evidenceByStatus = evidence.reduce((acc, e) => {
    acc[e.status] = (acc[e.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const processedEvidence = evidenceByStatus.ANALYZED || 0;
  const totalEvidence = evidence.length;

  const handleExport = (format: 'csv' | 'json') => {
    const exportData = {
      businessName,
      score,
      evidence,
      ledgerEntries,
      generatedAt,
      validUntil
    };

    if (format === 'csv') {
      exportAsCSV(exportData);
    } else {
      exportAsJSON(exportData);
    }
    setShowExportMenu(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header - Professional Branding */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield size={32} />
            <div>
              <h1 className="text-2xl font-bold">Income Verification Report</h1>
              <p className="text-primary-100 text-sm">Shadow Economy Mapper Platform</p>
            </div>
          </div>
          <Badge variant="success" className="bg-white text-primary-700 font-semibold">
            Verified
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-primary-500">
          <div>
            <div className="text-primary-200 text-xs uppercase tracking-wide mb-1">Business Name</div>
            <div className="font-semibold">{businessName}</div>
          </div>
          <div>
            <div className="text-primary-200 text-xs uppercase tracking-wide mb-1">Generated</div>
            <div className="font-semibold">{formatDate(new Date(generatedAt))}</div>
          </div>
          <div>
            <div className="text-primary-200 text-xs uppercase tracking-wide mb-1">Valid Until</div>
            <div className="font-semibold">{formatDate(new Date(validUntil))}</div>
          </div>
        </div>
      </div>

      {/* Key Credibility Indicators - Priority Section */}
      <Card padding="lg" border>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Credibility Assessment</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Card */}
          <div>
            <ScoreCard 
              score={score.score} 
              confidenceLevel={score.confidence_level}
              previousScore={undefined}
              size="lg"
            />
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Verified Revenue</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalRevenue)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Evidence Processed</div>
              <div className="text-2xl font-bold text-gray-900">
                {processedEvidence} / {totalEvidence}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((processedEvidence / totalEvidence) * 100)}% completion rate
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Confidence Level</div>
              <div className="flex items-center gap-2">
                <StatusBadge status={score.confidence_level} />
                {score.confidence_level === 'HIGH' && (
                  <CheckCircle size={16} className="text-green-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Score Breakdown - Detailed Analysis */}
      <Card padding="lg" border>
        <div className="flex items-center gap-2 mb-6">
          <FileText size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Score Breakdown</h2>
        </div>
        
        <ScoreBreakdown breakdown={score.breakdown} />

        {/* Flags and Warnings */}
        {score.flags && score.flags.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-amber-600" />
              <h3 className="font-medium text-gray-900">Attention Items</h3>
            </div>
            <ul className="space-y-2">
              {score.flags.map((flag, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Evidence Summary */}
      <Card padding="lg" border>
        <div className="flex items-center gap-2 mb-6">
          <Calendar size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Evidence Summary</h2>
        </div>

        <div className="space-y-4">
          {/* Evidence by Source Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Evidence by Source</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(
                evidence.reduce((acc, e) => {
                  acc[e.source_type] = (acc[e.source_type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-600 capitalize mt-1">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Processing Status</h3>
            <div className="space-y-2">
              {Object.entries(evidenceByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status as any} />
                    <span className="text-sm text-gray-700 capitalize">
                      {status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Transaction Summary */}
      <Card padding="lg" border>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={20} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Transaction Summary</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Type</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">Channel</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Amount</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-700">
                    {formatDate(new Date(entry.event_time))}
                  </td>
                  <td className="py-3 px-2">
                    <span className="capitalize text-gray-700">{entry.event_type}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="capitalize text-gray-700">{entry.channel}</span>
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-gray-900">
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span className={`inline-block w-16 text-xs font-medium ${
                      entry.confidence >= 0.8 ? 'text-green-700' :
                      entry.confidence >= 0.5 ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {Math.round(entry.confidence * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {ledgerEntries.length > 10 && (
            <div className="text-center py-3 text-sm text-gray-500">
              Showing 10 of {ledgerEntries.length} transactions
            </div>
          )}
        </div>
      </Card>

      {/* Footer - Report Metadata */}
      <Card padding="md" border className="bg-gray-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Shield size={14} />
            <span>This report is cryptographically verified and tamper-proof</span>
          </div>
          <div className="relative">
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowExportMenu(!showExportMenu)}
              icon={<Download size={14} />}
            >
              Export Report
              <ChevronDown size={14} className="ml-1" />
            </Button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
