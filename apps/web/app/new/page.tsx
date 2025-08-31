'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, X, AlertCircle } from 'lucide-react'

interface FileUpload {
  file: File
  id: string
  name: string
  size: string
}

export default function NewJob() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [pullPublicData, setPullPublicData] = useState(true)
  
  const [templateFile, setTemplateFile] = useState<FileUpload | null>(null)
  const [financialsFile, setFinancialsFile] = useState<FileUpload | null>(null)
  const [bundleFile, setBundleFile] = useState<FileUpload | null>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'template' | 'financials' | 'bundle') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    let isValid = false
    switch (fileType) {
      case 'template':
        isValid = file.name.endsWith('.pptx')
        break
      case 'financials':
        isValid = file.name.endsWith('.xlsx')
        break
      case 'bundle':
        isValid = file.name.endsWith('.zip')
        break
    }

    if (!isValid) {
      setError(`Invalid file type for ${fileType}. Please select the correct file format.`)
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB')
      return
    }

    // Additional validation for ZIP files
    if (fileType === 'bundle' && file.name.endsWith('.zip')) {
      // Check if it's actually a valid ZIP file
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const bytes = new Uint8Array(arrayBuffer)
          
          // Check ZIP file signature (PK\x03\x04)
          if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4B || bytes[2] !== 0x03 || bytes[3] !== 0x04) {
            setError('The selected file is not a valid ZIP file. Please ensure it is properly compressed.')
            return
          }
          
          // If ZIP validation passes, proceed with the upload
          proceedWithFileUpload(file, fileType)
        } catch (error) {
          setError('Failed to validate ZIP file. Please try again or select a different file.')
        }
      }
      reader.onerror = () => {
        setError('Failed to read file for validation. Please try again.')
      }
      reader.readAsArrayBuffer(file)
    } else {
      // For non-ZIP files, proceed directly
      proceedWithFileUpload(file, fileType)
    }
  }

  const proceedWithFileUpload = (file: File, fileType: 'template' | 'financials' | 'bundle') => {
    const fileUpload: FileUpload = {
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size)
    }

    switch (fileType) {
      case 'template':
        setTemplateFile(fileUpload)
        break
      case 'financials':
        setFinancialsFile(fileUpload)
        break
      case 'bundle':
        setBundleFile(fileUpload)
        break
    }

    setError('')
  }

  const removeFile = (fileType: 'template' | 'financials' | 'bundle') => {
    switch (fileType) {
      case 'template':
        setTemplateFile(null)
        break
      case 'financials':
        setFinancialsFile(null)
        break
      case 'bundle':
        setBundleFile(null)
        break
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!templateFile) {
      setError('Template file is required')
      return
    }

    if (!companyName.trim()) {
      setError('Company name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('company_name', companyName)
      if (website) formData.append('website', website)
      formData.append('pull_public_data', pullPublicData.toString())
      formData.append('template', templateFile.file)
      
      if (financialsFile) {
        formData.append('financials', financialsFile.file)
      }
      
      if (bundleFile) {
        formData.append('bundle', bundleFile.file)
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create job')
      }

      const jobData = await response.json()
      router.push(`/jobs/${jobData.id}`)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New IM</h2>
          <p className="text-gray-600">
            Upload your template and company information to generate a professional Information Memorandum
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website (optional)
                </label>
                <input
                  type="url"
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pullPublicData}
                  onChange={(e) => setPullPublicData(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Fetch public company data (logo, market info)
                </span>
              </label>
            </div>
          </div>

          {/* File Uploads */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
            
            {/* Template File */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PowerPoint Template *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                {templateFile ? (
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-900">{templateFile.name}</span>
                      <span className="text-sm text-gray-500">({templateFile.size})</span>
                      <button
                        type="button"
                        onClick={() => removeFile('template')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="template-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a PowerPoint file</span>
                        <input
                          id="template-upload"
                          name="template-upload"
                          type="file"
                          className="sr-only"
                          accept=".pptx"
                          onChange={(e) => handleFileUpload(e, 'template')}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PPTX up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financials File */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Financial Data (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                {financialsFile ? (
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-900">{financialsFile.name}</span>
                      <span className="text-sm text-gray-500">({financialsFile.size})</span>
                      <button
                        type="button"
                        onClick={() => removeFile('financials')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="financials-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload Excel file</span>
                        <input
                          id="financials-upload"
                          name="financials-upload"
                          type="file"
                          className="sr-only"
                          accept=".xlsx"
                          onChange={(e) => handleFileUpload(e, 'financials')}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">XLSX up to 50MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Document Bundle */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Bundle (optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                {bundleFile ? (
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-12 w-12 text-green-500" />
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-sm text-gray-900">{bundleFile.name}</span>
                      <span className="text-sm text-gray-500">({bundleFile.size})</span>
                      <button
                        type="button"
                        onClick={() => removeFile('bundle')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="bundle-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload ZIP file</span>
                        <input
                          id="bundle-upload"
                          name="bundle-upload"
                          type="file"
                          className="sr-only"
                          accept=".zip"
                          onChange={(e) => handleFileUpload(e, 'bundle')}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">ZIP containing PDFs, PPTs, Word docs up to 50MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !templateFile}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Job...' : 'Create IM Job'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
