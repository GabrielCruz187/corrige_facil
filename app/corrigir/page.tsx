"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, FileImage, X, CheckCircle, AlertCircle, Brain } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Prova {
  id: string
  titulo: string
  disciplina: string
  turma_id: string | null
  total_questoes: number
}

interface Aluno {
  id: string
  nome: string
  email?: string
}

export default function CorrigirPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const provaIdParam = searchParams.get("prova")

  const [provas, setProvas] = useState<Prova[]>([])
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [selectedProva, setSelectedProva] = useState<string>(provaIdParam || "")
  const [selectedAluno, setSelectedAluno] = useState<string>("")
  const [nomeAluno, setNomeAluno] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingProvas, setLoadingProvas] = useState(true)
  const [loadingAlunos, setLoadingAlunos] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [result, setResult] = useState<{
    nota: number
    acertos: number
    erros: number
    respostas: Array<{
      questao: number
      correta: boolean
      resposta: string
      feedback?: string
    }>
  } | null>(null)

  const loadProvas = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data, error } = await supabase
      .from("provas")
      .select("id, titulo, disciplina, turma_id, total_questoes")
      .eq('user_id', user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Erro ao carregar provas:", error)
      setProvas([])
    } else {
      setProvas(data || [])
    }
    setLoadingProvas(false)
  }, [router])

  // Carregar alunos quando prova for selecionada
  const loadAlunos = useCallback(async (provaId: string) => {
    if (!provaId) {
      setAlunos([])
      return
    }

    setLoadingAlunos(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setAlunos([])
        return
      }

      // Buscar a prova para obter turma_id
      const { data: prova, error: provaError } = await supabase
        .from('provas')
        .select('turma_id')
        .eq('id', provaId)
        .eq('user_id', user.id)
        .single()

      if (provaError || !prova || !prova.turma_id) {
        setAlunos([])
        setLoadingAlunos(false)
        return
      }

      // Verificar se turma pertence ao professor
      const { data: turma, error: turmaError } = await supabase
        .from('turmas')
        .select('id')
        .eq('id', prova.turma_id)
        .eq('professor_id', user.id)
        .single()

      if (turmaError || !turma) {
        console.error('Turma não encontrada ou não autorizado')
        setAlunos([])
        setLoadingAlunos(false)
        return
      }

      // Buscar alunos da turma
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos_turma')
        .select('id, nome, email')
        .eq('turma_id', prova.turma_id)
        .order('nome')

      if (alunosError) {
        console.error('Erro ao carregar alunos:', alunosError)
        setAlunos([])
      } else {
        setAlunos(alunosData || [])
      }
    } catch (error) {
      console.error('Erro:', error)
      setAlunos([])
    } finally {
      setLoadingAlunos(false)
    }
  }, [])

  useEffect(() => {
    loadProvas()
  }, [loadProvas])

  useEffect(() => {
    if (selectedProva) {
      loadAlunos(selectedProva)
      setSelectedAluno("")
      setNomeAluno("")
    }
  }, [selectedProva, loadAlunos])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  function removeFile() {
    setFile(null)
    setPreview(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProva || !file) return

    const alunoId = selectedAluno || null
    const nome = selectedAluno ? (alunos.find(a => a.id === selectedAluno)?.nome || nomeAluno) : nomeAluno

    if (!nome) {
      alert("Por favor, selecione um aluno ou digite um nome")
      return
    }

    setLoading(true)
    setCorrecting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Fazer upload da imagem
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const error = await uploadRes.json()
        alert(`Erro no upload: ${error.error}`)
        setLoading(false)
        setCorrecting(false)
        return
      }

      const { url: imagemUrl } = await uploadRes.json()

      // Chamar API de correção com IA
      const correcaoRes = await fetch("/api/corrigir", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagemUrl,
          provaId: selectedProva,
          nomeAluno: nome,
          alunoId,
        }),
      })

      if (!correcaoRes.ok) {
        const error = await correcaoRes.json()
        alert(`Erro na correção: ${error.error}`)
        setLoading(false)
        setCorrecting(false)
        return
      }

      const correcaoData = await correcaoRes.json()

      // Converter dados para formato do resultado
      const respostasFormatadas = correcaoData.questoes.map((q: any) => ({
        questao: q.numero,
        correta: q.correta,
        resposta: q.resposta_aluno,
        feedback: q.feedback,
      }))

      setResult({
        nota: correcaoData.notaTotal,
        acertos: correcaoData.acertos,
        erros: correcaoData.erros,
        respostas: respostasFormatadas,
      })
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao corrigir prova. Tente novamente.")
    } finally {
      setCorrecting(false)
      setLoading(false)
    }
  }

  function resetForm() {
    setFile(null)
    setPreview(null)
    setSelectedAluno("")
    setNomeAluno("")
    setResult(null)
  }

  const provaAtual = provas.find(p => p.id === selectedProva)
  const temTurma = provaAtual?.turma_id

  if (loadingProvas) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Corrigir Provas</h1>
        <p className="text-muted-foreground">
          Faça upload das provas dos alunos para correção automática com IA
        </p>
      </div>

      {provas.length === 0 ? (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Nenhuma prova cadastrada
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Você precisa cadastrar pelo menos uma prova antes de corrigir.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/provas/nova">Criar Prova</Link>
            </Button>
          </CardContent>
        </Card>
      ) : result ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Correção Concluída</CardTitle>
                <CardDescription>
                  Prova corrigida com sucesso
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Resumo */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-3xl font-bold text-foreground">{result.nota}</p>
                <p className="text-sm text-muted-foreground">Nota Final</p>
              </div>
              <div className="rounded-lg bg-chart-2/10 p-4 text-center">
                <p className="text-3xl font-bold text-chart-2">{result.acertos}</p>
                <p className="text-sm text-muted-foreground">Acertos</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-3xl font-bold text-destructive">{result.erros}</p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Detalhes por Questão</h4>
              {result.respostas.map((r) => (
                <div
                  key={r.questao}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {r.questao}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {r.correta ? (
                        <CheckCircle className="h-4 w-4 text-chart-2" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <span className={r.correta ? "text-chart-2" : "text-destructive"}>
                        {r.correta ? "Correta" : "Incorreta"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Resposta: {r.resposta}
                    </p>
                    {r.feedback && (
                      <p className="mt-2 text-sm text-foreground">
                        <span className="font-medium">Feedback: </span>
                        {r.feedback}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={resetForm}>Corrigir Outra Prova</Button>
              <Button variant="outline" asChild>
                <Link href="/historico">Ver Histórico</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Correção</CardTitle>
              <CardDescription>
                Selecione a prova e o aluno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Prova *</Label>
                <Select value={selectedProva} onValueChange={setSelectedProva}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prova" />
                  </SelectTrigger>
                  <SelectContent>
                    {provas.map((prova) => (
                      <SelectItem key={prova.id} value={prova.id}>
                        {prova.titulo} - {prova.disciplina}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {temTurma ? (
                <div className="space-y-2">
                  <Label>Aluno</Label>
                  {loadingAlunos ? (
                    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
                      <Spinner className="h-4 w-4" />
                      <span className="text-sm text-muted-foreground">Carregando alunos...</span>
                    </div>
                  ) : alunos.length > 0 ? (
                    <Select value={selectedAluno} onValueChange={setSelectedAluno}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                      <SelectContent>
                        {alunos.map((aluno) => (
                          <SelectItem key={aluno.id} value={aluno.id}>
                            {aluno.nome}
                            {aluno.email && ` (${aluno.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="rounded-md border border-border bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground">
                        Nenhum aluno cadastrado nesta turma
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="nomeAluno">Nome do Aluno *</Label>
                <Input
                  id="nomeAluno"
                  placeholder="Digite o nome do aluno"
                  value={nomeAluno}
                  onChange={(e) => setNomeAluno(e.target.value)}
                  disabled={selectedAluno ? true : false}
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem da Prova *</Label>
                {!file ? (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 transition-colors hover:border-primary hover:bg-muted">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      Clique para fazer upload
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG ou PDF (máx. 10MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative rounded-lg border border-border p-4">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute right-2 top-2 rounded-full bg-background p-1 shadow-sm hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-3">
                      <FileImage className="h-10 w-10 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!selectedProva || !file || (temTurma && !selectedAluno && !nomeAluno) || loading}
              >
                {correcting ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-pulse" />
                    Corrigindo com IA...
                  </>
                ) : loading ? (
                  <>
                    <Spinner className="mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Corrigir Prova
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
              <CardDescription>
                Visualize a imagem da prova antes de corrigir
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview da prova"
                    className="h-auto w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
                  <FileImage className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Faça upload de uma imagem para visualizar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
