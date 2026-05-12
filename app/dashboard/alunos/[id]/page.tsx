'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, TrendingUp, BookOpen } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { PareceGenerator } from '@/components/parecer-generator'

export default function AlunoDetailPage() {
  const params = useParams()
  const alunoId = params.id as string

  const [aluno, setAluno] = useState<any>(null)
  const [historico, setHistorico] = useState([])
  const [turmaId, setTurmaId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [alunoRes, historicoRes] = await Promise.all([
          fetch(`/api/alunos/${alunoId}`),
          fetch(`/api/alunos/${alunoId}/historico`)
        ])

        if (alunoRes.ok) {
          const alunoData = await alunoRes.json()
          setAluno(alunoData)
          if (alunoData.turma_id) setTurmaId(alunoData.turma_id)
        }
        if (historicoRes.ok) {
          setHistorico(await historicoRes.json())
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [alunoId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  if (!aluno) {
    return (
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Aluno não encontrado</p>
      </div>
    )
  }

  const mediaNota = historico.length > 0
    ? (historico.reduce((sum: number, h: any) => sum + (h.nota_total || 0), 0) / historico.length).toFixed(1)
    : '-'

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/dashboard/turmas" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div className="flex flex-col gap-2 sm:gap-0 sm:items-start">
        <h1 className="text-2xl font-bold sm:text-3xl">{aluno.nome}</h1>
        <p className="text-sm text-muted-foreground">Histórico de Notas</p>
        {aluno.matricula && (
          <p className="text-xs text-muted-foreground">Matrícula: {aluno.matricula}</p>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Média Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold">{mediaNota}</div>
            <p className="text-xs text-muted-foreground mt-1">{historico.length} avaliações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maior Nota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-green-600">
              {historico.length > 0 ? Math.max(...historico.map((h: any) => h.nota_total || 0)).toFixed(1) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Menor Nota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl sm:text-4xl font-bold text-orange-600">
              {historico.length > 0 ? Math.min(...historico.map((h: any) => h.nota_total || 0)).toFixed(1) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="evolucao" className="w-full">
        <TabsList className="w-full grid w-full grid-cols-3">
          <TabsTrigger value="evolucao" className="text-xs sm:text-sm">Evolução</TabsTrigger>
          <TabsTrigger value="disciplinas" className="text-xs sm:text-sm">Disciplinas</TabsTrigger>
          <TabsTrigger value="parecer" className="text-xs sm:text-sm">Parecer</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Evolução de Notas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Progresso ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada</p>
                </div>
              ) : (
                <div className="h-64 sm:h-80 -mx-4 sm:-mx-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historico}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis 
                        dataKey={(h: any) => h.prova?.titulo || 'Prova'}
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="nota_total" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disciplinas" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Desempenho por Disciplina</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Média em cada disciplina</CardDescription>
            </CardHeader>
            <CardContent>
              {historico.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BookOpen className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação registrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from(
                    historico.reduce((acc: any, item: any) => {
                      const disciplina = item.prova?.disciplina || 'Sem disciplina'
                      if (!acc[disciplina]) {
                        acc[disciplina] = []
                      }
                      acc[disciplina].push(item)
                      return acc
                    }, {})
                  ).map(([disciplina, notas]: any) => {
                    const media = (notas.reduce((sum: number, n: any) => sum + (n.nota_total || 0), 0) / notas.length).toFixed(1)
                    return (
                      <div key={disciplina} className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border">
                        <div>
                          <p className="font-medium text-sm sm:text-base">{disciplina}</p>
                          <p className="text-xs text-muted-foreground">{notas.length} avaliação(ões)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl sm:text-2xl font-bold">{media}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parecer" className="space-y-4">
          {turmaId ? (
            <PareceGenerator alunoId={alunoId} turmaId={turmaId} alunoNome={aluno?.nome || ''} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Turma não encontrada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg">Todas as Avaliações</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Histórico completo</CardDescription>
        </CardHeader>
        <CardContent>
          {historico.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma avaliação registrada</p>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {historico.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-border/50 bg-card hover:border-primary/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.titulo_prova}</p>
                    <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                      <span>{item.disciplina}</span>
                      <span>•</span>
                      <span>{new Date(item.data_avaliacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <span className="text-lg sm:text-xl font-bold text-primary">{item.nota.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

