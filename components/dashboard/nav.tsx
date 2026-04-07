"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle, LayoutDashboard, FileText, Upload, History, User, LogOut, Menu, Sparkles, Zap, PenTool, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface DashboardNavProps {
  user: {
    nome: string
    email: string
    escola?: string | null
  }
}

const navItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/provas", label: "Provas", icon: FileText },
  { href: "/corrigir", label: "Corrigir", icon: Upload },
  { href: "/dashboard/correcao-lote", label: "Lote", icon: Zap },
  { href: "/dashboard/turmas", label: "Turmas", icon: BarChart3 },
  { href: "/dashboard/gerar-prova", label: "Gerar Prova", icon: Sparkles },
  { href: "/dashboard/analisar-caligrafia", label: "Caligrafia", icon: PenTool },
  { href: "/historico", label: "Histórico", icon: History },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <CheckCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CorrigeFácil</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {user.nome.charAt(0).toUpperCase()}
                </div>
                <span className="hidden text-sm font-medium md:inline">{user.nome}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.nome}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-border bg-card px-4 py-2 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
    </header>
  )
}
