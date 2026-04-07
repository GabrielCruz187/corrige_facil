import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar relatório
    const { data: relatorio, error } = await supabase
      .from('relatorios')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !relatorio) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(relatorio)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 400 }
    )
  }
}
