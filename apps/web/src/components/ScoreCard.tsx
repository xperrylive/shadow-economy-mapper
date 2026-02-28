import type { ConfidenceLevel } from '../types';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  confidenceLevel: ConfidenceLevel;
  computedAt: string;
  onCompute?: () => void;
  computing?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 71) return '#22c55e'; // green
  if (score >= 41) return '#eab308'; // yellow
  return '#ef4444'; // red
}

function getScoreLabel(score: number): string {
  if (score >= 71) return 'Good';
  if (score >= 41) return 'Fair';
  return 'Low';
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { icon: typeof ShieldCheck; className: string }> = {
  HIGH: { icon: ShieldCheck, className: 'text-green-600 bg-green-50' },
  MEDIUM: { icon: ShieldAlert, className: 'text-yellow-600 bg-yellow-50' },
  LOW: { icon: ShieldQuestion, className: 'text-red-600 bg-red-50' },
};

export function ScoreCard({ score, confidenceLevel, computedAt, onCompute, computing }: ScoreCardProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const conf = CONFIDENCE_CONFIG[confidenceLevel];
  const ConfIcon = conf.icon;

  // SVG circle gauge
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-lg font-semibold">Credibility Score</h2>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${conf.className}`}>
          <ConfIcon size={14} />
          {confidenceLevel} Confidence
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular gauge */}
        <div className="relative">
          <svg width="150" height="150" className="-rotate-90">
            <circle
              cx="75" cy="75" r={radius}
              fill="none" stroke="#f3f4f6" strokeWidth="10"
            />
            <circle
              cx="75" cy="75" r={radius}
              fill="none" stroke={color} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color }}>{score}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-gray-500">
            Last computed: {new Date(computedAt).toLocaleDateString('en-MY', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {onCompute && (
            <button
              onClick={onCompute}
              disabled={computing}
              className="mt-3 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {computing ? 'Computing...' : 'Recompute Score'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScoreCardEmpty({ onCompute, computing }: { onCompute: () => void; computing?: boolean }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center">
      <h2 className="text-lg font-semibold mb-2">Credibility Score</h2>
      <p className="text-gray-400 mb-4">
        No score computed yet. Upload evidence and compute your first score.
      </p>
      <button
        onClick={onCompute}
        disabled={computing}
        className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
      >
        {computing ? 'Computing...' : 'Compute Score'}
      </button>
    </div>
  );
}
