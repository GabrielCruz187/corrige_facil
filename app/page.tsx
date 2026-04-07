import { Button } from '@/components/ui/button'
import { CheckCircle, BookOpen, Zap, Users, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent truncate">
            CorrigeFácil
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="rounded-full text-xs sm:text-sm h-9 sm:h-10">Entrar</Button>
            </Link>
            <Link href="/auth/cadastro">
              <Button size="sm" className="rounded-full text-xs sm:text-sm h-9 sm:h-10">Cadastrar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24 md:py-32 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 -right-20 w-40 h-40 sm:top-20 sm:-right-40 sm:w-80 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:-bottom-40 sm:-left-40 sm:w-80 sm:h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="space-y-6 sm:space-y-8 text-center">
            <div className="inline-block">
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary border border-primary/20">
                ✨ Powered by IA Avançada
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance">
              Corrija provas com <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">IA em segundos</span>
            </h1>
            
            <p className="text-sm sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
              Economize horas corrigindo provas. Nossa IA analisa respostas automaticamente com precisão de professor especialista.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 sm:pt-4">
              <Link href="/auth/cadastro">
                <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-12 md:h-14 rounded-full px-6 sm:px-8 group md:text-base">
                  Começar Grátis
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm h-10 sm:h-12 md:h-14 rounded-full px-6 sm:px-8 md:text-base">
                Ver Demo
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-foreground/50 pt-1 sm:pt-2">
              Sem cartão de crédito. 50 correções grátis.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-12 md:mb-16 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">Recursos Poderosos</h2>
            <p className="text-sm sm:text-lg text-foreground/60 max-w-2xl mx-auto">
              Tudo que você precisa para corrigir provas com velocidade e precisão
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { icon: Zap, title: 'Ultra Rápido', desc: 'Correção instantânea de provas' },
              { icon: Sparkles, title: 'IA Precisa', desc: 'Acurácia de 99%+ em respostas' },
              { icon: Users, title: 'Para Professores', desc: 'Interface intuitiva e amigável' },
              { icon: BookOpen, title: 'Feedback Detalhado', desc: 'Análise por questão e aluno' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group relative bg-card border border-border/60 rounded-2xl p-4 sm:p-6 md:p-8 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:bg-card/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-2 sm:space-y-4">
                  <div className="inline-flex p-2 sm:p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-lg">{feature.title}</h3>
                    <p className="text-foreground/60 text-xs sm:text-sm mt-0.5 sm:mt-1">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8 bg-card/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-12 md:mb-16 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Como Funciona</h2>
            <p className="text-sm sm:text-lg text-foreground/60">Em 3 passos simples</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { num: '01', title: 'Crie o Gabarito', desc: 'Cadastre suas questões objetivas e/ou dissertativas com critérios de correção' },
              { num: '02', title: 'Envie as Provas', desc: 'Tire fotos ou upload das provas respondidas pelos seus alunos' },
              { num: '03', title: 'Receba Resultados', desc: 'Nossa IA corrige automaticamente. Você revisa e exporta as notas' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center space-y-2 sm:space-y-4 text-center">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/20">
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent sm:text-3xl">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold">{step.title}</h3>
                  <p className="text-xs leading-relaxed text-foreground/60 sm:text-sm sm:leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 -right-4 text-primary/30 sm:top-8">
                    <ArrowRight className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 sm:mb-12 md:mb-16 text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">Planos Simples</h2>
            <p className="text-sm sm:text-lg text-foreground/60">Escolha o melhor para você</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                name: 'Gratuito',
                price: 'R$ 0',
                features: ['50 correções/mês', 'Questões objetivas', '5 provas ativas', 'Suporte por email'],
                popular: false,
              },
              {
                name: 'Professor',
                price: 'R$ 29',
                features: ['500 correções/mês', 'Objetivas + Dissertativas', 'Provas ilimitadas', 'Relatórios avançados', 'Suporte prioritário'],
                popular: true,
              },
              {
                name: 'Escola',
                price: 'R$ 199',
                features: ['Correções ilimitadas', 'Até 10 professores', 'Painel admin', 'API', 'Suporte 24/7'],
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? 'sm:col-span-2 lg:col-span-1 border-primary bg-gradient-to-br from-primary/10 to-background shadow-lg lg:scale-105'
                    : 'border-border/60 bg-card hover:border-primary/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 sm:-top-4">
                    <span className="inline-block bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">{plan.name}</h3>
                    <div className="mt-2">
                      <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-xs sm:text-sm">/mês</span>
                    </div>
                  </div>

                  <ul className="space-y-2 sm:space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        <span className="text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    size="sm"
                    className="w-full text-xs sm:text-sm h-9 sm:h-10 rounded-full md:h-12" 
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link href="/auth/cadastro">Começar Agora</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative px-4 py-12 sm:py-16 md:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 sm:p-12 md:p-16 text-center text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/20 blur-3xl sm:h-40 sm:w-40" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-white/20 blur-3xl sm:h-40 sm:w-40" />
            </div>
            
            <div className="relative space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold">
                Pronto para economizar horas?
              </h2>
              <p className="text-sm sm:text-lg opacity-90 mx-auto max-w-2xl">
                Junte-se a milhares de professores que já estão usando CorrigeFácil para corrigir provas mais rápido
              </p>
              <Button 
                size="sm"
                variant="secondary" 
                className="rounded-full px-6 sm:px-8 h-10 sm:h-12 text-xs sm:text-sm font-semibold md:h-14 md:text-base"
                asChild
              >
                <Link href="/auth/cadastro">
                  Criar Conta Grátis
                  <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 sm:ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30 py-8 sm:py-10 md:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              CorrigeFácil
            </div>
            <div className="flex gap-4 sm:gap-8 text-xs sm:text-sm text-foreground/60">
              <Link href="#" className="hover:text-foreground transition-colors">Termos</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Privacidade</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contato</Link>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 border-t border-border/40 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-foreground/50">
            © 2024 CorrigeFácil. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
