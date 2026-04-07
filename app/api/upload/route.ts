import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP.' },
        { status: 400 }
      )
    }

    // Validar tamanho (máx 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    // Upload para Vercel Blob (privado)
    const blob = await put(file.name, file, {
      access: 'public',
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}
