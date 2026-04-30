import { createClient } from '@/lib/supabase/server'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { alunoId, turmaId } = await req.json()

    const supabase = createClient()

    // Buscar dados do aluno
    const { data: aluno, error: alunoError } = await supabase
      .from('alunos_turma')
      .select('*')
      .eq('id', alunoId)
      .single()

    if (alunoError || !aluno) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    // Buscar histórico de notas do aluno
    const { data: historico, error: historicoError } = await supabase
      .from('notas_aluno')
      .select('nota, data_avaliacao, titulo_prova, disciplina')
      .eq('aluno_id', alunoId)
      .order('data_avaliacao', { ascending: false })
      .limit(10)

    // Buscar última prova do aluno
    const { data: ultimaProva } = await supabase
      .from('notas_aluno')
      .select('nota, titulo_prova')
      .eq('aluno_id', alunoId)
      .order('data_avaliacao', { ascending: false })
      .limit(1)
      .single()

    // Calcular tendência
    let tendencia = 'variável'
    if (historico && historico.length >= 3) {
      const notasRecentes = historico.slice(0, 3).map((n: any) => n.nota)
      const media = notasRecentes.reduce((a: number, b: number) => a + b, 0) / notasRecentes.length
      const primeiraProva = notasRecentes[0]
      const ultimaNota = notasRecentes[notasRecentes.length - 1]

      if (ultimaNota > primeiraProva) tendencia = 'crescente'
      else if (ultimaNota < primeiraProva) tendencia = 'decrescente'
      else tendencia = 'estável'
    }

    // Gerar prompt para IA
    const prompt = `Como um professor empático e dedicado, escreva um parecer pedagógico de 3 a 5 linhas para o aluno ${aluno.nome}.

Desempenho Atual: Na prova "${ultimaProva?.titulo_prova || 'última avaliação'}", o aluno conseguiu uma nota de ${ultimaProva?.nota || 'pendente'}/10.

Histórico: Seu histórico mostra uma tendência ${tendencia} com uma média de ${historico && historico.length > 0 ? (historico.reduce((a: any, b: any) => a + b.nota, 0) / historico.length).toFixed(1) : 'não disponível'}/10.

Instruções:
- Foque em pontos positivos e áreas de melhoria
- Use linguagem motivadora e construtiva
- Seja específico e prático nas recomendações
- Máximo 5 linhas, linguagem clara e acessível

Parecer:`

    // Chamar IA
    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return NextResponse.json({
      parecer: result.text,
      alunoNome: aluno.nome,
      ultimaNota: ultimaProva?.nota,
      tendencia,
    })
  } catch (error: any) {
    console.error('Erro ao gerar parecer:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
