import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    // Store files temporarily in session storage or similar
    // For now, just return success since we'll handle file upload in the generation step
    
    return NextResponse.json({
      message: 'Files uploaded successfully',
      fileCount: files.length,
      files: files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    })
    
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { detail: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
