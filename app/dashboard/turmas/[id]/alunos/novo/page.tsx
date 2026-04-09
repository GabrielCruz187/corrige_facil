'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function NovoAlunoPage() {
  const params = useParams()
  const router = useRouter()
  const turmaId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    matricula: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/turmas/${turmaId}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Erro ao adicionar aluno')
      }

      router.push(`/dashboard/turmas/${turmaId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar aluno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <Link href={`/dashboard/turmas/${turmaId}`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold sm:text-3xl">Novo Aluno</h1>
        <p className="mt-1 text-sm text-muted-foreground">Adicione um aluno a esta turma</p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Informações do Aluno</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Preencha os dados do aluno</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 sm:p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel className="text-sm sm:text-base">Nome do Aluno *</FieldLabel>
                <Input
                  name="nome"
                  placeholder="Ex: João Silva"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-sm sm:text-base">Email (Opcional)</FieldLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="Ex: joao@escola.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="text-sm"
                />
              </Field>

              <Field>
                <FieldLabel className="text-sm sm:text-base">Matrícula (Opcional)</FieldLabel>
                <FieldDescription className="text-xs sm:text-sm">Número de matrícula único do aluno</FieldDescription>
                <Input
                  name="matricula"
                  placeholder="Ex: 2024001"
                  value={formData.matricula}
                  onChange={handleChange}
                  className="text-sm"
                />
              </Field>

              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 pt-4">
                <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-12">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adicionando...
                    </>
                  ) : (
                    'Adicionar Aluno'
                  )}
                </Button>
                <Button type="button" variant="outline" size="lg" asChild className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-12">
                  <Link href={`/dashboard/turmas/${turmaId}`}>Cancelar</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
