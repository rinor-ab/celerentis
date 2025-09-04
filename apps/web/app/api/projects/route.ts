import { NextRequest, NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // For now, just return a mock project since the backend doesn't have projects
    // In a real implementation, this would create a project record
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return NextResponse.json({
      id: projectId,
      name: formData.get('name'),
      domain: formData.get('domain'),
      pullPublicData: formData.get('pullPublicData') === 'true',
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { detail: 'Failed to create project' },
      { status: 500 }
    )
  }
}
