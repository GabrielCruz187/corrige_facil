'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MoreVertical, Pencil, Trash2, BookOpen } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProvaCardProps {
  prova: {
    id: string
    titulo: string
    disciplina: string
    turma?: string
    total_questoes: number
    created_at: string
    questoes?: Array<{ count: number }>
  }
}

export function ProvaCard({ prova }: ProvaCardProps) {
  const questionCount = prova.questoes?.[0]?.count || prova.total_questoes || 0
  const createdDate = new Date(prova.created_at).toLocaleDateString('pt-BR')

  return (
    <Card className="relative flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="line-clamp-2 text-sm sm:text-base">{prova.titulo}</CardTitle>
            <CardDescription className="mt-1 line-clamp-1 text-xs sm:text-sm">
              {prova.disciplina}
              {prova.turma && ` • ${prova.turma}`}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/provas/${prova.id}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Visualizar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/provas/${prova.id}/editar`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span className="text-xs sm:text-sm">Editar</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Excluir</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 justify-between pb-3 sm:pb-4 text-xs sm:text-sm">
        <span className="text-muted-foreground truncate">
          {questionCount} {questionCount === 1 ? 'questão' : 'questões'}
        </span>
        <span className="text-muted-foreground flex-shrink-0 ml-2">{createdDate}</span>
      </CardContent>
    </Card>
  )
}
