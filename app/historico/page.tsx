import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { History, Search, FileText, CheckCircle, Clock, Eye } from "lucide-react"

export default async function HistoricoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: correcoes } = await supabase
    .from("correcoes")
    .select(`
      id,
      nome_aluno,
      nota_total,
      acertos,
      erros,
      status,
      created_at,
      provas (id, titulo, disciplina, turma, total_questoes)
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  // Estatísticas
  const totalCorrecoes = correcoes?.length || 0
  const mediaNotas = correcoes && correcoes.length > 0
    ? (correcoes.reduce((acc, c) => acc + (c.nota_total || 0), 0) / correcoes.length).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Histórico de Correções</h1>
          <p className="text-muted-foreground">
            Visualize todas as provas corrigidas
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCorrecoes}</p>
              <p className="text-sm text-muted-foreground">Total de Correções</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <CheckCircle className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mediaNotas}</p>
              <p className="text-sm text-muted-foreground">Média de Notas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
              <Clock className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {correcoes?.filter((c) => c.status === "pendente").length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Pendentes de Revisão</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Correções */}
      <Card>
        <CardHeader>
          <CardTitle>Correções Realizadas</CardTitle>
          <CardDescription>
            Clique em uma correção para ver os detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {correcoes && correcoes.length > 0 ? (
            <div className="space-y-4">
              {correcoes.map((correcao) => {
                const prova = correcao.provas as {
                  id: string
                  titulo: string
                  disciplina: string
                  turma: string | null
                  total_questoes: number
                } | null
                
                return (
                  <Link
                    key={correcao.id}
                    href={`/historico/${correcao.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{correcao.nome_aluno}</p>
                        <p className="text-sm text-muted-foreground">
                          {prova?.titulo || "Prova"} - {prova?.disciplina || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {correcao.nota_total !== null ? `${correcao.nota_total} pts` : "-"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {correcao.acertos}/{(correcao.acertos || 0) + (correcao.erros || 0)} acertos
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
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
                        <span className="text-xs text-muted-foreground">
                          {new Date(correcao.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Nenhuma correção encontrada
              </h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Suas correções aparecerão aqui depois que você corrigir sua primeira prova.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/corrigir">Corrigir Provas</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
