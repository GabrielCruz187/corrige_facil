'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NovaTurmaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    serie: '',
    descricao: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/turmas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao criar turma')

      const data = await response.json()
      router.push(`/dashboard/turmas/${data.id}`)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar turma. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/dashboard/turmas">
        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Criar Nova Turma</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Preencha os dados da turma para começar
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informações da Turma</CardTitle>
          <CardDescription>Dados básicos da turma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field>
              <FieldLabel className="text-sm sm:text-base">Nome da Turma</FieldLabel>
              <FieldDescription className="text-xs sm:text-sm">
                Ex: Turma A, 3º Ano, Período Vespertino
              </FieldDescription>
              <Input
                placeholder="Ex: 7º Ano A"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="text-sm"
              />
            </Field>

            <Field>
              <FieldLabel className="text-sm sm:text-base">Série/Ano</FieldLabel>
              <Select value={formData.serie} onValueChange={(value) => setFormData({ ...formData, serie: value })}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecione a série" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ef1">Ensino Fundamental 1</SelectItem>
                  <SelectItem value="ef2">Ensino Fundamental 2</SelectItem>
                  <SelectItem value="em1">1º Ensino Médio</SelectItem>
                  <SelectItem value="em2">2º Ensino Médio</SelectItem>
                  <SelectItem value="em3">3º Ensino Médio</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel className="text-sm sm:text-base">Descrição (Opcional)</FieldLabel>
              <textarea
                placeholder="Descrição da turma, horário, etc..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || !formData.nome || !formData.serie}
                className="text-xs sm:text-sm h-10 sm:h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Turma'
                )}
              </Button>
              <Button variant="outline" asChild className="text-xs sm:text-sm h-10 sm:h-11">
                <Link href="/dashboard/turmas">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
