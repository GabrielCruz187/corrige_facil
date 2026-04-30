import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { parecer } = await req.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o aluno para verificar existência
    const { data: aluno, error: alunoError } = await supabase
      .from('alunos_turma')
      .select('turma_id')
      .eq('id', id)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    // Verificar se o professor é o dono da turma
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('id')
      .eq('id', aluno.turma_id)
      .eq('professor_id', user.id)
      .single()

    if (turmaError || !turma) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Salvar parecer na tabela de histórico
    const { error: insError } = await supabase
      .from('notas_aluno')
      .insert({
        aluno_id: id,
        nota: 0,
        disciplina: 'Parecer Descritivo',
        titulo_prova: `Parecer de ${new Date().toLocaleDateString('pt-BR')}`,
      })

    if (insError) {
      return NextResponse.json({ error: 'Erro ao salvar parecer' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Parecer salvo com sucesso' })
  } catch (error: any) {
    console.error('Erro ao salvar parecer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar o aluno para verificar existência e permissão
    const { data: aluno, error: alunoError } = await supabase
      .from('alunos_turma')
      .select('turma_id')
      .eq('id', id)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    // Verificar se o professor é o dono da turma
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('id')
      .eq('id', aluno.turma_id)
      .eq('professor_id', user.id)
      .single()

    if (turmaError || !turma) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar últimos pareceres do aluno
    const { data: pareceres, error } = await supabase
      .from('notas_aluno')
      .select('*')
      .eq('aluno_id', id)
      .eq('disciplina', 'Parecer Descritivo')
      .order('data_avaliacao', { ascending: false })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: 'Erro ao buscar pareceres' }, { status: 500 })
    }

    return NextResponse.json(pareceres)
  } catch (error: any) {
    console.error('Erro ao buscar pareceres:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

