import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export async function GET() {
  try {
    // Fetch all jobs from the FastAPI backend
    const response = await fetch(`${API_BASE}/jobs`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('FastAPI error:', errorData)
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch jobs' },
        { status: response.status }
      )
    }
    
    const jobsData = await response.json()
    return NextResponse.json(jobsData)
    
  } catch (error) {
    console.error('Error fetching jobs:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the backend service. Please try again later.'
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('FastAPI error:', errorData)
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to create job' },
        { status: response.status }
      )
    }
    
    const jobData = await response.json()
    return NextResponse.json(jobData)
    
  } catch (error) {
    console.error('Error creating job:', error)
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the backend service. Please try again later.'
      } else if (error.message.includes('form')) {
        errorMessage = 'Invalid form data. Please check your inputs and try again.'
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
