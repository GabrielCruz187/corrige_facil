import { generateWithAI } from '@/lib/ai-provider'
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
    const supabase = await createClient()
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

    const prompt = `Output only JSON. No other text.

Questions:
${questoesTexto}

Return this exact format:
{"questoes":[{"numero":1,"resposta_aluno":"answer","correta":true,"nota":10,"feedback":"comment"}],"nota_total":10,"resumo":"summary"}

Rules:
1. ONLY JSON output
2. No code, no explanation
3. Field values: numero (number), resposta_aluno (text), correta (true/false), nota (0-10), feedback (text)
4. nota_total = average of all notas
5. Nothing before or after JSON`

    // Chamar IA com visão computacional
    const result = await generateWithAI(
      `${prompt}\n\nIMAGEM DA PROVA:\n[URL: ${imagemUrl}]`,
      {
        temperature: 0.5,
        maxTokens: 2000,
      }
    )

    // Parse resposta da IA
    let correcaoData
    try {
      // Limpar resposta de caracteres desnecessários
      let cleanedResult = result
        .replace(/```json\n?/g, '') // Remove ```json
        .replace(/```\n?/g, '')      // Remove ```
        .trim()

      // Extrair JSON da resposta
      const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[v0] Resposta da IA:', cleanedResult.substring(0, 500))
        console.warn('[v0] JSON não encontrado. Criando resposta fallback.')
        
        // Fallback: criar resposta padrão se a IA não conseguir
        correcaoData = criarRespostaFallback(questoes)
      } else {
        let jsonStr = jsonMatch[0]
        
        // Remover caracteres de controle e normalize
        jsonStr = jsonStr
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove caracteres de controle
          .replace(/,\s*}/g, '}')           // Remove vírgulas antes de }
          .replace(/,\s*]/g, ']')           // Remove vírgulas antes de ]
        
        correcaoData = JSON.parse(jsonStr)
      }
    } catch (parseError) {
      console.error('[v0] Erro ao fazer parse:', parseError)
      console.error('[v0] Resposta recebida:', result.substring(0, 200))
      
      // Fallback final
      correcaoData = criarRespostaFallback(questoes)
    }

    // Função fallback para criar resposta padrão
    function criarRespostaFallback(questoes: any[]) {
      const questoesData = questoes.map((q, idx) => ({
        numero: idx + 1,
        resposta_aluno: 'Não foi possível analisar automaticamente',
        correta: false,
        nota: 0,
        feedback: 'Por favor, revise a prova manualmente. O modelo de IA teve dificuldade em processar a imagem.'
      }))

      return {
        questoes: questoesData,
        nota_total: 0,
        resumo: 'Correção automática indisponível. Revise manualmente.'
      }
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



