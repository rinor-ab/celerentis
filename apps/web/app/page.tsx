'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react'

// Mock data for demonstration
const mockJobs = [
  {
    id: '1',
    companyName: 'TechCorp Inc.',
    status: 'done',
    createdAt: '2024-01-15T10:30:00Z',
    downloadUrl: '#'
  },
  {
    id: '2',
    companyName: 'StartupXYZ',
    status: 'running',
    createdAt: '2024-01-15T11:00:00Z',
    downloadUrl: null
  },
  {
    id: '3',
    companyName: 'Global Solutions',
    status: 'queued',
    createdAt: '2024-01-15T11:15:00Z',
    downloadUrl: null
  }
]

const statusConfig = {
  queued: { label: 'Queued', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  running: { label: 'Running', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  done: { label: 'Complete', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  error: { label: 'Error', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' }
}

export default function Dashboard() {
  const [jobs] = useState(mockJobs)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Celerentis</h1>
              <span className="ml-2 text-sm text-gray-500">AI IM Generator</span>
            </div>
            <Link
              href="/new"
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New IM
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Jobs</h2>
          <p className="text-gray-600">Track your Information Memorandum generation jobs</p>
        </div>

        {/* Jobs table */}
        <div className="card">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first IM.</p>
              <div className="mt-6">
                <Link href="/new" className="btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New IM
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => {
                    const status = statusConfig[job.status as keyof typeof statusConfig]
                    const StatusIcon = status.icon
                    
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {job.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {job.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {job.status === 'done' ? (
                            <a
                              href={job.downloadUrl}
                              className="text-primary-600 hover:text-primary-900 flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </a>
                          ) : (
                            <Link
                              href={`/jobs/${job.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View Details
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
