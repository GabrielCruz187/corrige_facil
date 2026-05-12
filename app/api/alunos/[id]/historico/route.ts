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
      .select('aluno_id')
      .eq('id', id)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    const { data: historico, error } = await supabase
      .from('correcoes')
      .select(`
        id,
        nota_total,
        created_at,
        prova:prova_id (
          titulo,
          disciplina
        )
      `)
      .eq('aluno_id', aluno.aluno_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Erro ao buscar correções:', error)
      throw error
    }

    return NextResponse.json(historico || [])
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 })
  }
}
