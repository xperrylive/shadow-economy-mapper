/**
 * Upload Page — Person 1 builds this out.
 */

export function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4">
        <a href="/" className="text-sm text-primary-600 hover:underline">Back to Dashboard</a>
      </nav>
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Upload Evidence</h1>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upload File</h2>
          {/* TODO (Person 1): Drag-and-drop, source type selector, upload progress */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-400">
            Drag and drop your files here, or click to browse
            <br />
            <span className="text-sm">Supports: .txt, .csv, .pdf, .png, .jpg</span>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Manual Entry</h2>
          {/* TODO (Person 1): Date, total sales, order count, notes */}
          <div className="text-center py-8 text-gray-400">Manual entry form will go here</div>
        </section>
      </main>
    </div>
  );
}
