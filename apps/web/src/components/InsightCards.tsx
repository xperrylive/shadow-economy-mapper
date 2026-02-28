import type { InsightCard } from '../types';
import { TrendingUp, Calendar, Lightbulb, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useState } from 'react';

const INSIGHT_CONFIG: Record<InsightCard['type'], { icon: typeof TrendingUp; bgColor: string; iconColor: string; chartType: 'bar' | 'pie' | 'none' }> = {
  peak_day: { icon: Calendar, bgColor: 'bg-teal-50', iconColor: 'text-teal-600', chartType: 'bar' },
  trend: { icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600', chartType: 'bar' },
  recommendation: { icon: Lightbulb, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600', chartType: 'none' },
  coverage: { icon: Layers, bgColor: 'bg-purple-50', iconColor: 'text-purple-600', chartType: 'none' },
};

const COLORS = ['#0d9488', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type ChartPoint = { label?: string; name?: string; value: number };

function getChartData(insight: InsightCard): ChartPoint[] {
  if (!insight.data) return [];

  if (insight.type === 'peak_day') {
    const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const DAY_SHORT  = ['Mon',    'Tue',     'Wed',       'Thu',      'Fri',    'Sat',      'Sun'];
    const dayTotals = (insight.data.day_totals as Record<string, number>) ?? {};
    return DAY_ORDER.map((day, i) => ({
      label: DAY_SHORT[i],
      value: dayTotals[day] ?? 0,
    }));
  }

  if (insight.type === 'trend') {
    return [
      { label: 'Prior 14d',  value: (insight.data.previous_total as number) ?? 0 },
      { label: 'Recent 14d', value: (insight.data.recent_total   as number) ?? 0 },
    ];
  }

  if (insight.type === 'coverage') {
    const channels = (insight.data.channels as string[]) ?? [];
    return channels.map(ch => ({ name: ch, value: 1 }));
  }

  return [];
}

function InsightChart({ type, data }: { type: InsightCard['type']; data: ChartPoint[] }) {
  const config = INSIGHT_CONFIG[type];

  if (config.chartType === 'none' || data.length === 0) {
    return null;
  }

  if (config.chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v: number) => [`RM ${v.toFixed(2)}`, 'Amount']} />
          <Bar dataKey="value" fill="#0d9488" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (config.chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={50}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

interface InsightCardsProps {
  insights: InsightCard[];
}

function InsightCardItem({ insight }: { insight: InsightCard; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = INSIGHT_CONFIG[insight.type] ?? INSIGHT_CONFIG.recommendation;
  const Icon = config.icon;
  const chartData = getChartData(insight);

  // Check for significant changes (>20%)
  const changePercentage = insight.description.match(/(\d+)%/)?.[1];
  const isSignificant = changePercentage && parseInt(changePercentage) > 20;

  return (
    <div
      className={`rounded-lg p-4 ${config.bgColor} border ${isSignificant ? 'border-warning-300 ring-2 ring-warning-200' : 'border-transparent'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/70 ${config.iconColor} flex-shrink-0`}>
          <Icon size={18} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 text-sm">{insight.title}</h3>
            {isSignificant && (
              <span className="text-xs font-medium text-warning-700 bg-warning-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                {changePercentage}% change
              </span>
            )}
          </div>

          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{insight.description}</p>

          {/* Chart visualization */}
          {config.chartType !== 'none' && chartData.length > 0 && (
            <div className="mt-3 bg-white/50 rounded p-2">
              <InsightChart type={insight.type} data={chartData} />
            </div>
          )}

          {/* Expandable "Learn more" section */}
          {insight.type === 'recommendation' && (
            <div className="mt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-gray-700 hover:text-gray-900 font-medium"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? 'Show less' : 'Learn more'}
              </button>

              {expanded && (
                <div className="mt-2 text-xs text-gray-600 bg-white/70 p-3 rounded space-y-2">
                  <p>
                    <strong>Why this matters:</strong> Consistent evidence from multiple sources
                    strengthens your credibility score and improves lender confidence.
                  </p>
                  <p>
                    <strong>What to do:</strong> Upload evidence from different platforms and time periods
                    to show a complete picture of your business activity.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Insights</h2>
        <p className="text-gray-400 text-sm">
          Insights will appear after your score is computed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.map((insight, i) => (
          <InsightCardItem key={i} insight={insight} index={i} />
        ))}
      </div>
    </div>
  );
}
