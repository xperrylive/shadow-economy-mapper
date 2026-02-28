import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useBusiness } from '../hooks/useBusiness';
import { ScoreCard, ScoreCardEmpty } from '../components/ScoreCard';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { EvidenceTable } from '../components/EvidenceTable';
import { InsightCards } from '../components/InsightCards';
import { getEvidenceList, getScores, computeScore, generateReport } from '../lib/services';
import type { Evidence, CredibilityScore } from '../types';
import { FileText, Upload, MapPin, Tag } from 'lucide-react';

export function DashboardPage() {
  const { currentBusiness } = useBusiness();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [score, setScore] = useState<CredibilityScore | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState(true);
  const [loadingScore, setLoadingScore] = useState(true);
  const [computing, setComputing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!currentBusiness) return;
    const bizId = currentBusiness.id;

    setLoadingEvidence(true);
    setLoadingScore(true);

    try {
      const [evidenceRes, scoresRes] = await Promise.allSettled([
        getEvidenceList(bizId),
        getScores(bizId),
      ]);

      if (evidenceRes.status === 'fulfilled') {
        setEvidence(evidenceRes.value.results);
      }
      if (scoresRes.status === 'fulfilled' && scoresRes.value.results.length > 0) {
        setScore(scoresRes.value.results[0]);
      }
    } finally {
      setLoadingEvidence(false);
      setLoadingScore(false);
    }
  }, [currentBusiness]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompute = async () => {
    if (!currentBusiness) return;
    setComputing(true);
    try {
      await computeScore(currentBusiness.id);
      // Wait briefly for computation, then refresh
      setTimeout(async () => {
        const res = await getScores(currentBusiness.id);
        if (res.results.length > 0) setScore(res.results[0]);
        setComputing(false);
      }, 2000);
    } catch {
      setComputing(false);
    }
  };

  const handleGenerate = async () => {
    if (!currentBusiness) return;
    setGenerating(true);
    try {
      await generateReport(currentBusiness.id);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Header */}
      {currentBusiness && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentBusiness.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {currentBusiness.location && (
                <span className="flex items-center gap-1"><MapPin size={14} />{currentBusiness.location}</span>
              )}
              {currentBusiness.category && (
                <span className="flex items-center gap-1"><Tag size={14} />{currentBusiness.category}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/upload"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition"
            >
              <Upload size={16} />
              Upload Evidence
            </Link>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <FileText size={16} />
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      )}

      {/* Score Section */}
      {loadingScore ? (
        <div className="bg-white rounded-xl shadow p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      ) : score ? (
        <>
          <ScoreCard
            score={score.score}
            confidenceLevel={score.confidence_level}
            computedAt={score.computed_at}
            onCompute={handleCompute}
            computing={computing}
          />
          <ScoreBreakdown breakdown={score.breakdown} />
        </>
      ) : (
        <ScoreCardEmpty onCompute={handleCompute} computing={computing} />
      )}

      {/* Evidence Table */}
      <EvidenceTable evidence={evidence} loading={loadingEvidence} />

      {/* Insights */}
      {score && <InsightCards insights={score.insights} />}
    </div>
  );
}
