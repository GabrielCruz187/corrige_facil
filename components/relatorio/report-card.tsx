'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

interface ReportCardProps {
  relatorio: any
  nomeAluno: string
  nota: number
}

export function ReportCard({ relatorio, nomeAluno, nota }: ReportCardProps) {
  const melhoriaPositiva = relatorio.melhoria_percentual > 0
  const melhoriaClass = melhoriaPositiva ? 'text-green-600' : 'text-orange-600'

  return (
    <div className="space-y-6">
      {/* Main Report Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Relatório Personalizado
              </CardTitle>
              <CardDescription>Análise detalhada do desempenho</CardDescription>
            </div>
            {relatorio.melhoria_percentual !== null && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <TrendingUp className={`w-4 h-4 ${melhoriaClass}`} />
                  <span className={melhoriaClass}>
                    {relatorio.melhoria_percentual > 0 ? '+' : ''}
                    {relatorio.melhoria_percentual.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Melhoria</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Feedback */}
          <div className="rounded-lg bg-card p-4 border border-border/50">
            <p className="text-foreground font-medium leading-relaxed">
              {relatorio.feedback_ia}
            </p>
          </div>

          {/* Weak Points */}
          {relatorio.pontos_fracos && relatorio.pontos_fracos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <h4 className="font-semibold">Pontos para Melhorar</h4>
              </div>
              <div className="space-y-2">
                {relatorio.pontos_fracos.map((ponto: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span>{ponto}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Recommendations */}
          {relatorio.recomendacoes && relatorio.recomendacoes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h4 className="font-semibold">Recomendações de Estudo</h4>
              </div>
              <div className="space-y-2">
                {relatorio.recomendacoes.map((rec: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Topics */}
          {relatorio.proximas_topicos && relatorio.proximas_topicos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h4 className="font-semibold">Próximos Tópicos</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {relatorio.proximas_topicos.map((topico: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="rounded-full">
                    {topico}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground mb-1">Nota Atual</p>
            <p className="text-3xl font-bold text-primary">{nota.toFixed(1)}</p>
          </CardContent>
        </Card>
        {relatorio.nota_anterior && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground mb-1">Nota Anterior</p>
              <p className="text-3xl font-bold text-muted-foreground">
                {relatorio.nota_anterior.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
