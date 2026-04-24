import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function readEnv(name: string): string | undefined {
  const viteEnv = (import.meta as any)?.env
  if (viteEnv && typeof viteEnv[name] === 'string' && viteEnv[name].trim()) {
    return viteEnv[name].trim()
  }

  const processEnv = (globalThis as any)?.process?.env
  if (processEnv && typeof processEnv[name] === 'string' && processEnv[name].trim()) {
    return processEnv[name].trim()
  }

  return undefined
}

const NODE_ENV = readEnv('NODE_ENV')
const VERCEL_ENV = readEnv('NEXT_PUBLIC_VERCEL_ENV')
const APP_URL = readEnv('NEXT_PUBLIC_APP_URL')
const PORT = readEnv('PORT') || '3000'
const VERCEL_URL = readEnv('NEXT_PUBLIC_VERCEL_URL')
const VERCEL_PROD_URL = readEnv('NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL')

export const isDevelopment =
  NODE_ENV === 'development' || VERCEL_ENV === 'development'

export const isProduction =
  NODE_ENV === 'production' || VERCEL_ENV === 'production'

export const isPreview = VERCEL_ENV === 'preview'

/**
 * Base URL for the application
 * Uses NEXT_PUBLIC_* variables which are available at build time
 */
export const BASE_URL = (() => {
  // Development: localhost
  if (isDevelopment) {
    return APP_URL || `http://localhost:${PORT}`
  }

  // Preview deployments: use Vercel branch URL
  if (isPreview && VERCEL_URL) {
    return `https://${VERCEL_URL}`
  }

  // Production: use custom domain or Vercel production URL
  if (isProduction) {
    return APP_URL || (VERCEL_PROD_URL ? `https://${VERCEL_PROD_URL}` : 'https://editor.pascal.app')
  }

  // Fallback (should never reach here in normal operation)
  return APP_URL || 'http://localhost:3000'
})()
