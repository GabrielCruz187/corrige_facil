import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, TrendingDown, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface InsightsProps {
  insights: Array<{
    disciplina: string
    erroPercent: number
    totalAlunos: number
    alunosComDificuldade: number
  }>
  mediaGeral: number
  alunosComDificuldade: number
  totalAlunos: number
}

export function TurmaInsights({ insights, mediaGeral, alunosComDificuldade, totalAlunos }: InsightsProps) {
  const maisCriticos = insights.slice(0, 3)
  const temProblema = alunosComDificuldade / totalAlunos > 0.3

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Alert crítico */}
      {temProblema && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-xs sm:text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {alunosComDificuldade} de {totalAlunos} alunos têm dificuldades (nota &lt; 6).
            Recomenda-se revisão de conteúdo nas disciplinas críticas.
          </AlertDescription>
        </Alert>
      )}

      {/* Estatísticas Gerais */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1 sm:mb-2">Média Geral</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">{mediaGeral}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1 sm:mb-2">Alunos com Dificuldade</p>
              <p className="text-2xl sm:text-3xl font-bold text-orange-600">{alunosComDificuldade}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1 sm:mb-2">Taxa de Dificuldade</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                {Math.round((alunosComDificuldade / totalAlunos) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Dificuldades */}
      {maisCriticos.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Disciplinas com Maior Dificuldade
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Percentual de alunos com nota &lt; 6</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 sm:h-64 w-full -mx-4 sm:-mx-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maisCriticos}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="disciplina" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    labelFormatter={(label) => `${label}: `}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="erroPercent" radius={[8, 8, 0, 0]}>
                    {maisCriticos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.erroPercent > 60 ? '#dc2626' : '#f97316'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detalhes por Disciplina */}
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5 text-primary" />
              Detalhes por Disciplina
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {insights.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{item.disciplina}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.alunosComDificuldade} de {item.totalAlunos} alunos com dificuldade
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-2 text-right">
                    <p className={`text-lg sm:text-xl font-bold ${
                      item.erroPercent > 60 ? 'text-red-600' : item.erroPercent > 40 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {item.erroPercent}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
