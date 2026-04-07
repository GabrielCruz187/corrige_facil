'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Sparkles, Download } from 'lucide-react'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'

export default function GerarProvaPage() {
  const [assunto, setAssunto] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [nivel, setNivel] = useState('medio')
  const [quantidadeObjetivas, setQuantidadeObjetivas] = useState('10')
  const [quantidadeDissertativas, setQuantidadeDissertativas] = useState('3')
  const [loading, setLoading] = useState(false)
  const [prova, setProva] = useState<any>(null)

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
        throw new Error('Erro ao gerar prova')
      }

      const data = await res.json()
      setProva(data)
    } catch (error) {
      alert('Erro ao gerar prova. Tente novamente.')
      console.error(error)
    } finally {
      setLoading(false)
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
        {prova && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl line-clamp-2">{prova.titulo}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {prova.questoes.filter((q: any) => q.tipo === 'objetiva').length} objetivas +{' '}
                {prova.questoes.filter((q: any) => q.tipo === 'dissertativa').length} dissertativas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {prova.questoes.slice(0, 3).map((q: any, idx: number) => (
                <div key={idx} className="rounded-lg bg-card p-2 sm:p-3 border border-border/50 text-xs sm:text-sm">
                  <p className="line-clamp-2 font-medium">{q.numero}. {q.enunciado}</p>
                  {q.tipo === 'objetiva' && (
                    <p className="mt-1 text-muted-foreground line-clamp-1">
                      Gabarito: <strong>{q.gabarito}</strong>
                    </p>
                  )}
                </div>
              ))}
              {prova.questoes.length > 3 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  +{prova.questoes.length - 3} mais questões
                </p>
              )}
              <Button onClick={handleExportar} variant="outline" size="sm" className="w-full text-xs sm:text-sm h-9 sm:h-10">
                <Download className="mr-2 h-4 w-4" />
                Exportar Prova
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
