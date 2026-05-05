'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Image as ImageIcon, Loader2, X, Library } from 'lucide-react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { BancoImagens } from '@/components/banco-imagens'

interface QuestaoMediaUploadProps {
  value?: string
  onChange: (url: string) => void
  questaoNumero: number
}

export function QuestaoMediaUpload({
  value,
  onChange,
  questaoNumero,
}: QuestaoMediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [aba, setAba] = useState('upload')

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const supabase = createClient()

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem')
        setUploading(false)
        return
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter menos de 5MB')
        setUploading(false)
        return
      }

      // Criar nome único para o arquivo
      const timestamp = Date.now()
      const fileName = `questao-${questaoNumero}-${timestamp}-${file.name}`
      const filePath = `provas-imagens/${fileName}`

      // Upload para Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('provas-imagens')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('provas-imagens').getPublicUrl(filePath)

      setPreview(publicUrl)
      onChange(publicUrl)
      setOpen(false)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function handleRemoveImage() {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          {preview ? 'Trocar Imagem' : 'Adicionar Imagem'}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mídia da Questão {questaoNumero}</DialogTitle>
          <DialogDescription>
            Adicione uma imagem para acompanhar a questão
          </DialogDescription>
        </DialogHeader>

        <Tabs value={aba} onValueChange={setAba} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">
              Upload
            </TabsTrigger>
            <TabsTrigger value="biblioteca" className="flex-1">
              Biblioteca
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {preview && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Prévia Atual</Label>
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt={`Questão ${questaoNumero}`}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="w-full"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remover Imagem
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Fazer Upload
              </Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-6 transition-colors hover:border-primary hover:bg-muted">
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">Clique para fazer upload</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG ou WebP (máx. 5MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              {uploading && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Enviando imagem...</span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="biblioteca" className="space-y-4">
            <BancoImagens
              onSelect={(url) => {
                setPreview(url)
                onChange(url)
                setOpen(false)
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

