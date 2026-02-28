import { useState } from 'react';
import { shareReport } from '../lib/services';
import type { ShareToken } from '../types';
import { Link2, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ShareControlsProps {
  reportId: string;
}

export function ShareControls({ reportId }: ShareControlsProps) {
  const [expiryHours, setExpiryHours] = useState(72);
  const [shareToken, setShareToken] = useState<ShareToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    setLoading(true);
    setError('');
    try {
      const token = await shareReport(reportId, expiryHours);
      setShareToken(token);
    } catch {
      setError('Failed to create share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareToken) return;
    const url = `${window.location.origin}/verify/${shareToken.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {!shareToken ? (
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Expires In</label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value={24}>24 hours</option>
              <option value={72}>3 days</option>
              <option value={168}>1 week</option>
              <option value={720}>30 days</option>
            </select>
          </div>
          <button
            onClick={handleShare}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            <Link2 size={16} />
            {loading ? 'Creating...' : 'Create Share Link'}
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
            <CheckCircle size={16} />
            Share link created!
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/verify/${shareToken.token}`}
              className="flex-1 px-3 py-2 border rounded-lg bg-white text-sm text-gray-700"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 transition"
            >
              {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock size={12} />
            Expires: {new Date(shareToken.expires_at).toLocaleString('en-MY')}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}
