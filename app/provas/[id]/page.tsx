import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, Upload, FileText } from "lucide-react"

interface ProvaPageProps {
  params: Promise<{ id: string }>
}

export default async function ProvaPage({ params }: ProvaPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: prova } = await supabase
    .from("provas")
    .select(`
      *,
      questoes (*)
    `)
    .eq("id", id)
    .single()

  if (!prova) {
    notFound()
  }

  const questoes = prova.questoes || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/provas">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{prova.titulo}</h1>
            <p className="text-muted-foreground">
              {prova.disciplina}
              {prova.turma ? ` - ${prova.turma}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href={`/provas/${id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/corrigir?prova=${id}`}>
              <Upload className="mr-2 h-4 w-4" />
              Corrigir Provas
            </Link>
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="flex flex-wrap gap-8 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Total de Questões</p>
            <p className="text-2xl font-bold text-foreground">{questoes.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Questões Objetivas</p>
            <p className="text-2xl font-bold text-foreground">
              {questoes.filter((q: { tipo: string }) => q.tipo === "objetiva").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Questões Dissertativas</p>
            <p className="text-2xl font-bold text-foreground">
              {questoes.filter((q: { tipo: string }) => q.tipo === "dissertativa").length}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pontuação Total</p>
            <p className="text-2xl font-bold text-foreground">
              {questoes.reduce((acc: number, q: { pontuacao: number }) => acc + (q.pontuacao || 0), 0)} pts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Questões */}
      <Card>
        <CardHeader>
          <CardTitle>Gabarito</CardTitle>
          <CardDescription>
            Respostas corretas e critérios de correção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questoes
              .sort((a: { numero: number }, b: { numero: number }) => a.numero - b.numero)
              .map((questao: {
                id: string
                numero: number
                tipo: string
                enunciado?: string
                alternativa_correta?: string
                pontuacao: number
                criterios_correcao?: string
              }) => (
                <div
                  key={questao.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {questao.numero}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          questao.tipo === "objetiva"
                            ? "bg-chart-2/10 text-chart-2"
                            : "bg-chart-5/10 text-chart-5"
                        }`}
                      >
                        {questao.tipo === "objetiva" ? "Objetiva" : "Dissertativa"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {questao.pontuacao} {questao.pontuacao === 1 ? "ponto" : "pontos"}
                      </span>
                    </div>
                    {questao.enunciado && (
                      <p className="mt-2 text-sm text-foreground">{questao.enunciado}</p>
                    )}
                    {questao.tipo === "objetiva" && (
                      <p className="mt-2 text-sm">
                        <span className="text-muted-foreground">Resposta: </span>
                        <span className="font-medium text-primary">
                          {questao.alternativa_correta}
                        </span>
                      </p>
                    )}
                    {questao.tipo === "dissertativa" && questao.criterios_correcao && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Critérios de correção:</p>
                        <p className="mt-1 text-sm text-foreground">
                          {questao.criterios_correcao}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
