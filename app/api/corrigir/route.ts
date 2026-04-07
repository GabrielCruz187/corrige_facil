import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CorrectionSchema = z.object({
  imagemUrl: z.string().url(),
  provaId: z.string().uuid(),
  nomeAluno: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imagemUrl, provaId, nomeAluno } = CorrectionSchema.parse(body)

    // Autenticar usuário
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar prova e questões
    const { data: prova } = await supabase
      .from('provas')
      .select('*, questoes:questoes(*)')
      .eq('id', provaId)
      .eq('user_id', user.id)
      .single()

    if (!prova) {
      return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 })
    }

    const questoes = prova.questoes || []

    if (questoes.length === 0) {
      return NextResponse.json(
        { error: 'A prova não possui questões' },
        { status: 400 }
      )
    }

    // Preparar prompt para IA com base nas questões
    const questoesTexto = questoes
      .map((q: any) => {
        const tipo = q.tipo === 'objetiva' ? 'Objetiva' : 'Dissertativa'
        const gabarito = q.alternativa_correta ? `Gabarito: ${q.alternativa_correta}` : ''
        const criterios = q.criterios_correcao ? `Critérios: ${q.criterios_correcao}` : ''
        return `Questão ${q.numero} (${tipo}): ${q.enunciado}\n${gabarito}\n${criterios}`
      })
      .join('\n\n')

    const prompt = `Você é um professor experiente de educação. Analise a imagem da prova do aluno e corrija-a.

QUESTÕES E GABARITO:
${questoesTexto}

IMPORTANTE:
1. Analise cada questão na imagem
2. Para questões objetivas, verifique se a resposta corresponde ao gabarito
3. Para questões dissertativas, analise a qualidade da resposta conforme os critérios
4. Forneça feedback construtivo para cada questão
5. Atribua uma nota de 0-10 para cada questão

Retorne a resposta em JSON com a seguinte estrutura:
{
  "questoes": [
    {
      "numero": 1,
      "resposta_aluno": "resposta identificada",
      "correta": true/false,
      "nota": 0-10,
      "feedback": "feedback detalhado"
    }
  ],
  "nota_total": nota_final_0_a_100,
  "resumo": "resumo geral da prova"
}`

    // Chamar IA com visão computacional
    const result = await generateText({
      model: 'google/gemini-2.0-flash',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image',
              image: imagemUrl,
            },
          ],
        },
      ],
    })

    // Parse resposta da IA
    let correcaoData
    try {
      // Extrair JSON da resposta
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Nenhum JSON encontrado na resposta')
      }
      correcaoData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Erro ao fazer parse da resposta IA:', parseError)
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

    // Salvar correção no banco
    const { data: correcao, error: correcaoError } = await supabase
      .from('correcoes')
      .insert({
        prova_id: provaId,
        user_id: user.id,
        nome_aluno: nomeAluno,
        nota_total: correcaoData.nota_total,
        acertos: correcaoData.questoes.filter((q: any) => q.correta).length,
        erros: correcaoData.questoes.filter((q: any) => !q.correta).length,
        status: 'corrigido',
        imagem_url: imagemUrl,
      })
      .select()
      .single()

    if (correcaoError) {
      console.error('Erro ao salvar correção:', correcaoError)
      return NextResponse.json(
        { error: 'Erro ao salvar correção' },
        { status: 500 }
      )
    }

    // Salvar respostas individuais
    const respostasData = correcaoData.questoes.map((r: any) => ({
      correcao_id: correcao.id,
      questao_id: questoes[r.numero - 1]?.id,
      resposta_aluno: r.resposta_aluno,
      nota: r.nota,
      correta: r.correta,
      feedback_ia: r.feedback,
    }))

    const { error: respostasError } = await supabase
      .from('respostas')
      .insert(respostasData)

    if (respostasError) {
      console.error('Erro ao salvar respostas:', respostasError)
    }

    return NextResponse.json({
      correcaoId: correcao.id,
      notaTotal: correcaoData.nota_total,
      acertos: correcaoData.questoes.filter((q: any) => q.correta).length,
      erros: correcaoData.questoes.filter((q: any) => !q.correta).length,
      resumo: correcaoData.resumo,
      questoes: correcaoData.questoes,
    })
  } catch (error) {
    console.error('Erro na correção:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Erro ao corrigir prova' },
      { status: 500 }
    )
  }
}
