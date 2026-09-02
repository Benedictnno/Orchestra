import Groq from 'groq-sdk'

// Singleton instance to prevent multiple client initializations
let groqInstance = null

export function getGroqClient() {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is missing from environment variables')
    }
    const options = { apiKey: process.env.GROQ_API_KEY }
    if (process.env.GROQ_BASE_URL) {
      options.baseURL = process.env.GROQ_BASE_URL
    }
    groqInstance = new Groq(options)
  }
  return groqInstance
}

export const MODELS = {
  PREMIUM: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  FAST:    process.env.GROQ_FAST_MODEL || 'llama-3.1-8b-instant',
}

/**
 * Execute chat completion with automatic fallback if primary model is unavailable.
 */
export async function createChatCompletion(params) {
  const groq = getGroqClient()
  const primaryModel = params.model || MODELS.PREMIUM

  try {
    const response = await groq.chat.completions.create({
      ...params,
      model: primaryModel,
    })
    if (response.usage) {
      console.log(`[AI] ${primaryModel} — prompt: ${response.usage.prompt_tokens}, completion: ${response.usage.completion_tokens}, total: ${response.usage.total_tokens} tokens`)
    }
    return response
  } catch (error) {
    const fallbackModel = MODELS.FAST
    const isModelNotFoundError =
      error?.status === 404 ||
      error?.code === 'model_not_found' ||
      error?.message?.includes('does not exist') ||
      error?.error?.code === 'model_not_found'

    if (isModelNotFoundError && primaryModel !== fallbackModel) {
      console.warn(`[AI Service] Model "${primaryModel}" failed. Retrying with fallback model "${fallbackModel}"...`)
      const fallbackResponse = await groq.chat.completions.create({
        ...params,
        model: fallbackModel,
      })
      if (fallbackResponse.usage) {
        console.log(`[AI] ${fallbackModel} (fallback) — prompt: ${fallbackResponse.usage.prompt_tokens}, completion: ${fallbackResponse.usage.completion_tokens}, total: ${fallbackResponse.usage.total_tokens} tokens`)
      }
      return fallbackResponse
    }
    throw error
  }
}

