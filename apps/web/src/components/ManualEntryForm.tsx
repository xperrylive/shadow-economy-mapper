import { useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ManualEntryFormProps {
  onSubmit: (data: {
    date: string;
    total_sales: number;
    order_count?: number;
    notes?: string;
  }) => Promise<void>;
  submitting: boolean;
  result: { success: boolean; message: string } | null;
  onClearResult: () => void;
}

export function ManualEntryForm({ onSubmit, submitting, result, onClearResult }: ManualEntryFormProps) {
  const [date, setDate] = useState('');
  const [totalSales, setTotalSales] = useState('');
  const [orderCount, setOrderCount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      date,
      total_sales: parseFloat(totalSales),
      order_count: orderCount ? parseInt(orderCount) : undefined,
      notes: notes || undefined,
    });
    setDate('');
    setTotalSales('');
    setOrderCount('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Sales (RM)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 350.00"
            value={totalSales}
            onChange={(e) => setTotalSales(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Order Count <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="number"
          min="0"
          placeholder="e.g. 15"
          value={orderCount}
          onChange={(e) => setOrderCount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          placeholder="e.g. Pasar malam Thursday, sold out by 8pm"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
        />
      </div>

      {/* Result Message */}
      {result && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="flex-1">{result.message}</span>
          <button type="button" onClick={onClearResult} className="p-1 hover:bg-black/5 rounded">
            <X size={14} />
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Add Manual Entry'}
      </button>
    </form>
  );
}
