import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const provaId = formData.get('provaId') as string

    if (!files.length || !provaId) {
      return NextResponse.json({ error: 'Arquivos e provaId obrigatórios' }, { status: 400 })
    }

    if (files.length > 50) {
      return NextResponse.json({ error: 'Máximo 50 arquivos por vez' }, { status: 400 })
    }

    const uploadedFiles = []

    for (const file of files) {
      try {
        const blob = await put(`batch/${provaId}/${Date.now()}-${file.name}`, file, {
          access: 'private',
        })
        uploadedFiles.push({
          filename: file.name,
          url: blob.url,
          pathname: blob.pathname,
        })
      } catch (error) {
        console.error(`Erro ao fazer upload de ${file.name}:`, error)
      }
    }

    return NextResponse.json({
      uploadedCount: uploadedFiles.length,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
