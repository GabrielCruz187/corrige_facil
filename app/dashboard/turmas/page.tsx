'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, TrendingUp, BookOpen } from 'lucide-react'
import { Empty } from '@/components/ui/empty'

export default function TurmasPage() {
  const [turmas, setTurmas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTurmas() {
      try {
        const res = await fetch('/api/turmas')
        if (res.ok) {
          const data = await res.json()
          setTurmas(data)
        }
      } catch (error) {
        console.error('Erro ao buscar turmas:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTurmas()
  }, [])

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Minhas Turmas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie suas turmas e alunos</p>
        </div>
        <Button asChild className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-12">
          <Link href="/dashboard/turmas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-2 text-muted-foreground">Carregando turmas...</p>
          </div>
        </div>
      ) : turmas.length === 0 ? (
        <Empty
          icon="BookOpen"
          title="Nenhuma turma criada"
          description="Crie sua primeira turma para começar a gerenciar alunos"
          action={
            <Button asChild>
              <Link href="/dashboard/turmas/nova">
                <Plus className="mr-2 h-4 w-4" />
                Criar Turma
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma: any) => (
            <Link key={turma.id} href={`/dashboard/turmas/${turma.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="line-clamp-2 text-base sm:text-lg">{turma.nome}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm mt-1">{turma.serie}</CardDescription>
                    </div>
                    <div className="flex-shrink-0 inline-flex p-2 sm:p-3 bg-primary/10 rounded-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {turma.descricao && (
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:text-sm">
                      {turma.descricao}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-border">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Alunos</p>
                      <p className="text-lg font-bold sm:text-xl">{turma.alunos_count || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Avaliações</p>
                      <p className="text-lg font-bold sm:text-xl">{turma.avaliacoes_count || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
