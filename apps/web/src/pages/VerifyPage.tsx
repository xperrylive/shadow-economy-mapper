/**
 * Public Verification Page — accessible via share token.
 * No auth required.
 */

import { useParams } from 'react-router-dom';

export function VerifyPage() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-2">Business Verification Report</h1>
        <p className="text-gray-500 mb-6">Token: {token}</p>
        {/* TODO (Person 1): Fetch report via /api/reports/verify/{token}/ and display */}
        <div className="text-center py-16 text-gray-400">
          Verified report view will go here
        </div>
      </div>
    </div>
  );
}
