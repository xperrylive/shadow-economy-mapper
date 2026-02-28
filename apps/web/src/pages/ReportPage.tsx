import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReportDetail } from '../lib/services';
import { ShareControls } from '../components/ShareControls';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import type { Report, ScoreBreakdown as ScoreBreakdownType } from '../types';
import { Download, ArrowLeft, FileText, Calendar } from 'lucide-react';

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getReportDetail(id)
      .then(setReport)
      .catch(() => setError('Failed to load report.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-red-500 mb-4">{error || 'Report not found.'}</p>
          <Link to="/" className="text-primary-600 hover:underline text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const snapshot = report.data_snapshot ?? {};
  const breakdown = snapshot.breakdown as ScoreBreakdownType | undefined;
  const score = snapshot.score as number | undefined;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/reports" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Report</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <FileText size={14} />
              {report.report_type.toUpperCase()} Report
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(report.created_at).toLocaleDateString('en-MY', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>
        </div>
        {report.pdf_url && (
          <a
            href={report.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition"
          >
            <Download size={16} />
            Download PDF
          </a>
        )}
      </div>

      {/* Score Summary */}
      {score !== undefined && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Score Summary</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{score}</div>
              <div className="text-sm text-gray-500">/ 100</div>
            </div>
            <div className="text-sm text-gray-600">
              <p>This report was generated with a credibility score of <strong>{score}</strong>.</p>
              {'confidence_level' in snapshot && (
                <p className="mt-1">Confidence level: <strong>{String(snapshot.confidence_level)}</strong></p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breakdown */}
      {breakdown && <ScoreBreakdown breakdown={breakdown} />}

      {/* PDF Preview */}
      {report.pdf_url && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">PDF Preview</h2>
          </div>
          <iframe
            src={report.pdf_url}
            title="Report PDF"
            className="w-full border-0"
            style={{ height: '600px' }}
          />
        </div>
      )}

      {/* Share Controls */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Share This Report</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generate a secure link that verifiers (banks, NGOs, government) can use to view this report.
        </p>
        <ShareControls reportId={report.id} />
      </div>
    </div>
  );
}
