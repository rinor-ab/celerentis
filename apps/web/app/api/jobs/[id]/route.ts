import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${API_BASE}/jobs/${jobId}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch job status' },
        { status: response.status }
      )
    }
    
    const jobData = await response.json()
    return NextResponse.json(jobData)
    
  } catch (error) {
    console.error('Error fetching job status:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
