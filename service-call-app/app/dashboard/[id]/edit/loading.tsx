export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Page Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 w-64 bg-gray-300 rounded mx-auto animate-pulse"></div>
            <div className="h-4 w-48 bg-gray-200 rounded mx-auto animate-pulse"></div>
            <div className="h-3 w-80 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>

          {/* Status Badge Skeleton */}
          <div className="flex justify-center">
            <div className="h-8 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          </div>

          {/* Main Form Card Skeleton */}
          <div className="bg-white/80 rounded-lg shadow-xl p-6 space-y-8">
            {/* Card Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-5 w-40 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Technical Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-5 w-36 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Assignment & Status Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-5 w-44 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-5 w-36 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-24 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <div className="flex-1 h-12 bg-gray-300 rounded-lg animate-pulse"></div>
              <div className="h-12 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  