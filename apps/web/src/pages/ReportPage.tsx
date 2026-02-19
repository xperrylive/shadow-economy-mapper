/**
 * Report Page — Person 1 builds this out.
 *
 * Shows generated report preview, download PDF, share link creation.
 */

export function ReportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <a href="/" className="text-sm text-primary-600 hover:underline">Back to Dashboard</a>
      </nav>
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Report</h1>
        {/* TODO (Person 1): Report preview, PDF download, share link generation */}
        <div className="bg-white rounded-xl shadow p-6 text-center py-16 text-gray-400">
          Report preview and sharing controls will go here
        </div>
      </main>
    </div>
  );
}
