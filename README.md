# CorrigeFácil - SaaS de Correção de Provas com IA

Um sistema completo para correção automática de provas utilizando inteligência artificial com visão computacional. O CorrigeFácil permite que professores criem provas, façam upload de imagens de respostas dos alunos e recebam correções automáticas com feedback detalhado em segundos.

## Features

- 🎓 **Gestão de Provas** - Crie provas com questões objetivas e dissertativas
- 📸 **Upload de Imagens** - Envie fotos das provas dos alunos via Vercel Blob
- 🤖 **Correção com IA** - Análise automática com Google Gemini Vision
- 📊 **Relatórios Detalhados** - Notas, feedback e análise por questão
- 👤 **Gestão de Perfil** - Personalize seus dados pessoais
- 📈 **Histórico Completo** - Acesse todas as correções realizadas
- 🔐 **Segurança** - Autenticação via Supabase com RLS

## Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Backend**: Next.js Route Handlers + Server Actions
- **Database**: Supabase PostgreSQL com Row Level Security
- **File Storage**: Vercel Blob
- **AI**: Google Gemini 3.1 Flash (Vision) via Vercel AI Gateway
- **Auth**: Supabase Auth

## Configuração e Deploy

### Requisitos

- Node.js 18+
- pnpm ou npm
- Conta no Vercel
- Projeto Supabase
- Integração Vercel Blob ativada

### Instalação Local

```bash
# Clonar o repositório
git clone <seu-repo>
cd corrigefacil

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# Copie .env.example para .env.local e preencha:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - BLOB_READ_WRITE_TOKEN (configurado automaticamente no Vercel)

# Rodar desenvolvimento
pnpm dev

# Abrir em http://localhost:3000
```

### Deploy no Vercel

```bash
# Conectar repositório no Vercel Dashboard
# As variáveis de ambiente serão sincronizadas automaticamente

# Deploy
git push origin main
```

## Como Usar

### 1. Criar uma Prova

1. Vá para **Provas** → **Nova Prova**
2. Preencha os dados básicos (título, disciplina, turma)
3. Adicione questões:
   - **Questões Objetivas**: Coloque a resposta correta (A, B, C, D ou E)
   - **Questões Dissertativas**: Defina critérios de correção
4. Configure a pontuação por questão
5. Clique em **Criar Prova**

### 2. Corrigir Provas

1. Vá para **Corrigir**
2. Selecione a prova que deseja corrigir
3. Digite o nome do aluno
4. Faça upload da imagem da prova (JPG, PNG, máx. 10MB)
5. Clique em **Corrigir com IA**

**O sistema irá:**
- Analisar a imagem com visão computacional
- Comparar respostas com o gabarito
- Gerar feedback automático
- Calcular a nota final
- Salvar tudo no histórico

### 3. Visualizar Resultados

- Vá para **Histórico** para ver todas as correções
- Clique em uma correção para ver detalhes por questão
- Visualize feedback da IA e notas individuais

### 4. Gerenciar Perfil

- Clique no seu nome (canto superior direito)
- Edite suas informações pessoais
- Atualize sua escola
- Faça logout quando necessário

## API Endpoints

### POST /api/upload
Fazer upload de imagem da prova

**Body:**
```json
{
  "file": "File"
}
```

**Response:**
```json
{
  "url": "https://...",
  "pathname": "uploads/...",
  "size": 1024
}
```

### POST /api/corrigir
Corrigir prova com IA

**Body:**
```json
{
  "imagemUrl": "https://...",
  "provaId": "uuid",
  "nomeAluno": "João Silva"
}
```

**Response:**
```json
{
  "correcaoId": "uuid",
  "notaTotal": 85,
  "acertos": 7,
  "erros": 3,
  "resumo": "Bom desempenho...",
  "questoes": [
    {
      "numero": 1,
      "resposta_aluno": "A",
      "correta": true,
      "nota": 10,
      "feedback": "Resposta correta..."
    }
  ]
}
```

## Estrutura de Banco de Dados

### Tabelas

- **profiles** - Dados do professor
- **provas** - Provas criadas
- **questoes** - Questões de cada prova
- **correcoes** - Correções realizadas
- **respostas** - Respostas individuais

Todas as tabelas possuem Row Level Security (RLS) habilitado para segurança.

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Vercel Blob (configurado automaticamente)
BLOB_READ_WRITE_TOKEN=vercel_blob_...

# AI Gateway (usa credenciais padrão do Vercel)
```

## Troubleshooting

### Erro ao fazer upload
- Verifique o tamanho da imagem (máx. 10MB)
- Use formatos JPG, PNG ou WebP
- Confirme que Vercel Blob está conectado

### Erro na correção com IA
- A imagem pode estar muito pixelada ou unclear
- Tente tirar uma foto melhor da prova
- Verifique se todas as questões estão no gabarito

### Erro de autenticação
- Confirme email na caixa de entrada
- Verifique variáveis de Supabase no .env.local
- Teste o login em http://localhost:3000/auth/login

## Roadmap

- [ ] Integração com LMS (Google Classroom, Moodle)
- [ ] Relatórios em PDF
- [ ] Análise estatística por turma
- [ ] Planos pagos com limite de correções
- [ ] Mobile app
- [ ] Integração com câmera do celular

## Suporte

Para reportar bugs ou solicitar features, abra uma issue no GitHub.

## Licença

MIT
