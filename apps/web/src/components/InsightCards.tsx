import type { InsightCard } from '../types';
import { TrendingUp, Calendar, Lightbulb, Layers } from 'lucide-react';

const INSIGHT_CONFIG: Record<InsightCard['type'], { icon: typeof TrendingUp; bgColor: string; iconColor: string }> = {
  peak_day: { icon: Calendar, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
  trend: { icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
  recommendation: { icon: Lightbulb, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600' },
  coverage: { icon: Layers, bgColor: 'bg-purple-50', iconColor: 'text-purple-600' },
};

interface InsightCardsProps {
  insights: InsightCard[];
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((insight, i) => {
          const config = INSIGHT_CONFIG[insight.type] ?? INSIGHT_CONFIG.recommendation;
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`rounded-lg p-4 ${config.bgColor} border border-transparent`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white/70 ${config.iconColor}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm">{insight.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
