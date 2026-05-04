"use client"

import { useState, useEffect } from "react"
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
import { ArrowLeft, Plus, Trash2, GripVertical, Image as ImageIcon, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { QuestaoMediaUpload } from "@/components/questao-media-upload"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface Questao {
  id: string
  numero: number
  tipo: "objetiva" | "dissertativa"
  enunciado: string
  alternativa_correta: string
  pontuacao: number
  criterios_correcao: string
  imagem_url?: string
}

interface Turma {
  id: string
  nome: string
}

export default function NovaProvaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingTurmas, setLoadingTurmas] = useState(true)
  const [titulo, setTitulo] = useState("")
  const [disciplina, setDisciplina] = useState("")
  const [turmaId, setTurmaId] = useState("")
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [questoes, setQuestoes] = useState<Questao[]>([
    {
      id: crypto.randomUUID(),
      numero: 1,
      tipo: "objetiva",
      enunciado: "",
      alternativa_correta: "A",
      pontuacao: 1,
      criterios_correcao: "",
      imagem_url: undefined,
    },
  ])

  // Carregar turmas do professor
  useEffect(() => {
    async function loadTurmas() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data, error } = await supabase
          .from('turmas')
          .select('id, nome')
          .eq('professor_id', user.id)
          .order('nome')

        if (error) {
          console.error('Erro ao carregar turmas:', error)
          setTurmas([])
        } else {
          setTurmas(data || [])
        }
      } catch (error) {
        console.error('Erro:', error)
        setTurmas([])
      } finally {
        setLoadingTurmas(false)
      }
    }

    loadTurmas()
  }, [router])

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
        imagem_url: undefined,
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
        turma_id: turmaId || null,
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
      imagem_url: q.imagem_url || null,
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
              <Label htmlFor="turmaId">Turma (opcional)</Label>
              {loadingTurmas ? (
                <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                  <Spinner className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">Carregando turmas...</span>
                </div>
              ) : (
                <Select value={turmaId} onValueChange={setTurmaId}>
                  <SelectTrigger id="turmaId">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        Nenhuma turma encontrada. Cadastre uma turma primeiro
                      </SelectItem>
                    ) : (
                      turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
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
                    {questao.imagem_url && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-chart-2/10 px-2 py-1 text-xs font-medium text-chart-2">
                        <ImageIcon className="h-3 w-3" />
                        <Check className="h-3 w-3" />
                      </span>
                    )}
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

                {/* Preview de Imagem */}
                {questao.imagem_url && (
                  <div className="mt-4">
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={questao.imagem_url}
                        alt={`Questão ${questao.numero}`}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                )}

                {/* Upload de Mídia */}
                <div className="mt-4">
                  <QuestaoMediaUpload
                    value={questao.imagem_url}
                    onChange={(url) => updateQuestao(questao.id, "imagem_url", url)}
                    questaoNumero={questao.numero}
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

