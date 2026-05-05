'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { Check, Search } from 'lucide-react'

interface Imagem {
  id: string
  name: string
  url: string
  categoria?: string
}

interface BancoImagensProps {
  onSelect: (url: string) => void
}

const CATEGORIAS = ['Todas', 'Alfabetização', 'Matemática', 'Natureza', 'História', 'Arte', 'Ciências']

export function BancoImagens({ onSelect }: BancoImagensProps) {
  const [imagens, setImagens] = useState<Imagem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas')
  const [selecionada, setSelecionada] = useState<string | null>(null)

  useEffect(() => {
    carregarImagens()
  }, [])

  async function carregarImagens() {
    try {
      setLoading(true)
      const supabase = createClient()

      // Listar arquivos do bucket biblioteca-pedagogica
      const { data: files, error } = await supabase.storage
        .from('biblioteca-pedagogica')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        })

      if (error) throw error

      if (files) {
        const imagensCarregadas = files
          .filter((file) => file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i))
          .map((file) => {
            const { data: { publicUrl } } = supabase.storage
              .from('biblioteca-pedagogica')
              .getPublicUrl(file.name)

            // Extrair categoria do nome do arquivo (ex: matematica_fracoes.jpg)
            const categoria = file.name.split('_')[0]?.charAt(0).toUpperCase() + file.name.split('_')[0]?.slice(1) || 'Outras'

            return {
              id: file.name,
              name: file.name,
              url: publicUrl,
              categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
            }
          })

        setImagens(imagensCarregadas)
      }
    } catch (error) {
      console.error('Erro ao carregar imagens da biblioteca:', error)
    } finally {
      setLoading(false)
    }
  }

  const imagensFiltradas = imagens.filter((img) => {
    const matchCategoria = categoriaSelecionada === 'Todas' || img.categoria === categoriaSelecionada
    const matchBusca = searchTerm === '' || img.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategoria && matchBusca
  })

  return (
    <div className="w-full space-y-4">
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar na biblioteca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Abas de Categorias */}
      <Tabs defaultValue="Todas" onValueChange={setCategoriaSelecionada} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {CATEGORIAS.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid de Imagens */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : imagensFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 py-8 text-center">
          <p className="text-sm font-medium text-foreground">Nenhuma imagem encontrada</p>
          <p className="text-xs text-muted-foreground">Tente alterar os filtros ou a busca</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {imagensFiltradas.map((img) => (
            <button
              key={img.id}
              onClick={() => {
                setSelecionada(img.url)
                onSelect(img.url)
              }}
              className="group relative overflow-hidden rounded-lg border-2 border-transparent transition-all hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <AspectRatio ratio={1 / 1} className="bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </AspectRatio>

              {/* Overlay com Checkmark */}
              {selecionada === img.url && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/80">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}

              {/* Label do arquivo */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-left text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {img.categoria}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Informações */}
      {selecionada && (
        <div className="rounded-lg bg-chart-2/10 p-3 text-sm text-chart-2">
          <p className="font-medium">Imagem selecionada! Clique fora para confirmar a seleção.</p>
        </div>
      )}
    </div>
  )
}
