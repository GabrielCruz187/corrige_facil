import { generateText } from 'ai'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const GerarProvaSchema = z.object({
  assunto: z.string().min(1),
  nivel: z.enum(['facil', 'medio', 'dificil']),
  quantidadeObjetivas: z.number().min(0).max(20),
  quantidadeDissertativas: z.number().min(0).max(10),
  disciplina: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const dados = GerarProvaSchema.parse(body)

    // Criar prompt para IA gerar prova
    const prompt = `Gere uma prova de ${dados.disciplina} com as seguintes características:

Tema: ${dados.assunto}
Nível: ${dados.nivel === 'facil' ? 'Fácil (básico)' : dados.nivel === 'medio' ? 'Médio (intermediário)' : 'Difícil (avançado)'}
Questões Objetivas (A, B, C, D, E): ${dados.quantidadeObjetivas}
Questões Dissertativas: ${dados.quantidadeDissertativas}

Gere a prova em formato JSON com a seguinte estrutura:
{
  "titulo": "Nome da Prova",
  "questoes": [
    {
      "numero": 1,
      "tipo": "objetiva",
      "enunciado": "...",
      "alternativas": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "...",
        "E": "..."
      },
      "gabarito": "C",
      "pontuacao": 1.0
    },
    {
      "numero": X,
      "tipo": "dissertativa",
      "enunciado": "...",
      "criterios_correcao": "Espera-se que o aluno...",
      "pontuacao": 1.5
    }
  ]
}

IMPORTANTE:
- Gere EXATAMENTE ${dados.quantidadeObjetivas} questões objetivas
- Gere EXATAMENTE ${dados.quantidadeDissertativas} questões dissertativas
- Todas as questões devem estar alinhadas ao tema "${dados.assunto}"
- As questões dissertativas devem ter critérios de correção claros
- Responda APENAS com o JSON válido, sem explicações adicionais`

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Parse e validar resposta
    let provaData
    try {
      provaData = JSON.parse(result.text)
    } catch {
      return NextResponse.json(
        { error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

    return NextResponse.json(provaData)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar prova' },
      { status: 400 }
    )
  }
}
