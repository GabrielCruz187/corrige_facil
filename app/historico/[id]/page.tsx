import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, X, Download, Printer } from "lucide-react"

interface CorrecaoPageProps {
  params: Promise<{ id: string }>
}

export default async function CorrecaoPage({ params }: CorrecaoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: correcao } = await supabase
    .from("correcoes")
    .select(`
      *,
      provas (*),
      respostas (
        *,
        questoes (*)
      )
    `)
    .eq("id", id)
    .single()

  if (!correcao) {
    notFound()
  }

  const prova = correcao.provas as {
    id: string
    titulo: string
    disciplina: string
    turma: string | null
    total_questoes: number
  }

  const respostas = (correcao.respostas || []).sort((a: { questoes: { numero: number } }, b: { questoes: { numero: number } }) => 
    a.questoes.numero - b.questoes.numero
  )

  const percentualAcertos = correcao.acertos && (correcao.acertos + correcao.erros) > 0
    ? Math.round((correcao.acertos / (correcao.acertos + correcao.erros)) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/historico">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Correção de {correcao.nome_aluno}
            </h1>
            <p className="text-muted-foreground">
              {prova.titulo} - {prova.disciplina}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-foreground">{correcao.nota_total || 0}</p>
            <p className="text-sm text-muted-foreground">Nota Final</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-chart-2">{correcao.acertos || 0}</p>
            <p className="text-sm text-muted-foreground">Acertos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-destructive">{correcao.erros || 0}</p>
            <p className="text-sm text-muted-foreground">Erros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-4xl font-bold text-primary">{percentualAcertos}%</p>
            <p className="text-sm text-muted-foreground">Aproveitamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes das Respostas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Correção</CardTitle>
          <CardDescription>
            Respostas e feedbacks por questão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {respostas.map((resposta: {
              id: string
              correta: boolean
              resposta_aluno: string
              nota: number
              feedback_ia: string | null
              questoes: {
                id: string
                numero: number
                tipo: string
                enunciado: string | null
                alternativa_correta: string | null
                pontuacao: number
                criterios_correcao: string | null
              }
            }) => (
              <div
                key={resposta.id}
                className={`rounded-lg border p-4 ${
                  resposta.correta
                    ? "border-chart-2/30 bg-chart-2/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-sm font-medium shadow-sm">
                    {resposta.questoes.numero}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {resposta.correta ? (
                          <CheckCircle className="h-5 w-5 text-chart-2" />
                        ) : (
                          <X className="h-5 w-5 text-destructive" />
                        )}
                        <span
                          className={`font-medium ${
                            resposta.correta ? "text-chart-2" : "text-destructive"
                          }`}
                        >
                          {resposta.correta ? "Correta" : "Incorreta"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({resposta.questoes.tipo === "objetiva" ? "Objetiva" : "Dissertativa"})
                        </span>
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {resposta.nota || 0} / {resposta.questoes.pontuacao} pts
                      </span>
                    </div>

                    {resposta.questoes.enunciado && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {resposta.questoes.enunciado}
                      </p>
                    )}

                    <div className="mt-3 space-y-2">
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Resposta do aluno:</span>
                        <span className="font-medium text-foreground">
                          {resposta.resposta_aluno || "-"}
                        </span>
                      </div>
                      {resposta.questoes.tipo === "objetiva" && (
                        <div className="flex gap-4 text-sm">
                          <span className="text-muted-foreground">Gabarito:</span>
                          <span className="font-medium text-primary">
                            {resposta.questoes.alternativa_correta}
                          </span>
                        </div>
                      )}
                    </div>

                    {resposta.feedback_ia && (
                      <div className="mt-4 rounded-lg bg-background p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          Feedback da IA:
                        </p>
                        <p className="mt-1 text-sm text-foreground">{resposta.feedback_ia}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Aluno</p>
              <p className="font-medium text-foreground">{correcao.nome_aluno}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data da Correção</p>
              <p className="font-medium text-foreground">
                {new Date(correcao.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prova</p>
              <p className="font-medium text-foreground">{prova.titulo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <span
                className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  correcao.status === "corrigido"
                    ? "bg-chart-2/10 text-chart-2"
                    : correcao.status === "revisado"
                    ? "bg-primary/10 text-primary"
                    : "bg-chart-3/10 text-chart-3"
                }`}
              >
                {correcao.status === "corrigido"
                  ? "Corrigido"
                  : correcao.status === "revisado"
                  ? "Revisado"
                  : "Pendente"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
