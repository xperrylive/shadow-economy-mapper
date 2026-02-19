/**
 * Dashboard Page — Person 1 builds this out.
 *
 * Shows:
 * - Business overview
 * - Evidence list with status
 * - Credibility score + breakdown chart
 * - Insight cards
 * - Quick actions (upload, generate report)
 */

import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Shadow Economy Mapper</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={signOut} className="text-sm text-red-500 hover:underline">
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Score Card */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Credibility Score</h2>
          {/* TODO (Person 1): Implement score display with breakdown chart */}
          <div className="text-center py-8 text-gray-400">
            Score visualization will go here (Recharts)
          </div>
        </section>

        {/* Evidence List */}
        <section className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Evidence</h2>
            <a
              href="/upload"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition"
            >
              + Upload Evidence
            </a>
          </div>
          {/* TODO (Person 1): Implement evidence list with status badges */}
          <div className="text-center py-8 text-gray-400">
            Evidence list with status tracking will go here
          </div>
        </section>

        {/* Insights */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Insights</h2>
          {/* TODO (Person 1): Implement insight cards */}
          <div className="text-center py-8 text-gray-400">
            Insight cards will go here
          </div>
        </section>
      </main>
    </div>
  );
}
