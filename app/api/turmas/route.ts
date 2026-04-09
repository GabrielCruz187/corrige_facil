import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: turmas, error } = await supabase
      .from('turmas')
      .select(`
        id,
        nome,
        serie,
        descricao,
        created_at,
        alunos_turma(count)
      `)
      .eq('professor_id', user.id)

    if (error) throw error

    const turmasComCounts = turmas?.map(t => ({
      ...t,
      alunos_count: t.alunos_turma[0]?.count || 0,
      avaliacoes_count: 0
    })) || []

    return NextResponse.json(turmasComCounts)
  } catch (error) {
    console.error('Erro ao buscar turmas:', error)
    return NextResponse.json({ error: 'Erro ao buscar turmas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { nome, serie, descricao } = body

    if (!nome || !serie) {
      return NextResponse.json({ error: 'Nome e série são obrigatórios' }, { status: 400 })
    }

    const { data: turma, error } = await supabase
      .from('turmas')
      .insert({
        professor_id: user.id,
        nome,
        serie,
        descricao,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(turma)
  } catch (error) {
    console.error('Erro ao criar turma:', error)
    return NextResponse.json({ error: 'Erro ao criar turma' }, { status: 500 })
  }
}
