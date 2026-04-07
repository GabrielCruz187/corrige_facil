import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, CheckCircle, Clock, Plus, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Buscar estatísticas
  const { count: totalProvas } = await supabase
    .from("provas")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  const { count: totalCorrecoes } = await supabase
    .from("correcoes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  const { count: correcoesPendentes } = await supabase
    .from("correcoes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "pendente")

  // Buscar provas recentes
  const { data: provasRecentes } = await supabase
    .from("provas")
    .select("id, titulo, disciplina, turma, total_questoes, created_at")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Buscar correções recentes
  const { data: correcoesRecentes } = await supabase
    .from("correcoes")
    .select(`
      id,
      nome_aluno,
      nota_total,
      status,
      created_at,
      provas (titulo)
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao CorrigeFácil. Gerencie suas provas e correções.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/provas/nova">
              <Plus className="mr-2 h-4 w-4" />
              Nova Prova
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/corrigir">
              <Upload className="mr-2 h-4 w-4" />
              Corrigir
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalProvas || 0}</p>
              <p className="text-sm text-muted-foreground">Provas Cadastradas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
              <CheckCircle className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCorrecoes || 0}</p>
              <p className="text-sm text-muted-foreground">Total de Correções</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-3/10">
              <Clock className="h-6 w-6 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{correcoesPendentes || 0}</p>
              <p className="text-sm text-muted-foreground">Pendentes de Revisão</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/10">
              <Upload className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">50</p>
              <p className="text-sm text-muted-foreground">Correções Restantes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Provas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Provas Recentes</CardTitle>
              <CardDescription>Suas últimas provas cadastradas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/provas">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {provasRecentes && provasRecentes.length > 0 ? (
              <div className="space-y-4">
                {provasRecentes.map((prova) => (
                  <Link
                    key={prova.id}
                    href={`/provas/${prova.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium text-foreground">{prova.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {prova.disciplina} {prova.turma ? `- ${prova.turma}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {prova.total_questoes} questões
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(prova.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Você ainda não cadastrou nenhuma prova.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/provas/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Prova
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Correções Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Correções Recentes</CardTitle>
              <CardDescription>Últimas provas corrigidas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/historico">
                Ver todas
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {correcoesRecentes && correcoesRecentes.length > 0 ? (
              <div className="space-y-4">
                {correcoesRecentes.map((correcao) => (
                  <Link
                    key={correcao.id}
                    href={`/historico/${correcao.id}`}
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                  >
                    <div>
                      <p className="font-medium text-foreground">{correcao.nome_aluno}</p>
                      <p className="text-sm text-muted-foreground">
                        {(correcao.provas as { titulo: string })?.titulo || "Prova"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {correcao.nota_total !== null ? `${correcao.nota_total} pts` : "-"}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
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
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Você ainda não corrigiu nenhuma prova.
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/corrigir">
                    <Upload className="mr-2 h-4 w-4" />
                    Corrigir Provas
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
