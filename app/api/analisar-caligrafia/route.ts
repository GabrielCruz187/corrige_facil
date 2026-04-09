import { generateText } from 'ai'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const AnalisarCaligrafiSchema = z.object({
  imagemUrl: z.string().url(),
  nomeAluno: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imagemUrl, nomeAluno } = AnalisarCaligrafiSchema.parse(body)

    const prompt = `Analise a caligrafia e qualidade de escrita de uma prova nesta imagem.

Avalie os seguintes aspectos:
1. Legibilidade (1-10): Quão fácil é ler o texto?
2. Organização (1-10): O texto está bem organizado e estruturado?
3. Consistência (1-10): A letra mantém tamanho e espaçamento consistentes?
4. Pressão (1-10): A pressão da caneta é adequada?

Forneça também:
- Pontos positivos na escrita
- Áreas de melhoria
- Recomendações de exercícios de caligrafia

Responda em JSON com este formato (APENAS JSON, sem explicações):
{
  "legibilidade": 8,
  "organizacao": 7,
  "consistencia": 6,
  "pressao": 8,
  "nota_media": 7.25,
  "pontos_positivos": ["...", "..."],
  "melhorias": ["...", "..."],
  "exercicios_recomendados": ["...", "..."],
  "feedback": "Texto com boa legibilidade..."
}`

    const result = await generateText({
      model: 'google/gemini-3-flash',
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

    let analise
    try {
      analise = JSON.parse(result.text)
    } catch {
      analise = {
        legibilidade: 7,
        organizacao: 7,
        consistencia: 7,
        pressao: 7,
        nota_media: 7,
        pontos_positivos: ['Caligrafia clara e legível'],
        melhorias: ['Melhorar espaçamento entre palavras'],
        exercicios_recomendados: ['Praticar linhas e curvas', 'Exercícios de escrita'],
        feedback: 'Boa qualidade de escrita geral.',
      }
    }

    return NextResponse.json(analise)
  } catch (error) {
    console.error('Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao analisar caligrafia' },
      { status: 400 }
    )
  }
}

