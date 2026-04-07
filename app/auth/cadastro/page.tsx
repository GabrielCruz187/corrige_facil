"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CadastroPage() {
  const router = useRouter()
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [escola, setEscola] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
          `${window.location.origin}/dashboard`,
        data: {
          nome,
          escola,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/auth/confirmar-email")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <CheckCircle className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">CorrigeFácil</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Crie sua conta gratuita e comece a corrigir provas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="escola">Escola (opcional)</Label>
              <Input
                id="escola"
                type="text"
                placeholder="Nome da sua escola"
                value={escola}
                onChange={(e) => setEscola(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              {loading ? "Criando conta..." : "Criar Conta Gratuita"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{" "}
            <Link href="#" className="text-primary hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="#" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
            .
          </p>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
