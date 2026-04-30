import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, Save } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface PareceGeneratorProps {
  alunoId: string
  turmaId: string
  alunoNome: string
}

export function PareceGenerator({ alunoId, turmaId, alunoNome }: PareceGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [parecer, setParecer] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleGerarParecer = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gerar-parecer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId, turmaId }),
      })
      const data = await res.json()
      if (data.parecer) {
        setParecer(data.parecer)
        setSaved(false)
      }
    } catch (error) {
      console.error('Erro ao gerar parecer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSalvar = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/alunos/${alunoId}/parecer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parecer }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Erro ao salvar parecer:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Parecer Descritivo
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Gere um parecer pedagógico personalizado com IA</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {!parecer ? (
          <Button
            onClick={handleGerarParecer}
            disabled={loading}
            size="sm"
            className="w-full text-xs sm:text-sm h-9 sm:h-11 md:h-12"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando parecer...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Parecer com IA
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <Textarea
              value={parecer}
              onChange={(e) => {
                setParecer(e.target.value)
                setSaved(false)
              }}
              placeholder="Parecer gerado..."
              className="min-h-24 text-xs sm:text-sm resize-none sm:min-h-32"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button
                onClick={handleGerarParecer}
                variant="outline"
                disabled={loading}
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Regenerar
                  </>
                )}
              </Button>
              <Button
                onClick={handleSalvar}
                disabled={saving}
                size="sm"
                className="text-xs sm:text-sm h-9 sm:h-11 flex-1 sm:flex-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : saved ? (
                  <>
                    <Save className="mr-2 h-4 w-4 text-green-500" />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar no Histórico
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
