'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'

interface Profile {
  id: string
  nome: string
  email: string
  escola: string | null
}

export default function PerfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [nome, setNome] = useState('')
  const [escola, setEscola] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
      setNome(data.nome)
      setEscola(data.escola || '')
    }
    setLoading(false)
  }

  async function handleSave() {
    if (!profile) return

    setSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        nome,
        escola: escola || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      alert('Erro ao salvar perfil')
      console.error(error)
    } else {
      setProfile({ ...profile, nome, escola })
      setEditing(false)
    }

    setSaving(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <p className="text-muted-foreground">Perfil não encontrado</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                {editing ? 'Editando suas informações' : 'Veja e atualize seus dados'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                O email não pode ser alterado
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={!editing}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="escola">Escola</Label>
              <Input
                id="escola"
                value={escola}
                onChange={(e) => setEscola(e.target.value)}
                disabled={!editing}
                placeholder="Nome da sua escola"
              />
            </div>
          </div>

          <div className="flex gap-3 border-t border-border pt-4">
            {!editing ? (
              <>
                <Button onClick={() => setEditing(true)}>Editar Perfil</Button>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
