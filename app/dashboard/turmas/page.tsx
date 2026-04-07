'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Users, TrendingUp, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface ClassStats {
  turma: string
  media: number
  maiorNota: number
  menorNota: number
  totalAlunos: number
  aprovados: number
  emRisco: number
  questoesComMaiorErro: Array<{ numero: number; erros: number }>
}

export default function ClassDashboard() {
  const [classesStats, setClassesStats] = useState<ClassStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const { data: correcoes } = await supabase
          .from('correcoes')
          .select('turma, nota_total, created_at')
          .not('turma', 'is', null)

        if (!correcoes) return

        // Agrupar por turma
        const grupoPorTurma: Record<string, any> = {}

        correcoes.forEach((corr) => {
          if (!grupoPorTurma[corr.turma]) {
            grupoPorTurma[corr.turma] = {
              turma: corr.turma,
              notas: [],
            }
          }
          grupoPorTurma[corr.turma].notas.push(corr.nota_total || 0)
        })

        // Calcular estatísticas
        const stats = Object.values(grupoPorTurma).map((g: any) => {
          const notas = g.notas.sort((a: number, b: number) => a - b)
          const media = notas.reduce((a: number, b: number) => a + b, 0) / notas.length
          const aprovados = notas.filter((n: number) => n >= 6).length
          const emRisco = notas.filter((n: number) => n >= 4 && n < 6).length

          return {
            turma: g.turma,
            media: media,
            maiorNota: Math.max(...notas),
            menorNota: Math.min(...notas),
            totalAlunos: notas.length,
            aprovados,
            emRisco,
            questoesComMaiorErro: [],
          }
        })

        setClassesStats(stats)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center">Carregando dados...</div>
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Análise de Turmas</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Visualize o desempenho de suas turmas e identifique alunos em risco
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
      ) : classesStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Nenhuma turma encontrada</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {classesStats.map((stats) => (
            <Card key={stats.turma} className="flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl">{stats.turma}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {stats.totalAlunos} alunos
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="rounded-lg bg-primary/10 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">Média</div>
                    <div className="mt-1 text-xl sm:text-2xl font-bold text-primary">
                      {stats.media.toFixed(1)}
                    </div>
                  </div>
                  <div className="rounded-lg bg-green-500/10 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">Aprovados</div>
                    <div className="mt-1 text-xl sm:text-2xl font-bold text-green-600">
                      {stats.aprovados}
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">Em Risco</div>
                    <div className="mt-1 text-xl sm:text-2xl font-bold text-yellow-600">
                      {stats.emRisco}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-500/10 p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">Reprovados</div>
                    <div className="mt-1 text-xl sm:text-2xl font-bold text-red-600">
                      {stats.totalAlunos - stats.aprovados - stats.emRisco}
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div className="mt-4 h-40 sm:h-48 -mx-4 sm:-mx-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: 'Nota', media: stats.media }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="media" fill="url(#colorMedia)" />
                      <defs>
                        <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
