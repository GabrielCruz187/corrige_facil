import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: turma, error } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', params.id)
      .eq('professor_id', user.id)
      .single()

    if (error || !turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })
    }

    return NextResponse.json(turma)
  } catch (error) {
    console.error('Erro ao buscar turma:', error)
    return NextResponse.json({ error: 'Erro ao buscar turma' }, { status: 500 })
  }
}
