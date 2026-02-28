import { useEffect, useState, useCallback } from 'react';
import { useBusiness } from '../hooks/useBusiness';
import { getLedger } from '../lib/services';
import type { LedgerEntry, Channel } from '../types';
import { Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp: 'WhatsApp',
  grabfood: 'GrabFood',
  shopee: 'Shopee',
  foodpanda: 'Foodpanda',
  lazada: 'Lazada',
  tng: 'Touch n Go',
  bank: 'Bank',
  cash: 'Cash',
  other: 'Other',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  order: 'bg-blue-100 text-blue-700',
  payment: 'bg-green-100 text-green-700',
  payout: 'bg-purple-100 text-purple-700',
  refund: 'bg-red-100 text-red-700',
};

export function LedgerPage() {
  const { currentBusiness } = useBusiness();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [channel, setChannel] = useState<Channel | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLedger = useCallback(async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const res = await getLedger({
        business_id: currentBusiness.id,
        from: dateFrom || undefined,
        to: dateTo || undefined,
        channel: (channel as Channel) || undefined,
        page,
      });
      setEntries(res.results);
      setTotalCount(res.count);
      setHasNext(!!res.next);
      setHasPrev(!!res.previous);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentBusiness, dateFrom, dateTo, channel, page]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleFilter = () => {
    setPage(1);
    fetchLedger();
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setChannel('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ledger</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 transition"
        >
          <Filter size={16} />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel | '')}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="">All Channels</option>
                {Object.entries(CHANNEL_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleFilter}
              className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border text-sm rounded-lg hover:bg-gray-50 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-6 animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No ledger entries found.</p>
            <p className="text-sm text-gray-400 mt-1">
              Upload evidence to populate your ledger.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 text-left">Date/Time</th>
                    <th className="px-6 py-3 text-left">Channel</th>
                    <th className="px-6 py-3 text-left">Type</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="px-6 py-3 text-right">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">
                        {new Date(entry.event_time).toLocaleString('en-MY', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {CHANNEL_LABELS[entry.channel] ?? entry.channel}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          EVENT_TYPE_COLORS[entry.event_type] ?? 'bg-gray-100 text-gray-700'
                        }`}>
                          {entry.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium">
                        {entry.currency} {entry.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className={`text-xs font-medium ${
                          entry.confidence >= 0.7 ? 'text-green-600' :
                          entry.confidence >= 0.4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {Math.round(entry.confidence * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t">
              <p className="text-sm text-gray-500">
                {totalCount} total entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                  className="p-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="p-1.5 border rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
