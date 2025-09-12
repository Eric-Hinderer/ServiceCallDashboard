import { Settings, Clock, Users, AlertCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-64 bg-gray-300 rounded animate-pulse"></div>
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-800 text-xs font-medium">Live</span>
            </div>
          </div>
          <div className="h-10 w-36 bg-blue-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Statistics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <div className="h-4 w-20 bg-blue-300 rounded"></div>
            </div>
            <div className="h-8 w-12 bg-blue-400 rounded mb-1"></div>
            <div className="h-3 w-28 bg-blue-300 rounded"></div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-amber-600" />
              <div className="h-4 w-20 bg-amber-300 rounded"></div>
            </div>
            <div className="h-8 w-12 bg-amber-400 rounded mb-1"></div>
            <div className="h-3 w-28 bg-amber-300 rounded"></div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div className="h-4 w-20 bg-red-300 rounded"></div>
            </div>
            <div className="h-8 w-12 bg-red-400 rounded mb-1"></div>
            <div className="h-3 w-28 bg-red-300 rounded"></div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-green-600" />
              <div className="h-4 w-20 bg-green-300 rounded"></div>
            </div>
            <div className="h-8 w-12 bg-green-400 rounded mb-1"></div>
            <div className="h-3 w-28 bg-green-300 rounded"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-48 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="p-0">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-10 gap-4 px-6 py-3">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
            
            {/* Table Rows */}
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <div className="grid grid-cols-10 gap-4 px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center mt-8">
          <div className="flex justify-center items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading service calls...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
