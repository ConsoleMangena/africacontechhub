'use client'

import React, { useCallback, useRef, useState } from 'react'
import { Cpu, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react'
import { compileOOPDraftToNodes, type OOPDraft, useScene } from '@pascal-app/core'
import { useViewer } from '@pascal-app/viewer'

type ConsoleStatus = 'idle' | 'drafting' | 'success' | 'error'

export interface AICopilotConsoleProps {
  /** Async callback that sends the prompt to the backend and returns an OOPDraft.
   *  The host app provides this so the editor package stays backend-agnostic. */
  onDraft: (prompt: string) => Promise<OOPDraft>
}

export function AICopilotConsole({ onDraft }: AICopilotConsoleProps) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<ConsoleStatus>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentLevelId = useViewer((state) => state.selection.levelId)

  const flashStatus = useCallback((nextStatus: ConsoleStatus, msg: string, durationMs = 4000) => {
    setStatus(nextStatus)
    setStatusMessage(msg)
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    statusTimerRef.current = setTimeout(() => {
      setStatus('idle')
      setStatusMessage('')
    }, durationMs)
  }, [])

  const handleDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || status === 'drafting' || !currentLevelId) return

    setStatus('drafting')
    setStatusMessage('')
    try {
      const draftResult = await onDraft(prompt.trim())

      if (!draftResult?.rooms?.length) {
        throw new Error('AI returned an empty draft with no rooms.')
      }

      const compiledNodes = compileOOPDraftToNodes(draftResult, currentLevelId)

      const ops = compiledNodes.map((node) => ({
        node,
        parentId: node.parentId ?? currentLevelId,
      }))
      useScene.getState().createNodes(ops)

      const roomCount = draftResult.rooms.length
      const wallCount = compiledNodes.filter((n) => n.type === 'wall').length
      const doorCount = compiledNodes.filter((n) => n.type === 'door').length
      const windowCount = compiledNodes.filter((n) => n.type === 'window').length
      const hasRoof = compiledNodes.some((n) => n.type === 'roof')
      const parts = [`${roomCount} room${roomCount > 1 ? 's' : ''}`, `${wallCount} walls`, `${doorCount} doors`, `${windowCount} windows`]
      if (hasRoof) parts.push('roof')
      flashStatus('success', `Drafted "${draftResult.draft_name}" — ${parts.join(', ')}`)
      setPrompt('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('[AI Copilot] Drafting failed:', err)
      flashStatus('error', `Drafting failed: ${msg}`, 6000)
    }
  }

  const isDrafting = status === 'drafting'

  return (
    <div className="absolute right-2 top-20 z-50 pointer-events-auto w-[420px] max-w-[min(92vw,420px)] sm:right-4 sm:top-14">
      {statusMessage && status !== 'drafting' && (
        <div
          className={`mb-2 mx-auto w-fit text-xs px-3 py-1.5 rounded-full backdrop-blur-md transition-all ${
            status === 'success'
              ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
              : status === 'error'
                ? 'text-red-300 bg-red-500/15 border border-red-500/30'
                : ''
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            {status === 'success' && <CheckCircle className="w-3.5 h-3.5" />}
            {status === 'error' && <AlertTriangle className="w-3.5 h-3.5" />}
            {statusMessage}
          </span>
        </div>
      )}

      <div className="bg-slate-900/95 border border-slate-700 shadow-2xl rounded-2xl flex items-center p-2 transition-all hover:border-slate-500 hover:shadow-cyan-900/20 backdrop-blur-md">
        <div className="bg-slate-800 p-2 rounded-xl mr-3 relative overflow-hidden shrink-0">
          {isDrafting ? (
            <Cpu className="text-cyan-400 w-5 h-5 animate-pulse" />
          ) : status === 'success' ? (
            <CheckCircle className="text-emerald-400 w-5 h-5" />
          ) : (
            <Sparkles className="text-slate-400 w-5 h-5" />
          )}
        </div>

        <form onSubmit={handleDraft} className="flex-1 flex items-center min-w-0">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent border-none outline-none text-slate-200 placeholder:text-slate-500 text-sm font-medium"
            placeholder={isDrafting ? 'Drafting your structure...' : "Describe a house... (e.g. '3-bedroom house')"}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isDrafting || !currentLevelId}
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isDrafting || !currentLevelId}
            className="ml-2 shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 px-3 py-1.5 text-sm rounded-lg transition-colors font-medium"
          >
            {isDrafting ? 'Drafting...' : 'Draft'}
          </button>
        </form>
      </div>

      {!currentLevelId && (
        <div className="mt-2 text-xs text-amber-500/80 bg-amber-500/10 px-3 py-1 rounded-full whitespace-nowrap text-center">
          Select a Level first to draft onto
        </div>
      )}
    </div>
  )
}
