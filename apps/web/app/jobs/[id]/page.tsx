'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, RefreshCw, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'

interface JobStatus {
  id: string
  company_name: string
  website?: string
  status: 'queued' | 'running' | 'done' | 'error'
  message: string
  download_url?: string
  created_at: string
  updated_at: string
}

const statusConfig = {
  queued: { label: 'Queued', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  running: { label: 'Running', icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  done: { label: 'Complete', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  error: { label: 'Error', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
}

export default function JobStatusPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [job, setJob] = useState<JobStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

  const fetchJobStatus = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch job status')
      }
      const jobData = await response.json()
      setJob(jobData)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobStatus()
  }, [jobId])

  useEffect(() => {
    if (!job || job.status === 'done' || job.status === 'error') {
      return
    }

    // Poll every 3 seconds for running jobs
    const interval = setInterval(() => {
      setPolling(true)
      fetchJobStatus().finally(() => setPolling(false))
    }, 3000)

    return () => clearInterval(interval)
  }, [job?.status])

  const handleDownload = async () => {
    if (!job?.download_url) return
    
    try {
      const response = await fetch(`/api/download/${jobId}`)
      if (!response.ok) {
        throw new Error('Failed to get download URL')
      }
      
      const { url } = await response.json()
      window.open(url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-primary-600 animate-spin" />
          <p className="mt-2 text-gray-600">Loading job status...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-lg font-medium text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error || 'Job not found'}</p>
            <div className="mt-6">
              <Link href="/" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const status = statusConfig[job.status]
  const StatusIcon = status.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Celerentis</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{job.company_name}</h2>
              <p className="text-gray-600">Job ID: {job.id}</p>
              {job.website && (
                <p className="text-gray-600">Website: {job.website}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
              <StatusIcon className="h-4 w-4 mr-2" />
              {status.label}
            </span>
          </div>
        </div>

        {/* Status Card */}
        <div className="card mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Message:</span>
              <span className="text-sm text-gray-900">{job.message}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Created:</span>
              <span className="text-sm text-gray-900">{formatDate(job.created_at)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Last Updated:</span>
              <span className="text-sm text-gray-900">{formatDate(job.updated_at)}</span>
            </div>
          </div>

          {/* Progress indicator for running jobs */}
          {job.status === 'running' && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Processing...</span>
                {polling && <RefreshCw className="h-4 w-4 animate-spin" />}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
          
          <div className="flex space-x-4">
            {job.status === 'done' && job.download_url ? (
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download IM
              </button>
            ) : job.status === 'error' ? (
              <button
                onClick={fetchJobStatus}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button>
            ) : (
              <button
                onClick={fetchJobStatus}
                disabled={polling}
                className="btn-secondary flex items-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${polling ? 'animate-spin' : ''}`} />
                Refresh Status
              </button>
            )}
            
            <Link href="/" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Job Details */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Job ID:</span>
                <span className="ml-2 text-gray-900 font-mono">{job.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Company:</span>
                <span className="ml-2 text-gray-900">{job.company_name}</span>
              </div>
              {job.website && (
                <div>
                  <span className="font-medium text-gray-700">Website:</span>
                  <span className="ml-2 text-gray-900">{job.website}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className="ml-2 text-gray-900">{status.label}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
