import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o professor é o dono da turma
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('id')
      .eq('id', params.id)
      .eq('professor_id', user.id)
      .single()

    if (turmaError || !turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })
    }

    // Buscar alunos
    const { data: alunos, error } = await supabase
      .from('alunos_turma')
      .select('*')
      .eq('turma_id', params.id)
      .order('nome')

    if (error) throw error

    return NextResponse.json(alunos || [])
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
    return NextResponse.json({ error: 'Erro ao buscar alunos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o professor é o dono da turma
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('id')
      .eq('id', params.id)
      .eq('professor_id', user.id)
      .single()

    if (turmaError || !turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })
    }

    const body = await request.json()
    const { nome, email, matricula } = body

    if (!nome) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const { data: aluno, error } = await supabase
      .from('alunos_turma')
      .insert({
        turma_id: params.id,
        nome,
        email,
        matricula,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(aluno)
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error)
    return NextResponse.json({ error: 'Erro ao adicionar aluno' }, { status: 500 })
  }
}
