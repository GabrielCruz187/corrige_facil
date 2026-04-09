import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const GerarRelatorioSchema = z.object({
  correcaoId: z.string().uuid(),
  nomeAluno: z.string().min(1),
  notaTotal: z.number().min(0).max(10),
  acertos: z.number().min(0),
  erros: z.number().min(0),
  respostas: z.array(z.object({
    questao: z.number(),
    correta: z.boolean(),
    resposta: z.string(),
    feedback: z.string().optional(),
  })),
  disciplina: z.string(),
  turma: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dados = GerarRelatorioSchema.parse(body)

    // Autenticar usuário
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Buscar última nota do aluno (se houver)
    const { data: correcoesAnteriores } = await supabase
      .from('correcoes')
      .select('nota_total')
      .eq('user_id', user.id)
      .lt('created_at', new Date(new Date().setDate(new Date().getDate() - 30)).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    const notaAnterior = correcoesAnteriores?.[0]?.nota_total
    const melhoriaPercentual = notaAnterior
      ? ((dados.notaTotal - notaAnterior) / notaAnterior) * 100
      : 0

    // Preparar dados para IA
    const respostasErradas = dados.respostas.filter((r) => !r.correta)
    const topicosErrados = respostasErradas.map((r) => `Questão ${r.questao}`)

    // Chamar IA para gerar feedback e recomendações
    const prompt = `Analise o desempenho de um aluno em uma prova de ${dados.disciplina}${
      dados.turma ? ` (${dados.turma})` : ''
    }.

Dados:
- Aluno: ${dados.nomeAluno}
- Nota: ${dados.notaTotal}/10
- Acertos: ${dados.acertos}/${dados.acertos + dados.erros}
- Melhoria desde última avaliação: ${melhoriaPercentual.toFixed(1)}%

Questões erradas:
${respostasErradas.map((r) => `- Questão ${r.questao}: ${r.feedback || 'Resposta incorreta'}`).join('\n')}

Gere:
1. Um feedback construtivo e motivador em 2-3 frases
2. 3-4 tópicos principais de estudo recomendados
3. 2 próximos assuntos sugeridos para avançar

Responda em JSON com este formato:
{
  "feedback": "...",
  "recomendacoes": ["...", "...", "..."],
  "proximas_topicos": ["...", "..."]
}

IMPORTANTE: Responda APENAS com o JSON, sem explicações adicionais.`

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse resposta JSON
    let relatorioData
    try {
      relatorioData = JSON.parse(result.text)
    } catch {
      // Se IA não retornar JSON válido, gerar padrão
      relatorioData = {
        feedback: `Ótimo trabalho! Você acertou ${dados.acertos} questões. Continue estudando os tópicos com mais dificuldade.`,
        recomendacoes: topicosErrados.slice(0, 3),
        proximas_topicos: ['Avance para o próximo capítulo', 'Pratique exercícios similares'],
      }
    }

    // Salvar relatório no banco
    const { data: relatorio, error } = await supabase
      .from('relatorios')
      .insert({
        correcao_id: dados.correcaoId,
        user_id: user.id,
        pontos_fracos: topicosErrados,
        feedback_ia: relatorioData.feedback,
        recomendacoes: relatorioData.recomendacoes,
        proximas_topicos: relatorioData.proximas_topicos,
        nota_anterior: notaAnterior,
        melhoria_percentual: melhoriaPercentual,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar relatório:', error)
      return NextResponse.json(
        { error: 'Erro ao gerar relatório' },
        { status: 500 }
      )
    }

    return NextResponse.json(relatorio)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 400 }
    )
  }
}

