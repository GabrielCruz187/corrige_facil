'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, TrendingUp, Plus, ArrowLeft, MoreVertical, Trash2, Edit2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TurmaInsights } from '@/components/turma-insights'

export default function TurmaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const turmaId = params.id as string

  const [turma, setTurma] = useState<any>(null)
  const [alunos, setAlunos] = useState([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [turmaRes, alunosRes, insightsRes] = await Promise.all([
          fetch(`/api/turmas/${turmaId}`),
          fetch(`/api/turmas/${turmaId}/alunos`),
          fetch(`/api/turmas/${turmaId}/insights`)
        ])

        if (turmaRes.ok) {
          setTurma(await turmaRes.json())
        }
        if (alunosRes.ok) {
          setAlunos(await alunosRes.json())
        }
        if (insightsRes.ok) {
          setInsights(await insightsRes.json())
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [turmaId])

  const deleteAluno = async (alunoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return

    try {
      const res = await fetch(`/api/turmas/${turmaId}/alunos/${alunoId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setAlunos(alunos.filter(a => a.id !== alunoId))
      }
    } catch (error) {
      console.error('Erro ao excluir aluno:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-muted-foreground">Carregando turma...</p>
        </div>
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Turma não encontrada</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/dashboard/turmas" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{turma.nome}</h1>
          <p className="text-sm text-muted-foreground">{turma.serie}</p>
        </div>
        <Button asChild className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-12">
          <Link href={`/dashboard/turmas/${turmaId}/alunos/novo`}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Aluno
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="alunos" className="w-full">
        <TabsList className="w-full grid w-full grid-cols-2">
          <TabsTrigger value="alunos" className="text-xs sm:text-sm">Alunos ({alunos.length})</TabsTrigger>
          <TabsTrigger value="desempenho" className="text-xs sm:text-sm">Desempenho</TabsTrigger>
        </TabsList>

        <TabsContent value="alunos" className="space-y-4">
          {alunos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum aluno adicionado ainda</p>
                <Button asChild className="mt-4">
                  <Link href={`/dashboard/turmas/${turmaId}/alunos/novo`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Primeiro Aluno
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {alunos.map((aluno: any) => (
                <Card key={aluno.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/alunos/${aluno.id}`}>
                        <p className="font-medium truncate hover:text-primary transition-colors text-sm sm:text-base">{aluno.nome}</p>
                      </Link>
                      {aluno.email && (
                        <p className="text-xs text-muted-foreground truncate sm:text-sm">{aluno.email}</p>
                      )}
                      {aluno.matricula && (
                        <p className="text-xs text-muted-foreground">Matrícula: {aluno.matricula}</p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/alunos/${aluno.id}`}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span className="text-xs sm:text-sm">Ver Histórico</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => deleteAluno(aluno.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span className="text-xs sm:text-sm">Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="desempenho" className="space-y-4">
          {insights ? (
            <TurmaInsights
              insights={insights.insights}
              mediaGeral={insights.mediaGeral}
              alunosComDificuldade={insights.alunosComDificuldade}
              totalAlunos={insights.totalAlunos}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum dado de desempenho disponível</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
