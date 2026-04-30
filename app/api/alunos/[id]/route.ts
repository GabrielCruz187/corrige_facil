import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: aluno, error: alunoError } = await supabase
      .from('alunos_turma')
      .select('*')
      .eq('id', id)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    // Verificar se o professor é o dono da turma do aluno
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('id')
      .eq('id', aluno.turma_id)
      .eq('professor_id', user.id)
      .single()

    if (turmaError || !turma) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    return NextResponse.json(aluno)
  } catch (error) {
    console.error('Erro ao buscar aluno:', error)
    return NextResponse.json({ error: 'Erro ao buscar aluno' }, { status: 500 })
  }
}

