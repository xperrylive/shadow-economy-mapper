import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { getReports, generateReport } from '../lib/services';
import type { Report } from '../types';
import { FileText, Plus, Eye, Calendar } from 'lucide-react';

export function ReportsListPage() {
  const { currentBusiness } = useBusiness();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentBusiness) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getReports(currentBusiness.id)
      .then((res) => setReports(res.results))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [currentBusiness?.id]);

  const handleGenerate = async () => {
    if (!currentBusiness) return;
    setGenerating(true);
    setGenerateError(null);
    try {
      await generateReport(currentBusiness.id);
      // Poll until the new report appears in the list (max 5 attempts, 1s apart)
      const prevCount = reports.length;
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const res = await getReports(currentBusiness.id);
        if (res.results.length > prevCount) {
          setReports(res.results);
          break;
        }
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.message ||
        (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data?.error ||
        (err as { message?: string })?.message ||
        'Failed to generate report.';
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
        >
          <Plus size={16} />
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {generateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {generateError}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">No reports generated yet.</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            Generate Your First Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/report/${report.id}`}
              className="flex items-center justify-between bg-white rounded-xl shadow p-5 hover:shadow-md transition group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <FileText size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {report.report_type.toUpperCase()} Report
                  </p>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                    <Calendar size={12} />
                    {new Date(report.created_at).toLocaleDateString('en-MY', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 group-hover:text-primary-600 transition">
                <Eye size={16} />
                View
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
