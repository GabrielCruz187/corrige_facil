import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se turma existe e pertence ao usuário
    const { data: turma, error: turmaError } = await supabase
      .from('turmas')
      .select('*')
      .eq('id', id)
      .eq('professor_id', user.id)
      .single()

    if (turmaError || !turma) {
      return NextResponse.json({ error: 'Turma não encontrada' }, { status: 404 })
    }

    // Buscar todos os alunos da turma
    const { data: alunosTurma, error: alunosError } = await supabase
      .from('alunos_turma')
      .select('aluno_id')
      .eq('turma_id', id)

    if (alunosError) {
      console.error('[v0] Erro ao buscar alunos:', alunosError)
      throw alunosError
    }

    if (!alunosTurma || alunosTurma.length === 0) {
      // Turma sem alunos
      return NextResponse.json({
        mediaGeral: '0',
        totalAlunos: 0,
        alunosComDificuldade: 0,
        insights: [],
        totalAvaliacoes: 0,
      })
    }

    const alunosIds = alunosTurma.map((a: any) => a.aluno_id)

    // Buscar todas as correções dos alunos dessa turma
    const { data: correcoes, error: correcoesError } = await supabase
      .from('correcoes')
      .select(`
        id,
        aluno_id,
        nota_total,
        prova:prova_id (
          disciplina
        )
      `)
      .in('aluno_id', alunosIds)

    if (correcoesError) {
      console.error('[v0] Erro ao buscar correções:', correcoesError)
      throw correcoesError
    }

    if (!correcoes || correcoes.length === 0) {
      // Sem correções ainda
      return NextResponse.json({
        mediaGeral: '0',
        totalAlunos: alunosTurma.length,
        alunosComDificuldade: 0,
        insights: [],
        totalAvaliacoes: 0,
      })
    }

    // Agrupar por disciplina
    const errosPorDisciplina: Record<string, { total: number; erros: number }> = {}

    correcoes.forEach((correcao: any) => {
      const disciplina = correcao.prova?.disciplina || 'Sem Disciplina'
      if (!errosPorDisciplina[disciplina]) {
        errosPorDisciplina[disciplina] = { total: 0, erros: 0 }
      }
      errosPorDisciplina[disciplina].total += 1
      if ((correcao.nota_total || 0) < 6) {
        errosPorDisciplina[disciplina].erros += 1
      }
    })

    // Calcular percentual de erro e ordenar
    const insights = Object.entries(errosPorDisciplina)
      .map(([disciplina, dados]) => ({
        disciplina,
        erroPercent: Math.round((dados.erros / dados.total) * 100),
        totalAlunos: dados.total,
        alunosComDificuldade: dados.erros,
      }))
      .sort((a, b) => b.erroPercent - a.erroPercent)
      .slice(0, 5)

    // Calcular média geral da turma
    const mediaGeral = correcoes.length > 0
      ? (correcoes.reduce((sum: number, c: any) => sum + (c.nota_total || 0), 0) / correcoes.length).toFixed(1)
      : '0'

    // Contar alunos com dificuldade (nota < 6)
    const alunosComDificuldade = new Set(
      correcoes.filter((c: any) => (c.nota_total || 0) < 6).map((c: any) => c.aluno_id)
    ).size

    return NextResponse.json({
      mediaGeral,
      totalAlunos: alunosTurma.length,
      alunosComDificuldade,
      insights,
      totalAvaliacoes: correcoes.length,
    })
  } catch (error: any) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
