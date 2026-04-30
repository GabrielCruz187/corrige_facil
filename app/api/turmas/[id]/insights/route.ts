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

    // Buscar todas as notas dos alunos dessa turma
    const { data: notas, error: notasError } = await supabase
      .from('notas_aluno')
      .select(`
        *,
        alunos_turma:aluno_id (id, nome),
        correcoes:correcao_id (questoes, feedback)
      `)
      .in(
        'aluno_id',
        (
          await supabase
            .from('alunos_turma')
            .select('id')
            .eq('turma_id', id)
        ).data?.map((a: any) => a.id) || []
      )

    if (notasError || !notas) {
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
    }

    // Agrupar erros por disciplina/tópico
    const errosPorDisciplina: Record<string, { total: number; erros: number }> = {}

    notas.forEach((nota: any) => {
      const disciplina = nota.disciplina || 'Sem Disciplina'
      if (!errosPorDisciplina[disciplina]) {
        errosPorDisciplina[disciplina] = { total: 0, erros: 0 }
      }
      errosPorDisciplina[disciplina].total += 1
      if ((nota.nota || 0) < 6) {
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
    const mediaGeral = (notas.reduce((sum: number, n: any) => sum + (n.nota || 0), 0) / notas.length).toFixed(1)

    // Contar alunos com dificuldade (nota < 6)
    const alunosComDificuldade = new Set(
      notas.filter((n: any) => (n.nota || 0) < 6).map((n: any) => n.aluno_id)
    ).size

    return NextResponse.json({
      mediaGeral,
      totalAlunos: new Set(notas.map((n: any) => n.aluno_id)).size,
      alunosComDificuldade,
      insights,
      totalAvaliacoes: notas.length,
    })
  } catch (error: any) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
