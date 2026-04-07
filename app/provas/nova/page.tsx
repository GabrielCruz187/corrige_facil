"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Questao {
  id: string
  numero: number
  tipo: "objetiva" | "dissertativa"
  enunciado: string
  alternativa_correta: string
  pontuacao: number
  criterios_correcao: string
}

export default function NovaProvaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [titulo, setTitulo] = useState("")
  const [disciplina, setDisciplina] = useState("")
  const [turma, setTurma] = useState("")
  const [questoes, setQuestoes] = useState<Questao[]>([
    {
      id: crypto.randomUUID(),
      numero: 1,
      tipo: "objetiva",
      enunciado: "",
      alternativa_correta: "A",
      pontuacao: 1,
      criterios_correcao: "",
    },
  ])

  function addQuestao() {
    setQuestoes([
      ...questoes,
      {
        id: crypto.randomUUID(),
        numero: questoes.length + 1,
        tipo: "objetiva",
        enunciado: "",
        alternativa_correta: "A",
        pontuacao: 1,
        criterios_correcao: "",
      },
    ])
  }

  function removeQuestao(id: string) {
    const updated = questoes.filter((q) => q.id !== id)
    setQuestoes(
      updated.map((q, index) => ({
        ...q,
        numero: index + 1,
      }))
    )
  }

  function updateQuestao(id: string, field: keyof Questao, value: string | number) {
    setQuestoes(
      questoes.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    // Criar a prova
    const { data: prova, error: provaError } = await supabase
      .from("provas")
      .insert({
        user_id: user.id,
        titulo,
        disciplina,
        turma: turma || null,
        total_questoes: questoes.length,
      })
      .select()
      .single()

    if (provaError) {
      console.error("Erro ao criar prova:", provaError)
      setLoading(false)
      return
    }

    // Criar as questões
    const questoesData = questoes.map((q) => ({
      prova_id: prova.id,
      numero: q.numero,
      tipo: q.tipo,
      enunciado: q.enunciado || null,
      alternativa_correta: q.tipo === "objetiva" ? q.alternativa_correta : null,
      pontuacao: q.pontuacao,
      criterios_correcao: q.tipo === "dissertativa" ? q.criterios_correcao : null,
    }))

    const { error: questoesError } = await supabase
      .from("questoes")
      .insert(questoesData)

    if (questoesError) {
      console.error("Erro ao criar questões:", questoesError)
      setLoading(false)
      return
    }

    router.push(`/provas/${prova.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nova Prova</h1>
          <p className="text-muted-foreground">
            Cadastre o gabarito da sua prova
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações da Prova */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Prova</CardTitle>
            <CardDescription>
              Preencha os dados básicos da prova
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Prova *</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Prova de Matemática - Unidade 1"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disciplina">Disciplina *</Label>
                <Input
                  id="disciplina"
                  placeholder="Ex: Matemática"
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="turma">Turma (opcional)</Label>
              <Input
                id="turma"
                placeholder="Ex: 9º Ano A"
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Questões */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Questões</CardTitle>
              <CardDescription>
                Adicione as questões e defina o gabarito
              </CardDescription>
            </div>
            <Button type="button" variant="outline" onClick={addQuestao}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Questão
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {questoes.map((questao) => (
              <div
                key={questao.id}
                className="rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {questao.numero}
                    </span>
                  </div>
                  {questoes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestao(questao.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={questao.tipo}
                      onValueChange={(value) =>
                        updateQuestao(questao.id, "tipo", value as "objetiva" | "dissertativa")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="objetiva">Objetiva</SelectItem>
                        <SelectItem value="dissertativa">Dissertativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {questao.tipo === "objetiva" && (
                    <div className="space-y-2">
                      <Label>Resposta Correta</Label>
                      <Select
                        value={questao.alternativa_correta}
                        onValueChange={(value) =>
                          updateQuestao(questao.id, "alternativa_correta", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Pontuação</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={questao.pontuacao}
                      onChange={(e) =>
                        updateQuestao(questao.id, "pontuacao", parseFloat(e.target.value) || 1)
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label>Enunciado (opcional)</Label>
                  <Textarea
                    placeholder="Descreva o enunciado da questão..."
                    value={questao.enunciado}
                    onChange={(e) =>
                      updateQuestao(questao.id, "enunciado", e.target.value)
                    }
                    rows={2}
                  />
                </div>

                {questao.tipo === "dissertativa" && (
                  <div className="mt-4 space-y-2">
                    <Label>Critérios de Correção</Label>
                    <Textarea
                      placeholder="Descreva os critérios que a IA deve usar para corrigir esta questão..."
                      value={questao.criterios_correcao}
                      onChange={(e) =>
                        updateQuestao(questao.id, "criterios_correcao", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/provas">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner className="mr-2" />}
            {loading ? "Salvando..." : "Salvar Prova"}
          </Button>
        </div>
      </form>
    </div>
  )
}
