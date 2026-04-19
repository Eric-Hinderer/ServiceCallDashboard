export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8 text-center space-y-4">
        <div className="text-5xl">📡</div>
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re offline</h1>
        <p className="text-gray-600">
          The Service Call Dashboard can&apos;t reach the network right now.
          Any status changes you already have open will keep working and will sync
          automatically when you&apos;re back online.
        </p>
        <p className="text-sm text-gray-500">
          Tip: reopen the app — recently visited pages are cached and still load.
        </p>
      </div>
    </main>
  );
}
