'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles, Download, Image as ImageIcon, Check, Eye } from 'lucide-react'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { QuestaoMediaUpload } from '@/components/questao-media-upload'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Questao {
  numero: number
  tipo: 'objetiva' | 'dissertativa'
  enunciado: string
  alternativas?: {
    A: string
    B: string
    C: string
    D: string
    E: string
  }
  gabarito?: string
  criterios_correcao?: string
  pontuacao: number
  imagem_url?: string
}

export default function GerarProvaPage() {
  const router = useRouter()
  const [assunto, setAssunto] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [nivel, setNivel] = useState('medio')
  const [quantidadeObjetivas, setQuantidadeObjetivas] = useState('10')
  const [quantidadeDissertativas, setQuantidadeDissertativas] = useState('3')
  const [loading, setLoading] = useState(false)
  const [prova, setProva] = useState<any>(null)
  const [questoesEditadas, setQuestoesEditadas] = useState<Record<number, Questao>>({})

  async function handleGerar() {
    if (!assunto || !disciplina) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/gerar-prova', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assunto,
          disciplina,
          nivel,
          quantidadeObjetivas: parseInt(quantidadeObjetivas),
          quantidadeDissertativas: parseInt(quantidadeDissertativas),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Erro ao gerar prova')
      }

      const data = await res.json()
      setProva(data)
      setQuestoesEditadas({})
    } catch (error) {
      console.error(error)
      alert('Erro ao gerar prova. Verifique se sua conta possui créditos disponíveis.')
    } finally {
      setLoading(false)
    }
  }

  function handleImagemUpdate(numeroQuestao: number, url: string) {
    setQuestoesEditadas((prev) => ({
      ...prev,
      [numeroQuestao]: {
        ...prova.questoes[numeroQuestao - 1],
        ...prev[numeroQuestao],
        imagem_url: url,
      },
    }))
  }

  async function handleSalvarProva() {
    if (!prova) return

    const questoesSalvar = prova.questoes.map((q: Questao, idx: number) => ({
      ...q,
      imagem_url: questoesEditadas[q.numero]?.imagem_url || q.imagem_url,
    }))

    try {
      const res = await fetch('/api/provas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: prova.titulo,
          disciplina,
          questoes: questoesSalvar,
        }),
      })

      if (!res.ok) throw new Error('Erro ao salvar prova')

      const { id: provaId } = await res.json()
      alert('Prova salva com sucesso!')
      setProva(null)
      setQuestoesEditadas({})
      router.push(`/provas/${provaId}/visualizar`)
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar prova. Tente novamente.')
    }
  }

  const handleExportar = () => {
    if (!prova) return

    const doc = `${prova.titulo}
${disciplina}

${prova.questoes
  .map((q: any) => {
    if (q.tipo === 'objetiva') {
      return `${q.numero}. ${q.enunciado}
A) ${q.alternativas.A}
B) ${q.alternativas.B}
C) ${q.alternativas.C}
D) ${q.alternativas.D}
E) ${q.alternativas.E}

`
    } else {
      return `${q.numero}. ${q.enunciado}

_________________________________________________________________________________________

`
    }
  })
  .join('')}

GABARITO:
${prova.questoes
  .filter((q: any) => q.tipo === 'objetiva')
  .map((q: any) => `${q.numero}. ${q.gabarito}`)
  .join(' | ')}`

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(doc))
    element.setAttribute('download', `${prova.titulo}.txt`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Sparkles className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          Gerar Prova com IA
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Crie provas automaticamente com questões alinhadas ao seu conteúdo
        </p>
      </div>

      {!prova ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Configurações da Prova</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Defina os parâmetros para gerar sua prova</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <Field>
                <FieldLabel className="text-sm sm:text-base">Disciplina</FieldLabel>
                <Input
                  placeholder="Ex: Matemática, História, Português..."
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-sm sm:text-base">Assunto/Tema</FieldLabel>
                <FieldDescription className="text-xs sm:text-sm">O que você quer que a prova aborde?</FieldDescription>
                <Input
                  placeholder="Ex: Frações, Revolução Francesa, Verbos..."
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-sm sm:text-base">Nível de Dificuldade</FieldLabel>
                <Select value={nivel} onValueChange={setNivel}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel className="text-sm sm:text-base">Questões Objetivas</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  max="20"
                  value={quantidadeObjetivas}
                  onChange={(e) => setQuantidadeObjetivas(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-sm sm:text-base">Questões Dissertativas</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={quantidadeDissertativas}
                  onChange={(e) => setQuantidadeDissertativas(e.target.value)}
                  className="text-sm"
                />
              </Field>

              <Button onClick={handleGerar} disabled={loading} size="lg" className="w-full text-sm sm:text-base h-10 sm:h-12">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Prova
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Prévia da Prova */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Como Funciona</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Passo a passo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="rounded-lg bg-card p-3 border border-border/50 text-xs sm:text-sm space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">1</div>
                  <div>
                    <p className="font-medium">Preencha os campos</p>
                    <p className="text-muted-foreground">Defina disciplina, tema e quantidade de questões</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-3 border border-border/50 text-xs sm:text-sm space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">2</div>
                  <div>
                    <p className="font-medium">A IA gera a prova</p>
                    <p className="text-muted-foreground">Questões são criadas automaticamente</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-3 border border-border/50 text-xs sm:text-sm space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">3</div>
                  <div>
                    <p className="font-medium">Adicione imagens</p>
                    <p className="text-muted-foreground">Edite cada questão e adicione fotos</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-card p-3 border border-border/50 text-xs sm:text-sm space-y-2">
                <div className="flex gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">4</div>
                  <div>
                    <p className="font-medium">Salve ou exporte</p>
                    <p className="text-muted-foreground">Guarde no seu acervo ou baixe em PDF</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{prova.titulo}</CardTitle>
              <CardDescription>
                {prova.questoes.filter((q: Questao) => q.tipo === 'objetiva').length} objetivas +{' '}
                {prova.questoes.filter((q: Questao) => q.tipo === 'dissertativa').length} dissertativas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={handleSalvarProva} size="lg" className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Salvar Prova
              </Button>
              <Button onClick={handleExportar} variant="outline" size="lg" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={() => setProva(null)} variant="outline" size="lg">
                Voltar
              </Button>
            </CardContent>
          </Card>

          {/* Questões Editáveis */}
          <div className="space-y-4">
            {prova.questoes.map((questao: Questao, idx: number) => (
              <Card key={questao.numero} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                          {questao.numero}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium">
                          {questao.tipo === 'objetiva' ? 'Objetiva' : 'Dissertativa'}
                          {(questoesEditadas[questao.numero]?.imagem_url || questao.imagem_url) && (
                            <>
                              <ImageIcon className="h-3 w-3" />
                              <Check className="h-3 w-3 text-chart-2" />
                            </>
                          )}
                        </span>
                      </div>
                      <p className="mt-2 font-medium text-foreground">{questao.enunciado}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Prévia da Imagem */}
                  {(questoesEditadas[questao.numero]?.imagem_url || questao.imagem_url) && (
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={questoesEditadas[questao.numero]?.imagem_url || questao.imagem_url}
                        alt={`Questão ${questao.numero}`}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                  )}

                  {/* Upload de Mídia */}
                  <QuestaoMediaUpload
                    value={questoesEditadas[questao.numero]?.imagem_url || questao.imagem_url}
                    onChange={(url) => handleImagemUpdate(questao.numero, url)}
                    questaoNumero={questao.numero}
                  />

                  {/* Detalhes da Questão */}
                  {questao.tipo === 'objetiva' && questao.alternativas && (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-foreground">Alternativas:</p>
                      {Object.entries(questao.alternativas).map(([letra, texto]) => (
                        <div key={letra} className="flex gap-2 ml-2">
                          <span className="font-medium text-muted-foreground">{letra})</span>
                          <span>{texto}</span>
                          {letra === questao.gabarito && (
                            <span className="ml-auto inline-flex items-center gap-1 text-chart-2 font-medium">
                              <Check className="h-3 w-3" />
                              Gabarito
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {questao.tipo === 'dissertativa' && questao.criterios_correcao && (
                    <div className="space-y-2 text-sm bg-muted rounded p-3">
                      <p className="font-medium text-foreground">Critérios de Correção:</p>
                      <p className="text-muted-foreground">{questao.criterios_correcao}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pontuação: {questao.pontuacao}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ações Finais */}
          <Card>
            <CardContent className="pt-6 flex gap-3">
              <Button onClick={handleSalvarProva} size="lg" className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Salvar Prova
              </Button>
              <Button onClick={handleExportar} variant="outline" size="lg" className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={() => setProva(null)} variant="outline" size="lg">
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

