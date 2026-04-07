import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail } from "lucide-react"

export default function ConfirmarEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <CheckCircle className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">CorrigeFácil</span>
      </Link>

      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Confirme seu email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu email.
            Clique no link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua pasta de spam ou solicite um novo email.
          </p>
          <div className="flex flex-col gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Voltar para o Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
