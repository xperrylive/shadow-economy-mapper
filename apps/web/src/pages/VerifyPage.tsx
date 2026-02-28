import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { verifyReport } from '../lib/services';
import type { VerifyReportResponse } from '../types';
import { ShieldCheck, Clock, AlertTriangle, XCircle } from 'lucide-react';

function getScoreColor(score: number): string {
  if (score >= 71) return 'text-green-600';
  if (score >= 41) return 'text-yellow-600';
  return 'text-red-600';
}

function getScoreBg(score: number): string {
  if (score >= 71) return 'bg-green-50 border-green-200';
  if (score >= 41) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
}

const DIMENSION_LABELS: Record<string, { label: string; max: number }> = {
  activity: { label: 'Activity', max: 30 },
  consistency: { label: 'Consistency', max: 20 },
  longevity: { label: 'Longevity', max: 20 },
  evidence_strength: { label: 'Evidence Strength', max: 25 },
  cross_source: { label: 'Cross-Source', max: 15 },
  penalties: { label: 'Penalties', max: 20 },
};

export function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const [report, setReport] = useState<VerifyReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'expired' | 'not_found' | 'error' | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    verifyReport(token)
      .then(setReport)
      .catch((err) => {
        if (err?.response?.status === 410) setError('expired');
        else if (err?.response?.status === 404) setError('not_found');
        else setError('error');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <Clock size={48} className="mx-auto text-yellow-500 mb-4" />
          <h1 className="text-xl font-bold mb-2">Link Expired</h1>
          <p className="text-gray-500">
            This verification link has expired. Please ask the business owner to generate a new share link.
          </p>
        </div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold mb-2">Not Found</h1>
          <p className="text-gray-500">
            This verification link is invalid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-500">Unable to load the verification report. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with verification badge */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck size={28} />
              <div>
                <h1 className="text-lg font-bold">Verified Business Report</h1>
                <p className="text-primary-100 text-sm">Powered by Shadow Economy Mapper</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Business Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{report.business_name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {report.report_type.toUpperCase()} Report &middot; Generated{' '}
                {new Date(report.generated_at).toLocaleDateString('en-MY', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            {/* Score */}
            <div className={`border rounded-xl p-6 text-center ${getScoreBg(report.score)}`}>
              <p className="text-sm text-gray-600 mb-1">Credibility Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(report.score)}`}>{report.score}</p>
              <p className="text-sm text-gray-500 mt-1">out of 100</p>
              <p className="text-xs mt-2 text-gray-500">
                Confidence: {report.confidence_level}
              </p>
            </div>

            {/* Breakdown */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Score Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(report.breakdown).map(([key, value]) => {
                  const dim = DIMENSION_LABELS[key];
                  if (!dim) return null;
                  const isPenalty = key === 'penalties';
                  const pct = isPenalty
                    ? Math.abs(value as number) / dim.max * 100
                    : (value as number) / dim.max * 100;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isPenalty ? 'text-red-600' : 'text-gray-600'}>{dim.label}</span>
                        <span className={`font-medium ${isPenalty ? 'text-red-600' : ''}`}>
                          {value as number}{isPenalty ? '' : ` / ${dim.max}`}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPenalty ? 'bg-red-400' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Insights */}
            {report.insights.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Insights</h3>
                <div className="space-y-2">
                  {report.insights.map((insight, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">{insight.title}</p>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validity */}
            <div className="border-t pt-4 text-center">
              <p className="text-xs text-gray-400">
                This report is valid until{' '}
                {new Date(report.valid_until).toLocaleDateString('en-MY', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
