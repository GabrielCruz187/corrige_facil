import { generateText } from 'ai'
import { Ollama } from 'ollama'

export type AIProvider = 'ollama' | 'ai-gateway'

interface AIConfig {
  provider: AIProvider
  model: string
  temperature: number
  maxTokens: number
}

let detectedProvider: AIProvider | null = null

/**
 * Detecta qual provider de IA está disponível
 * Prioridade: Ollama local → AI Gateway
 */
export async function detectAIProvider(): Promise<AIProvider> {
  if (detectedProvider) return detectedProvider

  // Se OLLAMA_HOST está configurado, tenta usar Ollama
  if (process.env.OLLAMA_HOST) {
    try {
      const ollama = new Ollama({ host: process.env.OLLAMA_HOST })
      await ollama.list()
      detectedProvider = 'ollama'
      console.log('[AI] Usando provider: Ollama')
      return 'ollama'
    } catch (error) {
      console.warn('[AI] Ollama não está disponível:', error)
    }
  }

  // Fallback para AI Gateway
  if (process.env.AI_GATEWAY_API_KEY) {
    detectedProvider = 'ai-gateway'
    console.log('[AI] Usando provider: AI Gateway')
    return 'ai-gateway'
  }

  throw new Error(
    'Nenhum provider de IA configurado. Configure OLLAMA_HOST ou AI_GATEWAY_API_KEY'
  )
}

/**
 * Gera texto usando o provider detectado
 */
export async function generateWithAI(prompt: string, config?: Partial<AIConfig>): Promise<string> {
  const provider = await detectAIProvider()

  const defaultConfig: AIConfig = {
    provider,
    model: provider === 'ollama' ? process.env.OLLAMA_MODEL || 'llama2' : 'openai/gpt-4-mini',
    temperature: config?.temperature ?? 0.7,
    maxTokens: config?.maxTokens ?? 1000,
  }

  if (provider === 'ollama') {
    return generateWithOllama(prompt, defaultConfig)
  } else {
    return generateWithAIGateway(prompt, defaultConfig)
  }
}

/**
 * Gera texto usando Ollama localmente
 */
async function generateWithOllama(prompt: string, config: AIConfig): Promise<string> {
  const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || 'http://localhost:11434',
    // Aumentar timeout para 5 minutos (300s) - Ollama pode ser lento com modelos grandes
    fetch: async (url: string, options?: any) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(300000), // 5 minutos
      })
    }
  })

  try {
    console.log(`[Ollama] Gerando com modelo: ${config.model}`)
    const response = await ollama.generate({
      model: config.model,
      prompt,
      temperature: config.temperature,
      stream: false,
    } as any)

    if (!response.response) {
      throw new Error('Resposta vazia do Ollama')
    }

    return response.response
  } catch (error: any) {
    const errorMsg = error?.message || String(error)
    console.error('[Ollama] Erro ao gerar texto:', errorMsg)
    
    // Melhor mensagem de erro para o usuário
    if (errorMsg.includes('Timeout') || errorMsg.includes('HEADERS_TIMEOUT')) {
      throw new Error(
        'Ollama está demorando muito. Certifique-se que está rodando: ollama serve'
      )
    }
    if (errorMsg.includes('ECONNREFUSED')) {
      throw new Error(
        'Não conseguiu conectar ao Ollama. Inicie com: ollama serve'
      )
    }
    
    throw error
  }
}

/**
 * Gera texto usando AI Gateway (Vercel)
 */
async function generateWithAIGateway(prompt: string, config: AIConfig): Promise<string> {
  try {
    const { text } = await generateText({
      model: config.model,
      prompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    })

    return text
  } catch (error) {
    console.error('[AI Gateway] Erro ao gerar texto:', error)
    throw error
  }
}

/**
 * Verifica se o provider está disponível (para UI feedback)
 */
export async function checkAIAvailability(): Promise<{
  available: boolean
  provider: AIProvider | null
  message: string
}> {
  try {
    const provider = await detectAIProvider()
    return {
      available: true,
      provider,
      message: `IA disponível (${provider})`,
    }
  } catch (error) {
    return {
      available: false,
      provider: null,
      message: 'Nenhum provider de IA configurado. Configure Ollama ou AI Gateway.',
    }
  }
}

