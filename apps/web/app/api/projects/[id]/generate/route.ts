import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id
    
    // Create FormData for the FastAPI backend
    const formData = new FormData()
    formData.append('company_name', 'Test Company')
    formData.append('website', 'https://example.com')
    formData.append('pull_public_data', 'true')
    
    // Use the template file from examples directory
    try {
      const templatePath = path.join(process.cwd(), '../../examples/template.pptx')
      const templateBuffer = await fs.readFile(templatePath)
      const templateBlob = new Blob([templateBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      })
      const templateFile = new File([templateBlob], 'template.pptx', {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      })
      formData.append('template', templateFile)
    } catch (error) {
      console.error('Could not load template file:', error)
      return NextResponse.json(
        { detail: 'Template file not found. Please upload a PPTX template.' },
        { status: 400 }
      )
    }
    
    // Call the FastAPI backend
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('FastAPI error:', errorData)
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to start generation' },
        { status: response.status }
      )
    }
    
    const jobData = await response.json()
    
    return NextResponse.json({
      jobId: jobData.id,
      message: 'Generation started successfully'
    })
    
  } catch (error) {
    console.error('Error starting generation:', error)
    
    let errorMessage = 'Failed to start generation'
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Backend service is not running. Please start the API server.'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the backend service.'
      } else {
        errorMessage = error.message
      }
    }
    
    return NextResponse.json(
      { detail: errorMessage },
      { status: 500 }
    )
  }
}
