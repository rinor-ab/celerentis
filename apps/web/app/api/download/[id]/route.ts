import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${API_BASE}/download/${jobId}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to get download URL' },
        { status: response.status }
      )
    }
    
    const downloadData = await response.json()
    return NextResponse.json(downloadData)
    
  } catch (error) {
    console.error('Error getting download URL:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
