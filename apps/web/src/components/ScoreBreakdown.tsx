import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { ScoreBreakdown as ScoreBreakdownType } from '../types';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType;
}

const DIMENSIONS = [
  { key: 'activity', label: 'Activity', max: 30, desc: 'Transaction frequency & volume' },
  { key: 'consistency', label: 'Consistency', max: 20, desc: 'Regularity of sales' },
  { key: 'longevity', label: 'Longevity', max: 20, desc: 'Time span of business' },
  { key: 'evidence_strength', label: 'Evidence', max: 25, desc: 'Quality of sources' },
  { key: 'cross_source', label: 'Cross-Source', max: 15, desc: 'Multi-channel confirmation' },
] as const;

export function ScoreBreakdown({ breakdown }: ScoreBreakdownProps) {
  const data = DIMENSIONS.map((d) => ({
    dimension: d.label,
    value: breakdown[d.key],
    max: d.max,
    // Normalize to 0-100 for radar display
    normalized: Math.round((breakdown[d.key] / d.max) * 100),
    description: d.desc,
  }));

  const hasPenalties = breakdown.penalties < 0;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Radar Chart */}
        <div className="flex-1" style={{ minHeight: 280 }}>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white shadow-lg border rounded-lg px-3 py-2 text-sm">
                      <p className="font-medium">{d.dimension}</p>
                      <p className="text-gray-500">{d.description}</p>
                      <p className="text-primary-600 font-semibold">{d.value} / {d.max}</p>
                    </div>
                  );
                }}
              />
              <Radar
                dataKey="normalized"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar list */}
        <div className="flex-1 space-y-3">
          {DIMENSIONS.map((d) => {
            const value = breakdown[d.key];
            const pct = (value / d.max) * 100;
            return (
              <div key={d.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{d.label}</span>
                  <span className="font-medium">{value} / {d.max}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Penalties */}
          {hasPenalties && (
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600">Penalties</span>
                <span className="font-medium text-red-600">{breakdown.penalties}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full"
                  style={{ width: `${Math.abs(breakdown.penalties / 20) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
