'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    console.error('Project error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-center text-gray-900">
          Unable to Load Project
        </h2>
        <p className="mt-2 text-center text-gray-600">
          {error.message || 'Something went wrong while loading this project'}
        </p>
        <div className="mt-8 space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/projects"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}