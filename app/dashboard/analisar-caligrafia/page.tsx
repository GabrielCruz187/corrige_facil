'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2, PenTool, TrendingUp, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel } from '@/components/ui/field'

interface HandwritingAnalysis {
  legibilidade: number
  organizacao: number
  consistencia: number
  pressao: number
  nota_media: number
  pontos_positivos: string[]
  melhorias: string[]
  exercicios_recomendados: string[]
  feedback: string
}

export default function HandwritingAnalysisPage() {
  const [nomeAluno, setNomeAluno] = useState('')
  const [imagemUrl, setImagemUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [analise, setAnalise] = useState<HandwritingAnalysis | null>(null)

  async function handleAnalisar() {
    if (!nomeAluno || !imagemUrl) {
      alert('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/analisar-caligrafia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeAluno, imagemUrl }),
      })

      if (!res.ok) throw new Error('Erro ao analisar')

      const data = await res.json()
      setAnalise(data)
    } catch (error) {
      alert('Erro ao analisar caligrafia')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800'
    if (score >= 6) return 'bg-blue-100 text-blue-800'
    return 'bg-orange-100 text-orange-800'
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <PenTool className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          Análise de Caligrafia
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Avalie a qualidade de escrita dos seus alunos com IA
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Dados da Análise</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Forneça a imagem da prova e nome do aluno</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <Field>
              <FieldLabel className="text-sm sm:text-base">Nome do Aluno</FieldLabel>
              <Input
                placeholder="Ex: João Silva"
                value={nomeAluno}
                onChange={(e) => setNomeAluno(e.target.value)}
                className="text-sm"
              />
            </Field>

            <Field>
              <FieldLabel className="text-sm sm:text-base">URL da Imagem</FieldLabel>
              <Input
                type="url"
                placeholder="https://..."
                value={imagemUrl}
                onChange={(e) => setImagemUrl(e.target.value)}
                className="text-sm"
              />
            </Field>

            {imagemUrl && (
              <div className="overflow-hidden rounded-lg border border-border">
                <img src={imagemUrl} alt="Preview" className="max-h-48 w-full object-cover sm:max-h-64" />
              </div>
            )}

            <Button
              onClick={handleAnalisar}
              disabled={loading || !nomeAluno || !imagemUrl}
              size="lg"
              className="w-full text-xs sm:text-sm h-10 sm:h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <PenTool className="mr-2 h-4 w-4" />
                  Analisar Caligrafia
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultados */}
        {analise && (
          <div className="space-y-4 sm:space-y-6">
            {/* Scores */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Avaliação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: 'Legibilidade', value: analise.legibilidade },
                    { label: 'Organização', value: analise.organizacao },
                    { label: 'Consistência', value: analise.consistencia },
                    { label: 'Pressão', value: analise.pressao },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between sm:mb-2">
                        <span className="text-xs font-medium sm:text-sm">{item.label}</span>
                        <Badge className={`text-xs sm:text-sm ${getScoreBadgeColor(item.value)}`}>
                          {item.value}/10
                        </Badge>
                      </div>
                      <Progress value={item.value * 10} className="h-1.5 sm:h-2" />
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 sm:pt-4">
                  <div className="text-center">
                    <p className="mb-1 text-xs text-muted-foreground">Nota Média</p>
                    <p className={`text-3xl font-bold sm:text-4xl ${
                      analise.nota_media >= 8
                        ? 'text-green-600'
                        : analise.nota_media >= 6
                          ? 'text-blue-600'
                          : 'text-orange-600'
                    }`}>
                      {analise.nota_media.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Feedback</CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed sm:text-sm">
                {analise.feedback}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Detailed Results */}
      {analise && (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Pontos Positivos */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Pontos Positivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 sm:space-y-2">
                {analise.pontos_positivos.map((ponto, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-green-600 sm:mt-1.5" />
                    <span>{ponto}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Áreas de Melhoria */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Áreas de Melhoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 sm:space-y-2">
                {analise.melhorias.map((melhoria, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                    <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-orange-600 sm:mt-1.5" />
                    <span>{melhoria}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Exercícios Recomendados */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <PenTool className="h-5 w-5 text-primary" />
                Exercícios Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:gap-4 md:grid-cols-2">
                {analise.exercicios_recomendados.map((exercicio, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-2 sm:gap-3 sm:p-3">
                    <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/20 flex items-center justify-center sm:h-8 sm:w-8">
                      <span className="text-xs font-bold text-primary">{idx + 1}</span>
                    </div>
                    <p className="text-xs sm:text-sm">{exercicio}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
