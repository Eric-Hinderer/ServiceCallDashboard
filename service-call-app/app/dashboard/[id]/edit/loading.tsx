import { ArrowLeft, Phone, Settings, Users, FileText, Wrench } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Loading Indicator */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="absolute inset-0 w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Service Call</h2>
          <p className="text-gray-600">Please wait while we fetch the details...</p>
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
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-6 space-y-8">
            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Phone className="h-5 w-5 text-blue-600" />
                <div className="h-5 w-40 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Technical Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Wrench className="h-5 w-5 text-blue-600" />
                <div className="h-5 w-36 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Assignment & Status Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <Users className="h-5 w-5 text-blue-600" />
                <div className="h-5 w-44 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Additional Notes Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FileText className="h-5 w-5 text-blue-600" />
                <div className="h-5 w-36 bg-gray-300 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-32 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
              <div className="flex-1 h-12 bg-blue-200 rounded-lg animate-pulse"></div>
              <div className="h-12 w-full sm:w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Additional Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4">
              <div className="h-5 w-32 bg-gray-300 rounded mb-3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4">
              <div className="h-5 w-32 bg-gray-300 rounded mb-3 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  