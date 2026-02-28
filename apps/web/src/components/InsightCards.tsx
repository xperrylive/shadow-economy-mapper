import type { InsightCard } from '../types';
import { TrendingUp, Calendar, Lightbulb, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useState } from 'react';

const INSIGHT_CONFIG: Record<InsightCard['type'], { icon: typeof TrendingUp; bgColor: string; iconColor: string; chartType: 'line' | 'pie' | 'bar' | 'none' }> = {
  peak_day: { icon: Calendar, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', chartType: 'bar' },
  trend: { icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600', chartType: 'line' },
  recommendation: { icon: Lightbulb, bgColor: 'bg-yellow-50', iconColor: 'text-yellow-600', chartType: 'none' },
  coverage: { icon: Layers, bgColor: 'bg-purple-50', iconColor: 'text-purple-600', chartType: 'pie' },
};

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function generateMockChartData(type: InsightCard['type']) {
  if (type === 'trend') {
    return [
      { month: 'Jan', value: 45 },
      { month: 'Feb', value: 52 },
      { month: 'Mar', value: 48 },
      { month: 'Apr', value: 61 },
      { month: 'May', value: 58 },
      { month: 'Jun', value: 67 },
    ];
  }
  if (type === 'coverage') {
    return [
      { name: 'WhatsApp', value: 35 },
      { name: 'Bank Statements', value: 25 },
      { name: 'Platform CSVs', value: 20 },
      { name: 'Manual Entries', value: 15 },
      { name: 'Other', value: 5 },
    ];
  }
  if (type === 'peak_day') {
    return [
      { day: 'Mon', transactions: 12 },
      { day: 'Tue', transactions: 15 },
      { day: 'Wed', transactions: 18 },
      { day: 'Thu', transactions: 22 },
      { day: 'Fri', transactions: 28 },
      { day: 'Sat', transactions: 25 },
      { day: 'Sun', transactions: 14 },
    ];
  }
  return [];
}

function InsightChart({ type, data }: { type: InsightCard['type']; data: any[] }) {
  const config = INSIGHT_CONFIG[type];
  
  if (config.chartType === 'none' || data.length === 0) {
    return null;
  }

  if (config.chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
        </LineChart>
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
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (config.chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
}

interface InsightCardsProps {
  insights: InsightCard[];
}

function InsightCardItem({ insight, index }: { insight: InsightCard; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = INSIGHT_CONFIG[insight.type] ?? INSIGHT_CONFIG.recommendation;
  const Icon = config.icon;
  const chartData = generateMockChartData(insight.type);
  
  // Check for significant changes (>20%)
  const hasSignificantChange = insight.description.includes('increase') || insight.description.includes('decrease');
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
