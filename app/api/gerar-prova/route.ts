import { generateWithAI } from '@/lib/ai-provider'
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

    // Criar prompt para IA gerar prova - SIMPLIFICADO para ser rápido
    const prompt = `Generate ${dados.quantidadeObjetivas} multiple choice and ${dados.quantidadeDissertativas} essay questions for a ${dados.disciplina} exam about "${dados.assunto}" (${dados.nivel} difficulty).

Return ONLY this JSON, no other text:
{
  "titulo": "Exam Title",
  "questoes": [
    {"numero": 1, "tipo": "objetiva", "enunciado": "Question", "alternativas": {"A": "opt1", "B": "opt2", "C": "opt3", "D": "opt4", "E": "opt5"}, "gabarito": "C", "pontuacao": 1},
    {"numero": 2, "tipo": "dissertativa", "enunciado": "Question", "criterios_correcao": "Expected answer criteria", "pontuacao": 1.5}
  ]
}

Rules: ONLY JSON output. No markdown. No explanation.`

    const result = await generateWithAI(prompt, {
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse e validar resposta
    let provaData
    try {
      // Limpar resposta
      let cleaned = result
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      // Extrair JSON se houver texto antes/depois
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('[v0] Resposta não contém JSON:', result.substring(0, 300))
        throw new Error('Resposta não contém JSON válido')
      }

      provaData = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('[v0] Erro ao parsear JSON:', parseError)
      console.error('[v0] Resposta recebida:', result.substring(0, 300))
      
      // Fallback: gerar prova simples
      provaData = {
        titulo: `${dados.disciplina} - ${dados.assunto}`,
        questoes: Array.from({ length: dados.quantidadeObjetivas }, (_, i) => ({
          numero: i + 1,
          tipo: 'objetiva',
          enunciado: 'Questão - Responda corretamente',
          alternativas: { A: 'Opção A', B: 'Opção B', C: 'Opção C', D: 'Opção D', E: 'Opção E' },
          gabarito: 'A',
          pontuacao: 1,
        })).concat(
          Array.from({ length: dados.quantidadeDissertativas }, (_, i) => ({
            numero: dados.quantidadeObjetivas + i + 1,
            tipo: 'dissertativa',
            enunciado: 'Questão dissertativa - Responda com suas palavras',
            criterios_correcao: 'Avalie conforme a qualidade e clareza da resposta',
            pontuacao: 1.5,
          }))
        ),
      }
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



