import { useState } from 'react';
import { shareReport } from '../lib/services';
import type { ShareToken } from '../types';
import { 
  Link2, 
  Copy, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  Shield, 
  QrCode,
  X,
  ExternalLink
} from 'lucide-react';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';

interface ShareControlsProps {
  reportId: string;
  businessName?: string;
  onRevoke?: (token: string) => Promise<void>;
}

export function ShareControls({ reportId, businessName, onRevoke }: ShareControlsProps) {
  const [expiryHours, setExpiryHours] = useState(168); // Default 7 days
  const [shareToken, setShareToken] = useState<ShareToken | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [revoking, setRevoking] = useState(false);

  // Privacy options
  const [includePersonalInfo, setIncludePersonalInfo] = useState(true);
  const [includeDetailedBreakdown, setIncludeDetailedBreakdown] = useState(true);

  const handleShare = async () => {
    setShowConfirmation(true);
  };

  const confirmShare = async () => {
    setLoading(true);
    setError('');
    setShowConfirmation(false);
    try {
      const token = await shareReport(reportId, expiryHours);
      setShareToken(token);
    } catch {
      setError('Failed to create share link. Please try again.');
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

  const handleRevoke = async () => {
    if (!shareToken || !onRevoke) return;
    setRevoking(true);
    try {
      await onRevoke(shareToken.token);
      setShareToken(null);
      setError('');
    } catch {
      setError('Failed to revoke access. Please try again.');
    } finally {
      setRevoking(false);
    }
  };

  const shareUrl = shareToken ? `${window.location.origin}/verify/${shareToken.token}` : '';

  return (
    <div className="space-y-4">
      {/* Privacy-First Configuration */}
      {!shareToken && (
        <Card padding="md" border>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <Shield size={18} className="text-primary-600" />
              <h3 className="text-base">Share Settings</h3>
            </div>

            {/* Expiration Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Expires In
              </label>
              <select
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              >
                <option value={168}>7 days (recommended)</option>
                <option value={720}>30 days</option>
                <option value={2160}>90 days</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                The link will automatically expire after this period for your security
              </p>
            </div>

            {/* Privacy Options */}
            <div className="space-y-3 pt-2 border-t">
              <p className="text-sm font-medium text-gray-700">What to share:</p>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePersonalInfo}
                  onChange={(e) => setIncludePersonalInfo(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Personal Information</div>
                  <div className="text-xs text-gray-500">
                    Include business name and contact details
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDetailedBreakdown}
                  onChange={(e) => setIncludeDetailedBreakdown(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Detailed Score Breakdown</div>
                  <div className="text-xs text-gray-500">
                    Show how each factor contributes to your credibility score
                  </div>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowPreview(true)}
                icon={<Eye size={16} />}
                className="flex-1"
              >
                Preview
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleShare}
                loading={loading}
                icon={<Link2 size={16} />}
                className="flex-1"
              >
                Create Share Link
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Share Link Created */}
      {shareToken && (
        <Card padding="md" border className="bg-green-50 border-green-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle size={18} />
              <span>Share link created successfully!</span>
            </div>

            {/* Share URL */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 border border-green-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Share link URL"
              />
              <Button
                variant="outline"
                size="md"
                onClick={handleCopy}
                icon={copied ? <CheckCircle size={16} className="text-green-600" /> : <Copy size={16} />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>

            {/* Expiration Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>
                Expires: {new Date(shareToken.expires_at).toLocaleDateString('en-MY', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })}
              </span>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-green-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(true)}
                icon={<QrCode size={14} />}
              >
                Show QR Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(shareUrl, '_blank')}
                icon={<ExternalLink size={14} />}
              >
                Open Link
              </Button>
              {onRevoke && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRevoke}
                  loading={revoking}
                  icon={<X size={14} />}
                  className="sm:ml-auto"
                >
                  Revoke Access
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card padding="lg" className="max-w-md w-full">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                <Shield size={20} className="text-primary-600" />
                <h3>Confirm Sharing</h3>
              </div>
              
              <p className="text-sm text-gray-600">
                You're about to share your income report with verifiers. This will include:
              </p>

              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your credibility score and confidence level</span>
                </li>
                {includePersonalInfo && (
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Business name and contact information</span>
                  </li>
                )}
                {includeDetailedBreakdown && (
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Detailed score breakdown and evidence summary</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <Clock size={16} className="text-neutral-600 mt-0.5 flex-shrink-0" />
                  <span>Link expires in {expiryHours / 24} days</span>
                </li>
              </ul>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={confirmShare}
                  loading={loading}
                  className="flex-1"
                >
                  Confirm & Share
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* QR Code Modal - Placeholder */}
      {showQR && shareToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card padding="lg" className="max-w-sm w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">QR Code</h3>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                  aria-label="Close QR code"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500 p-4">
                  <QrCode size={48} className="mx-auto mb-2" />
                  <p className="text-sm">QR Code generation coming soon</p>
                  <p className="text-xs mt-1">Use the copy link button for now</p>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setShowQR(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal - Placeholder */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card padding="lg" className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Preview: What Verifiers Will See</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                  aria-label="Close preview"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary-600 mb-2">85</div>
                  <div className="text-sm text-gray-600">Credibility Score</div>
                  <div className="text-xs text-green-600 font-medium mt-1">Strong Confidence</div>
                </div>

                {includePersonalInfo && businessName && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-1">Business Name</div>
                    <div className="text-sm text-gray-900">{businessName}</div>
                  </div>
                )}

                {includeDetailedBreakdown && (
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2">Score Breakdown</div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Activity Level</span>
                        <span className="font-medium">18/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Consistency</span>
                        <span className="font-medium">17/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evidence Strength</span>
                        <span className="font-medium">25/30</span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 pt-4 border-t">
                  This is a preview. Actual report may include additional details.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setShowPreview(false)}
                className="w-full"
              >
                Close Preview
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
