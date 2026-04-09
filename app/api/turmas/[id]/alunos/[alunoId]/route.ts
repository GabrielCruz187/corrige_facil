import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest, { params }: { params: { id: string; alunoId: string } }) {
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

    // Deletar aluno
    const { error } = await supabase
      .from('alunos_turma')
      .delete()
      .eq('id', params.alunoId)
      .eq('turma_id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar aluno:', error)
    return NextResponse.json({ error: 'Erro ao deletar aluno' }, { status: 500 })
  }
}
