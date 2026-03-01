import type { ConfidenceLevel } from '../types';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  confidenceLevel: ConfidenceLevel;
  computedAt: string;
  previousScore?: number;
  onCompute?: () => void;
  computing?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 71) return '#22c55e'; // success-500 green
  if (score >= 41) return '#f59e0b'; // warning-500 amber
  return '#ef4444'; // danger-500 red
}

function getScoreColorClasses(score: number): string {
  if (score >= 71) return 'text-success-600';
  if (score >= 41) return 'text-warning-600';
  return 'text-danger-600';
}

function getScoreLabel(score: number): string {
  if (score >= 71) return 'Strong';
  if (score >= 41) return 'Fair';
  return 'Needs Improvement';
}

const CONFIDENCE_CONFIG: Record<ConfidenceLevel, { icon: typeof ShieldCheck; className: string; label: string }> = {
  HIGH: { 
    icon: ShieldCheck, 
    className: 'text-success-600 bg-success-50',
    label: 'High Confidence'
  },
  MEDIUM: { 
    icon: ShieldAlert, 
    className: 'text-warning-600 bg-warning-50',
    label: 'Medium Confidence'
  },
  LOW: { 
    icon: ShieldQuestion, 
    className: 'text-danger-600 bg-danger-50',
    label: 'Low Confidence'
  },
};

export function ScoreCard({ 
  score, 
  confidenceLevel, 
  computedAt, 
  previousScore,
  onCompute, 
  computing 
}: ScoreCardProps) {
  const color = getScoreColor(score);
  const colorClasses = getScoreColorClasses(score);
  const label = getScoreLabel(score);
  const conf = CONFIDENCE_CONFIG[confidenceLevel];
  const ConfIcon = conf.icon;

  // Calculate score change
  const scoreChange = previousScore !== undefined ? score - previousScore : null;
  const hasScoreChange = scoreChange !== null && scoreChange !== 0;

  // SVG circle gauge
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header with title and confidence badge */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">Credibility Score</h2>
        <div 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${conf.className}`}
          role="status"
          aria-label={conf.label}
        >
          <ConfIcon size={14} aria-hidden="true" />
          <span>{conf.label}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Circular gauge visualization */}
        <div className="relative flex-shrink-0" role="img" aria-label={`Score: ${score} out of 100, ${label}`}>
          <svg width="160" height="160" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="80" 
              cy="80" 
              r={radius}
              fill="none" 
              stroke="#f5f5f5" 
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80" 
              cy="80" 
              r={radius}
              fill="none" 
              stroke={color} 
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000 ease-out"
              style={{ 
                transitionProperty: 'stroke-dashoffset, stroke',
              }}
            />
          </svg>
          {/* Score number and label in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span 
              className={`text-4xl font-bold ${colorClasses}`}
              style={{ fontSize: '36px', lineHeight: '1' }}
            >
              {score}
            </span>
            <span className="text-sm text-neutral-500 mt-1">{label}</span>
          </div>
        </div>

        {/* Info section */}
        <div className="flex-1 text-center md:text-left space-y-4">
          {/* Contextual explanation */}
          <p className="text-sm text-neutral-600 leading-relaxed">
            This score shows how confident lenders can be in your income proof. 
            Higher scores improve your chances of loan approval.
          </p>

          {/* Score change indicator */}
          {hasScoreChange && (
            <div 
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                scoreChange! > 0 
                  ? 'bg-success-50 text-success-700' 
                  : 'bg-danger-50 text-danger-700'
              }`}
              role="status"
              aria-live="polite"
            >
              <span>{scoreChange! > 0 ? '↑' : '↓'}</span>
              <span>
                {scoreChange! > 0 ? '+' : ''}{scoreChange} from last time
              </span>
            </div>
          )}

          {/* Last computed timestamp */}
          <p className="text-sm text-neutral-500">
            Last computed: {new Date(computedAt).toLocaleDateString('en-MY', {
              day: 'numeric', 
              month: 'short', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
            })}
          </p>

          {/* Recompute button */}
          {onCompute && (
            <button
              onClick={onCompute}
              disabled={computing}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]"
              aria-label={computing ? 'Computing score' : 'Recompute credibility score'}
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
