'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Printer, Download, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProvaPreviewPrint } from '@/components/prova-preview-print'

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

export default function VisualizarProvaPage() {
  const params = useParams()
  const provaId = params.id as string
  const previewRef = useRef<HTMLDivElement>(null)

  const [prova, setProva] = useState<any>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarGabarito, setMostrarGabarito] = useState(false)
  const [mostrarPontuacao, setMostrarPontuacao] = useState(true)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    async function fetchProva() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = '/auth/login'
          return
        }

        // Buscar prova
        const { data: provaData, error: provaError } = await supabase
          .from('provas')
          .select('*')
          .eq('id', provaId)
          .eq('user_id', user.id)
          .single()

        if (provaError || !provaData) {
          alert('Prova não encontrada')
          return
        }

        setProva(provaData)

        // Buscar questões
        const { data: questoesData, error: questoesError } = await supabase
          .from('questoes')
          .select('*')
          .eq('prova_id', provaId)
          .order('numero')

        if (questoesError) {
          console.error('Erro ao buscar questões:', questoesError)
        } else {
          // Transformar alternativas de objeto JSON
          const questoesFormatadas = (questoesData || []).map((q) => ({
            numero: q.numero,
            tipo: q.tipo,
            enunciado: q.enunciado,
            alternativas:
              q.tipo === 'objetiva' && q.alternativas
                ? typeof q.alternativas === 'string'
                  ? JSON.parse(q.alternativas)
                  : q.alternativas
                : undefined,
            gabarito: q.alternativa_correta,
            criterios_correcao: q.criterios_correcao,
            pontuacao: q.pontuacao,
            imagem_url: q.imagem_url,
          }))
          setQuestoes(questoesFormatadas)
        }
      } catch (error) {
        console.error('Erro:', error)
        alert('Erro ao carregar prova')
      } finally {
        setLoading(false)
      }
    }

    fetchProva()
  }, [provaId])

  function handlePrint() {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 500)
  }

  function handleDownloadPDF() {
    // Para implementação completa com PDF, seria necessário usar biblioteca como html2pdf
    // Por enquanto, usamos a funcionalidade nativa de "Salvar como PDF" do navegador
    alert('Use Ctrl+P (ou Cmd+P no Mac) para imprimir e escolha "Salvar como PDF"')
    handlePrint()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando prova...</p>
        </div>
      </div>
    )
  }

  if (!prova || questoes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              Prova não encontrada ou sem questões
            </p>
            <Button asChild className="w-full">
              <Link href="/provas">Voltar para Provas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Controles */}
        <div className="no-print">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/provas">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{prova.titulo}</h1>
              <p className="text-sm text-muted-foreground">{prova.disciplina}</p>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Opções de Visualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Mostrar Gabarito */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gabarito"
                    checked={mostrarGabarito}
                    onCheckedChange={(checked) => setMostrarGabarito(checked as boolean)}
                  />
                  <Label htmlFor="gabarito" className="cursor-pointer">
                    Mostrar Gabarito
                  </Label>
                </div>

                {/* Mostrar Pontuação */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pontuacao"
                    checked={mostrarPontuacao}
                    onCheckedChange={(checked) => setMostrarPontuacao(checked as boolean)}
                  />
                  <Label htmlFor="pontuacao" className="cursor-pointer">
                    Mostrar Pontuação
                  </Label>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    onClick={handlePrint}
                    disabled={printing}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {printing ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Preparando...
                      </>
                    ) : (
                      <>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p className="mb-2">
                  <strong>Dica:</strong> Use as opções de "Mostrar Gabarito" e "Mostrar
                  Pontuação" para gerar versões diferentes (para alunos ou para seu uso).
                </p>
                <p>
                  Para imprimir com as melhores configurações, use os botões acima ou pressione
                  Ctrl+P (Cmd+P no Mac).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow">
          <ProvaPreviewPrint
            ref={previewRef}
            titulo={prova.titulo}
            disciplina={prova.disciplina}
            questoes={questoes}
            mostrarGabarito={mostrarGabarito}
            mostrarPontuacao={mostrarPontuacao}
          />
        </div>
      </div>

      {/* Estilos de Impressão */}
      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .bg-white {
            box-shadow: none;
            border-radius: 0;
          }
        }

        @page {
          size: A4;
          margin: 1cm;
          orphans: 3;
          widows: 3;
        }
      `}</style>
    </div>
  )
}
