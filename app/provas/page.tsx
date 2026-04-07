import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProvaCard } from "@/components/provas/prova-card"
import { Empty } from "@/components/ui/empty"

export default async function ProvasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: provas } = await supabase
    .from("provas")
    .select(`
      id,
      titulo,
      disciplina,
      turma,
      total_questoes,
      created_at,
      questoes (count)
    `)
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Minhas Provas</h1>
          <p className="text-muted-foreground">
            Gerencie os gabaritos das suas provas
          </p>
        </div>
        <Button asChild>
          <Link href="/provas/nova">
            <Plus className="mr-2 h-4 w-4" />
            Nova Prova
          </Link>
        </Button>
      </div>

      {provas && provas.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {provas.map((prova) => (
            <ProvaCard key={prova.id} prova={prova} />
          ))}
        </div>
      ) : (
        <Empty
          icon="FileText"
          title="Nenhuma prova criada"
          description="Crie sua primeira prova para começar a corrigir"
          action={
            <Button asChild>
              <Link href="/provas/nova">Criar Prova</Link>
            </Button>
          }
        />
      )}
    </div>
  )
}
