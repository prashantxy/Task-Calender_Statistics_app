import { Calendar } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-4 rounded-full animate-pulse">
            <Calendar className="h-8 w-8 text-white animate-bounce" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading Your Calendar Data
        </h2>
        <p className="text-gray-600 mb-4">
          Analyzing your events and generating insights...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}