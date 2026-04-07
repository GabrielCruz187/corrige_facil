'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Upload, Loader2, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'

export default function BatchCorrectionPage() {
  const router = useRouter()
  const [provas, setProvas] = useState<any[]>([])
  const [selectedProva, setSelectedProva] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any[]>([])

  // Carregar provas ao montar
  useState(() => {
    async function loadProvas() {
      const supabase = createClient()
      const { data } = await supabase
        .from('provas')
        .select('id, titulo')
        .order('created_at', { ascending: false })
      if (data) setProvas(data)
    }
    loadProvas()
  }, [])

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  async function handleUpload() {
    if (!selectedProva || !files.length) {
      alert('Selecione uma prova e adicione arquivos')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })
      formData.append('provaId', selectedProva)

      const res = await fetch('/api/batch-upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload falhou')

      const data = await res.json()
      setResults(data.files)
      setProgress(100)

      // Simular processamento
      setTimeout(() => {
        alert(`${data.uploadedCount} provas enviadas para correção! Você receberá notificações conforme forem processadas.`)
        setFiles([])
        setResults([])
      }, 1500)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao fazer upload. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
          Correção em Lote
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Envie múltiplas provas de uma vez para correção automática
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">Upload em Lote</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Envie até 50 provas de uma vez. Suporta JPG, PNG e PDF.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <Field>
                <FieldLabel className="text-sm sm:text-base">Selecione a Prova</FieldLabel>
                <Select value={selectedProva} onValueChange={setSelectedProva}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Escolha a prova para usar como gabarito" />
                  </SelectTrigger>
                  <SelectContent>
                    {provas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Drag & Drop Area */}
              <div
                className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-8 lg:p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add('border-primary', 'bg-primary/5')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                  if (e.dataTransfer.files) {
                    setFiles(Array.from(e.dataTransfer.files))
                  }
                }}
              >
                <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground sm:h-12 sm:w-12 sm:mb-4" />
                <p className="mb-2 font-semibold text-sm sm:text-base">Arraste arquivos aqui</p>
                <p className="mb-4 text-xs text-muted-foreground">ou</p>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFiles}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <Button variant="outline" className="cursor-pointer text-xs sm:text-sm h-9 sm:h-10" asChild>
                    <span>Selecione Arquivos</span>
                  </Button>
                </label>
              </div>

              {/* Files List */}
              {files.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-sm font-semibold sm:text-base">{files.length} arquivo(s) selecionado(s)</p>
                  <div className="max-h-48 space-y-1 overflow-y-auto sm:space-y-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-2 sm:p-3">
                        <p className="truncate text-xs font-medium sm:text-sm">{f.name}</p>
                        <p className="flex-shrink-0 ml-2 text-xs text-muted-foreground">
                          {(f.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              {uploading && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium sm:text-sm">Enviando...</p>
                    <p className="text-xs text-muted-foreground">{progress}%</p>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedProva || !files.length || uploading}
                size="lg"
                className="w-full text-xs sm:text-sm h-10 sm:h-12"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Enviando {files.length} arquivo(s)...</span>
                    <span className="sm:hidden">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Enviar para Correção
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Benefícios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex gap-2 sm:gap-3">
                <Zap className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold sm:text-sm">Rápido</p>
                  <p className="text-xs text-muted-foreground">Processa até 50 provas em paralelo</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="text-xs font-semibold sm:text-sm">Preciso</p>
                  <p className="text-xs text-muted-foreground">IA analisa cada prova individualmente</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="text-xs font-semibold sm:text-sm">Inteligente</p>
                  <p className="text-xs text-muted-foreground">Aprende com suas revisões</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
