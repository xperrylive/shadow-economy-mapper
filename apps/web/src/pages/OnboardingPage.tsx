import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBusiness } from '../lib/services';
import { useBusiness } from '../hooks/useBusiness';
import type { Channel } from '../types';
import { Building2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'food_home', label: 'Home-based Food' },
  { value: 'food_stall', label: 'Food Stall / Hawker' },
  { value: 'food_delivery', label: 'Food Delivery' },
  { value: 'retail', label: 'Retail / Market Vendor' },
  { value: 'service', label: 'Services (Cleaning, Tuition, etc.)' },
  { value: 'craft', label: 'Handmade / Craft' },
  { value: 'other', label: 'Other' },
];

const CHANNEL_OPTIONS: { value: Channel; label: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'grabfood', label: 'GrabFood' },
  { value: 'shopee', label: 'Shopee' },
  { value: 'foodpanda', label: 'Foodpanda' },
  { value: 'lazada', label: 'Lazada' },
  { value: 'tng', label: 'Touch n Go' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'cash', label: 'Cash' },
  { value: 'other', label: 'Other' },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { refresh } = useBusiness();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleChannel = (ch: Channel) => {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (channels.length === 0) {
      setError('Please select at least one sales channel.');
      return;
    }
    setSubmitting(true);
    try {
      await createBusiness({ name, category, location, channels });
      await refresh();
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create business profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Building2 size={24} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">Set Up Your Business</h1>
        </div>
        <p className="text-gray-500 mb-6">
          Tell us about your business so we can start building your credibility profile.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              placeholder="e.g. Kak Lina's Kuih"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="e.g. Shah Alam, Selangor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sales Channels</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CHANNEL_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleChannel(value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                    channels.includes(value)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Business Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
