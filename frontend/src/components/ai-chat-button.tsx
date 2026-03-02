import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Send, Bot, User, BrainCircuit, ImageIcon, Download, ThumbsUp, ThumbsDown, RotateCw, Search, Maximize2, Paperclip, ClipboardList, FileText, Wrench, History, FileSpreadsheet, Printer } from 'lucide-react'
import { aiApi } from '@/services/api'
import ReactMarkdown from 'react-markdown'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface AnalyseItem {
  category: string;
  item_name: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  total_amount: number;
  labour_rate?: number | null;
  measurement_formula?: string | null;
}

interface AnalyseResult {
  summary: string;
  items: AnalyseItem[];
  compliance_notes: string[];
  recommendations: string[];
}

interface FloorPlanResult {
  id: number;
  title: string;
  description: string;
  category_name: string;
  image_url: string | null;
  created_at: string | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  userImageUrl?: string;
  imagePrompt?: string;
  presetId?: number;
  presetName?: string;
  floorPlans?: FloorPlanResult[];
  analyse?: AnalyseResult;
  timestamp: Date;
  feedbackGiven?: 'up' | 'down';
}

export function AiChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your **DzeNhare Architecture AI**. I can help with construction advice, compliance questions, and architectural guidance.\n\n**Commands:**\n- `/draw [description]` — Generate a 2D architectural drawing\n- `/plans [search]` — Search existing floor plans\n- `/analyse` — Analyse an uploaded floor plan / blueprint for BOQ\n- `/clear` — Start a fresh conversation',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [sessionId, setSessionId] = useState<number | undefined>(undefined)
  const [isTyping, setIsTyping] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSearchingPlans, setIsSearchingPlans] = useState(false)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  // New state for user image/PDF upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [selectedPdfBase64, setSelectedPdfBase64] = useState<string | null>(null)
  const [selectedPdfName, setSelectedPdfName] = useState<string | null>(null)
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  
  // Session sidebar
  const [showSessions, setShowSessions] = useState(false)
  const [sessions, setSessions] = useState<{id: number; title: string; updated_at: string}[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  // Analyse multi-step progress
  const [analyseStep, setAnalyseStep] = useState<'idle' | 'uploading' | 'analysing' | 'extracting' | 'done'>('idle')

  // Drag-and-drop
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Fetch chat history on open
  useEffect(() => {
    if (isOpen && !sessionId && messages.length <= 1) {
       loadLatestSession()
    }
  }, [isOpen])

  const loadLatestSession = async () => {
      setIsLoadingHistory(true)
      try {
          const sessionsRes = await aiApi.getSessions()
          const sessions = sessionsRes.data
          if (sessions && sessions.length > 0) {
              const latestSession = sessions[0]
              setSessionId(latestSession.id)
              
              const detailRes = await aiApi.getSessionDetails(latestSession.id)
              const history = detailRes.data.messages.map((m: any) => ({
                  id: m.id.toString(),
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                  imageUrl: m.image_url || undefined,
                  timestamp: new Date(m.created_at)
              }))
              
              if (history.length > 0) {
                  setMessages(history)
              }
          }
      } catch (e) {
          console.error("Failed to load history", e)
      } finally {
          setIsLoadingHistory(false)
      }
  }

  const loadSessions = async () => {
    setSessionsLoading(true)
    try {
      const res = await aiApi.getSessions()
      setSessions(res.data || [])
    } catch (e) {
      console.error("Failed to load sessions", e)
    } finally {
      setSessionsLoading(false)
    }
  }

  const switchToSession = async (sid: number) => {
    setIsLoadingHistory(true)
    try {
      const detailRes = await aiApi.getSessionDetails(sid)
      const history = detailRes.data.messages.map((m: any) => ({
        id: m.id.toString(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
        imageUrl: m.image_url || undefined,
        timestamp: new Date(m.created_at)
      }))
      setSessionId(sid)
      if (history.length > 0) setMessages(history)
      setShowSessions(false)
    } catch (e) {
      console.error("Failed to switch session", e)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // ── Drag-and-drop handlers ──
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (file.type === 'application/pdf') {
      setSelectedImage(file)
      setSelectedPdfName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1]
        setSelectedPdfBase64(base64String)
        setSelectedImageBase64(null)
        setImagePreviewUrl(null)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('image/')) {
      setSelectedImage(file)
      setSelectedPdfBase64(null)
      setSelectedPdfName(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setSelectedImageBase64(base64String)
        setImagePreviewUrl(base64String)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // ── BOQ Export helpers ──
  const exportBOQToCSV = (analyse: AnalyseResult) => {
    const hasLabour = analyse.items.some(i => i.labour_rate != null)
    const hasFormula = analyse.items.some(i => i.measurement_formula != null)
    const headers = ['Category', 'Item', 'Description', 'Unit', 'Quantity', 'Rate', 'Total']
    if (hasLabour) headers.push('Labour Rate')
    if (hasFormula) headers.push('Measurement Formula')
    const rows = analyse.items.map(i => {
      const row = [
        i.category, i.item_name, `"${i.description}"`, i.unit,
        i.quantity.toString(), i.rate.toString(), i.total_amount.toString()
      ]
      if (hasLabour) row.push(i.labour_rate != null ? i.labour_rate.toString() : '')
      if (hasFormula) row.push(i.measurement_formula ?? '')
      return row
    })
    const grandTotal = analyse.items.reduce((s, i) => s + (i.total_amount || 0), 0)
    const totalRow = ['', '', '', '', '', 'Grand Total', grandTotal.toString()]
    if (hasLabour) totalRow.push('')
    if (hasFormula) totalRow.push('')
    rows.push(totalRow)
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `BOQ_Analysis_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportBOQToPrint = (analyse: AnalyseResult) => {
    const grandTotal = analyse.items.reduce((s, i) => s + (i.total_amount || 0), 0)
    const hasLabour = analyse.items.some(i => i.labour_rate != null)
    const hasFormula = analyse.items.some(i => i.measurement_formula != null)
    const colCount = 7 + (hasLabour ? 1 : 0) + (hasFormula ? 1 : 0)
    const html = `
      <html><head><title>BOQ Analysis — DzeNhare SQB</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; }
        h1 { font-size: 1.3rem; }
        table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.85rem; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f0fdf4; color: #15803d; }
        .total { font-weight: bold; background: #f0fdf4; }
        .notes { margin-top: 1rem; font-size: 0.8rem; color: #b45309; }
        .recs { margin-top: 0.5rem; font-size: 0.8rem; color: #1d4ed8; }
      </style></head><body>
      <h1>📋 BOQ Analysis — DzeNhare SQB</h1>
      <p>${analyse.summary}</p>
      <table>
        <thead><tr><th>Category</th><th>Item</th><th>Description</th><th>Unit</th><th>Qty</th><th>Rate</th><th>Total</th>${hasLabour ? '<th>Labour</th>' : ''}${hasFormula ? '<th>Formula</th>' : ''}</tr></thead>
        <tbody>
          ${analyse.items.map(i => `<tr><td>${i.category}</td><td>${i.item_name}</td><td>${i.description}</td><td>${i.unit}</td><td>${i.quantity}</td><td>${i.rate.toLocaleString()}</td><td>${i.total_amount.toLocaleString()}</td>${hasLabour ? `<td>${i.labour_rate != null ? i.labour_rate.toLocaleString() : '-'}</td>` : ''}${hasFormula ? `<td>${i.measurement_formula ?? '-'}</td>` : ''}</tr>`).join('')}
          <tr class="total"><td colspan="${colCount - 1}" style="text-align:right">Grand Total</td><td>${grandTotal.toLocaleString()}</td></tr>
        </tbody>
      </table>
      ${analyse.compliance_notes?.length ? `<div class="notes"><strong>⚠️ Compliance Notes:</strong><ul>${analyse.compliance_notes.map(n => `<li>${n}</li>`).join('')}</ul></div>` : ''}
      ${analyse.recommendations?.length ? `<div class="recs"><strong>💡 Recommendations:</strong><ul>${analyse.recommendations.map(r => `<li>${r}</li>`).join('')}</ul></div>` : ''}
      </body></html>`
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.print()
    }
  }

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isTyping])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type === 'application/pdf') {
        // PDF upload
        setSelectedImage(file)
        setSelectedPdfName(file.name)
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1] // raw base64
          setSelectedPdfBase64(base64String)
          setSelectedImageBase64(null)
          setImagePreviewUrl(null)
        }
        reader.readAsDataURL(file)
      } else {
        // Image upload
        setSelectedImage(file)
        setSelectedPdfBase64(null)
        setSelectedPdfName(null)
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string
          setSelectedImageBase64(base64String)
          setImagePreviewUrl(base64String)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setSelectedImageBase64(null)
    setImagePreviewUrl(null)
    setSelectedPdfBase64(null)
    setSelectedPdfName(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSendMessage = async (e?: React.FormEvent, overrideContent?: string) => {
    if (e) e.preventDefault()
    
    const content = overrideContent || inputValue.trim()
    if (!content) return

    // Handle /clear command
    if (content.toLowerCase().trim() === '/clear') {
      if (sessionId) {
        try { await aiApi.deleteSession(sessionId) } catch (_) { /* ignore */ }
      }
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: '✨ Chat cleared! How can I help you today?\n\nRemember: `/draw`, `/plans`, `/analyse`, or just ask me anything.',
        timestamp: new Date()
      }])
      setSessionId(undefined)
      setInputValue('')
      return
    }

    // Validate bare /plans, /draw, /analyse
    const lowerTrimmed = content.toLowerCase().trim()
    if (lowerTrimmed === '/plans') {
      setMessages(prev => [...prev,
        { id: Date.now().toString(), role: 'user' as const, content, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: '🔍 Please describe what kind of floor plan you\'re looking for after the `/plans` command.\n\n**Examples:**\n- `/plans 3 bedroom house`\n- `/plans modern apartment`\n- `/plans commercial office`', timestamp: new Date() }
      ])
      setInputValue('')
      return
    }
    if (lowerTrimmed === '/draw') {
      setMessages(prev => [...prev,
        { id: Date.now().toString(), role: 'user' as const, content, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: '🎨 Please describe what you\'d like me to draw after the `/draw` command.\n\n**Examples:**\n- `/draw 4 bedroom modern house floor plan`\n- `/draw site plan with parking and landscaping`\n- `/draw front elevation of a 2-storey building`', timestamp: new Date() }
      ])
      setInputValue('')
      return
    }
    if (lowerTrimmed === '/analyse' || lowerTrimmed === '/analyze') {
      if (!selectedImageBase64 && !selectedPdfBase64) {
        setMessages(prev => [...prev,
          { id: Date.now().toString(), role: 'user' as const, content, timestamp: new Date() },
          { id: (Date.now() + 1).toString(), role: 'assistant' as const, content: '📋 To analyse a floor plan or blueprint, please **attach an image or PDF first** using the 📎 button, then type `/analyse`.\n\n**What I can analyse:**\n- Floor plans → Room measurements & BOQ\n- Blueprints → Material quantities\n- Site photos → Construction progress\n- BOQ documents (PDF) → Verification & costing', timestamp: new Date() }
        ])
        setInputValue('')
        return
      }
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      userImageUrl: selectedImageBase64 || undefined,
      timestamp: new Date()
    }

    const chatHistory = [...messages, newMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    setMessages(prev => [...prev, newMessage])
    const currentImage = selectedImageBase64
    const currentPdf = selectedPdfBase64
    clearSelectedImage()

    if (!overrideContent) setInputValue('')
    setIsTyping(true)
    setToolStatus(null)

    const lowerContent = content.toLowerCase()
    const isDrawing = lowerContent.includes('/draw')
    const isPlansSearch = lowerContent.includes('/plans')
    const isAnalyse = lowerContent.includes('/analyse') || lowerContent.includes('/analyze')
    const isCommand = isDrawing || isPlansSearch || isAnalyse
    if (isDrawing) setIsGeneratingImage(true)
    if (isPlansSearch) setIsSearchingPlans(true)
    if (isAnalyse) {
      setIsAnalysing(true)
      setAnalyseStep('uploading')
    }

    try {
      if (isCommand) {
        // Multi-step progress for /analyse
        if (isAnalyse) {
          setTimeout(() => setAnalyseStep('analysing'), 800)
          setTimeout(() => setAnalyseStep('extracting'), 3000)
        }
        // Commands use the synchronous endpoint (they return structured data)
        const response = await aiApi.sendMessage(chatHistory, sessionId, currentImage || undefined, currentPdf || undefined)
        if (isAnalyse) setAnalyseStep('done')

        if (response.data.session_id && !sessionId) {
            setSessionId(response.data.session_id)
        }
        const replyMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.message || 'Error processing request.',
          imageUrl: response.data.image_url || undefined,
          imagePrompt: response.data.image_prompt || undefined,
          presetId: response.data.preset_id || undefined,
          presetName: response.data.preset_name || undefined,
          floorPlans: response.data.floor_plans || undefined,
          analyse: response.data.analyse || undefined,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, replyMessage])
      } else {
        // Regular chat uses SSE streaming
        const streamResponse = await aiApi.sendMessageStream(
          chatHistory, sessionId, currentImage || undefined, currentPdf || undefined
        )

        // Check if the backend fell back to JSON (e.g. for commands)
        const contentType = streamResponse.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const data = await streamResponse.json()
          if (data.session_id && !sessionId) setSessionId(data.session_id)
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.message || 'Error processing request.',
            imageUrl: data.image_url || undefined,
            imagePrompt: data.image_prompt || undefined,
            presetId: data.preset_id || undefined,
            presetName: data.preset_name || undefined,
            floorPlans: data.floor_plans || undefined,
            analyse: data.analyse || undefined,
            timestamp: new Date()
          }])
        } else {
          // SSE stream
          const reader = streamResponse.body?.getReader()
          const decoder = new TextDecoder()
          let streamedContent = ''
          const streamMsgId = (Date.now() + 1).toString()

          // Add placeholder message that we'll update
          setMessages(prev => [...prev, {
            id: streamMsgId,
            role: 'assistant' as const,
            content: '',
            timestamp: new Date()
          }])
          setIsTyping(false) // Hide typing indicator, show streaming message instead

          if (reader) {
            let buffer = ''
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || '' // Keep incomplete line in buffer

              for (const line of lines) {
                if (!line.startsWith('data: ')) continue
                const payload = line.slice(6).trim()
                if (payload === '[DONE]') continue

                try {
                  const event = JSON.parse(payload)
                  if (event.type === 'token') {
                    streamedContent += event.content
                    setMessages(prev => prev.map(m =>
                      m.id === streamMsgId ? { ...m, content: streamedContent } : m
                    ))
                  } else if (event.type === 'tool_status') {
                    const toolNames: Record<string, string> = {
                      get_material_prices: '💰 Looking up material prices...',
                      check_compliance: '📋 Checking building regulations...',
                      calculate_area: '📐 Calculating area...',
                    }
                    setToolStatus(toolNames[event.tool] || `🔧 Using ${event.tool}...`)
                  } else if (event.type === 'meta') {
                    if (event.session_id && !sessionId) {
                      setSessionId(event.session_id)
                    }
                  } else if (event.type === 'error') {
                    streamedContent += `\n\n⚠️ Error: ${event.content}`
                    setMessages(prev => prev.map(m =>
                      m.id === streamMsgId ? { ...m, content: streamedContent } : m
                    ))
                  }
                } catch { /* ignore unparseable lines */ }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("AI chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "⚠️ I couldn't process your request. Please check your connection and try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsGeneratingImage(false)
      setIsSearchingPlans(false)
      setIsAnalysing(false)
      setAnalyseStep('idle')
      setToolStatus(null)
    }
  }

  const handleFeedback = async (messageId: string, rating: 'up' | 'down') => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedbackGiven: rating } : m
    ))

    try {
      await aiApi.submitFeedback(
        parseInt(messageId),
        rating === 'up' ? 5 : 1,
        message.imagePrompt || '',
        message.presetId,
      )
    } catch (error) {
      console.error("Feedback submission error:", error)
    }
  }

  const handleRegenerate = (messageId: string) => {
    const idx = messages.findIndex(m => m.id === messageId)
    if (idx <= 0) return
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        handleSendMessage(undefined, messages[i].content)
        return
      }
    }
  }

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `${apiBase}${url}`
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 z-50 bg-gradient-to-tr from-slate-900 via-gray-800 to-slate-700 text-white p-0 border-2 border-slate-700/50 flex items-center justify-center group"
        aria-label="Open AI Architecture Chat"
      >
        <BrainCircuit className="h-6 w-6 group-hover:scale-110 transition-all duration-300 text-white" />
      </Button>
    )
  }

  return (
    <>
      {/* Full Chat Panel */}
      <div className="fixed bottom-0 right-0 z-50 w-full sm:w-[460px] md:w-[520px] h-[100dvh] sm:h-[calc(100dvh-2rem)] sm:bottom-4 sm:right-4 flex flex-col bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200/60 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 shrink-0 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 backdrop-blur-sm">
            <Bot className="h-5 w-5 text-indigo-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white tracking-tight text-sm">AI Architecture Assistant</h3>
            <p className="text-[11px] text-indigo-200/70 font-medium">Powered by Claude AI + Gemini</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setShowSessions(prev => !prev); if (!showSessions) loadSessions() }}
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            title="Chat history"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Session sidebar panel */}
        {showSessions && (
          <div className="bg-slate-800 border-b border-slate-700 max-h-48 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recent Sessions</span>
                <button
                  onClick={() => { setSessionId(undefined); setMessages([{ id: 'welcome', role: 'assistant', content: '✨ New chat started! How can I help?', timestamp: new Date() }]); setShowSessions(false) }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  + New Chat
                </button>
              </div>
              {sessionsLoading ? (
                <div className="text-[10px] text-slate-500 text-center py-3">Loading...</div>
              ) : sessions.length === 0 ? (
                <div className="text-[10px] text-slate-500 text-center py-3">No sessions yet</div>
              ) : (
                sessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => switchToSession(s.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11px] truncate transition-colors ${
                      s.id === sessionId
                        ? 'bg-indigo-600/30 text-indigo-200'
                        : 'text-slate-300 hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="font-medium">{s.title}</span>
                    <span className="text-[9px] text-slate-500 ml-2">{new Date(s.updated_at).toLocaleDateString()}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          className={`flex-1 min-h-0 overflow-hidden relative ${isDragOver ? 'ring-2 ring-indigo-400 ring-inset' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-10 bg-indigo-50/80 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-indigo-600">
              <Paperclip className="h-8 w-8 animate-bounce" />
              <span className="text-sm font-medium">Drop image or PDF here</span>
            </div>
          </div>
        )}
        <ScrollArea className="h-full bg-gradient-to-b from-slate-50 to-white">
          <div className="flex flex-col gap-5 p-5 pb-3">
            {isLoadingHistory && (
              <div className="flex items-center justify-center py-6">
                <div className="flex space-x-1.5 items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="text-[11px] text-gray-500 font-medium ml-1">Loading history...</span>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar */}
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-slate-700" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-md shadow-md' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'
                  }`}>
                    {/* User-uploaded image */}
                    {message.userImageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-white/20 shadow-inner">
                        <img 
                          src={message.userImageUrl} 
                          alt="User uploaded" 
                          className="w-full h-auto max-h-48 object-cover cursor-zoom-in"
                          onClick={() => setPreviewImage(message.userImageUrl!)}
                        />
                      </div>
                    )}

                    {/* Markdown rendered content */}
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user'
                        ? '[&_p]:text-white [&_strong]:text-white [&_em]:text-white/90 [&_code]:text-white/90 [&_code]:bg-white/15 [&_li]:text-white [&_ul]:text-white [&_ol]:text-white [&_a]:text-indigo-200'
                        : '[&_p]:text-gray-800 [&_strong]:text-gray-900 [&_code]:bg-gray-100 [&_code]:text-indigo-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ul]:text-sm [&_ol]:text-sm [&_li]:text-sm [&_p]:text-sm [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-1.5 [&_a]:text-indigo-600'
                    }`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    
                    {/* Generated image */}
                    {message.imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <div 
                          className="relative group cursor-zoom-in"
                          onContextMenu={(e) => {
                            e.preventDefault()
                            setPreviewImage(resolveImageUrl(message.imageUrl!))
                          }}
                        >
                          <img 
                            src={resolveImageUrl(message.imageUrl)}
                            alt="AI Generated Drawing"
                            className="w-full h-auto max-h-72 object-contain bg-white"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="text-white flex flex-col items-center gap-1">
                              <Maximize2 className="h-5 w-5" />
                              <span className="text-[10px] font-medium">Right-click to enlarge</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {message.presetName ? message.presetName : 'AI Generated'}
                          </span>
                          <a
                            href={resolveImageUrl(message.imageUrl)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </a>
                        </div>

                        {/* Feedback */}
                        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-100 bg-white/80">
                          {message.feedbackGiven ? (
                            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                              {message.feedbackGiven === 'up' ? (
                                <><ThumbsUp className="h-3 w-3" /> Thanks for the feedback!</>
                              ) : (
                                <><ThumbsDown className="h-3 w-3" /> We'll improve — thanks!</>
                              )}
                            </span>
                          ) : (
                            <>
                              <span className="text-[10px] text-gray-400 mr-1">Rate:</span>
                              <button
                                onClick={() => handleFeedback(message.id, 'up')}
                                className="p-1 rounded-md hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                                title="Good result"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'down')}
                                className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Poor result"
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </button>
                              <div className="flex-1" />
                              <button
                                onClick={() => handleRegenerate(message.id)}
                                disabled={isTyping}
                                className="p-1 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                title="Regenerate drawing"
                              >
                                <RotateCw className="h-3.5 w-3.5" />
                                <span className="text-[10px] font-medium">Retry</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Floor plan results */}
                    {message.floorPlans && message.floorPlans.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Search className="h-3 w-3 text-violet-500" />
                          <span className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">
                            {message.floorPlans.length} Plan{message.floorPlans.length !== 1 ? 's' : ''} Found
                          </span>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                          {message.floorPlans.map((plan) => (
                            <div
                              key={plan.id}
                              className="flex-shrink-0 w-[200px] rounded-xl border border-gray-200 bg-gray-50 overflow-hidden hover:shadow-md transition-all duration-200 snap-start group"
                            >
                              {plan.image_url ? (
                                <div 
                                  className="aspect-[4/3] bg-gray-100 overflow-hidden relative cursor-zoom-in"
                                  onContextMenu={(e) => {
                                    e.preventDefault()
                                    setPreviewImage(resolveImageUrl(plan.image_url!))
                                  }}
                                >
                                  <img
                                    src={resolveImageUrl(plan.image_url)}
                                    alt={plan.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <Maximize2 className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-gray-300" />
                                </div>
                              )}
                              <div className="p-2.5">
                                <p className="text-[11px] font-semibold text-gray-800 line-clamp-1" title={plan.title}>
                                  {plan.title}
                                </p>
                                <span className="inline-block text-[9px] font-medium text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-full mt-1">
                                  {plan.category_name}
                                </span>
                                {plan.description && (
                                  <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-snug">
                                    {plan.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analyse / BOQ results */}
                    {message.analyse && message.analyse.items && message.analyse.items.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <ClipboardList className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                            BOQ Analysis — {message.analyse.items.length} Item{message.analyse.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {(() => {
                          const hasLabour = message.analyse!.items.some(i => i.labour_rate != null)
                          const hasFormula = message.analyse!.items.some(i => i.measurement_formula != null)
                          const totalColSpan = 5 + (hasLabour ? 1 : 0) + (hasFormula ? 1 : 0)
                          return (
                        <div className="overflow-x-auto -mx-1 px-1">
                          <table className="w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-emerald-50 text-emerald-700">
                                <th className="text-left px-2 py-1.5 font-semibold border-b border-emerald-200">Category</th>
                                <th className="text-left px-2 py-1.5 font-semibold border-b border-emerald-200">Item</th>
                                <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Qty</th>
                                <th className="text-center px-2 py-1.5 font-semibold border-b border-emerald-200">Unit</th>
                                <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Rate</th>
                                <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Total</th>
                                {hasLabour && <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Labour</th>}
                                {hasFormula && <th className="text-left px-2 py-1.5 font-semibold border-b border-emerald-200">Formula</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {message.analyse!.items.map((item, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-2 py-1 text-gray-600 border-b border-gray-100">{item.category}</td>
                                  <td className="px-2 py-1 text-gray-800 font-medium border-b border-gray-100" title={item.description}>{item.item_name}</td>
                                  <td className="px-2 py-1 text-right text-gray-700 border-b border-gray-100">{item.quantity}</td>
                                  <td className="px-2 py-1 text-center text-gray-500 border-b border-gray-100">{item.unit}</td>
                                  <td className="px-2 py-1 text-right text-gray-700 border-b border-gray-100">{typeof item.rate === 'number' ? item.rate.toLocaleString() : item.rate}</td>
                                  <td className="px-2 py-1 text-right text-gray-800 font-medium border-b border-gray-100">{typeof item.total_amount === 'number' ? item.total_amount.toLocaleString() : item.total_amount}</td>
                                  {hasLabour && <td className="px-2 py-1 text-right text-gray-600 border-b border-gray-100">{item.labour_rate != null ? item.labour_rate.toLocaleString() : '-'}</td>}
                                  {hasFormula && <td className="px-2 py-1 text-left text-gray-500 border-b border-gray-100 text-[9px]">{item.measurement_formula ?? '-'}</td>}
                                </tr>
                              ))}
                              <tr className="bg-emerald-50 font-semibold">
                                <td colSpan={totalColSpan} className="px-2 py-1.5 text-right text-emerald-700 border-t-2 border-emerald-300">Grand Total</td>
                                <td className="px-2 py-1.5 text-right text-emerald-800 border-t-2 border-emerald-300">
                                  {message.analyse!.items.reduce((sum, i) => sum + (typeof i.total_amount === 'number' ? i.total_amount : 0), 0).toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                          )
                        })()}
                        {message.analyse.compliance_notes && message.analyse.compliance_notes.length > 0 && (
                          <div className="mt-2 px-2 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-[10px] font-semibold text-amber-700 mb-0.5">⚠️ Compliance Notes</p>
                            {message.analyse.compliance_notes.map((note, i) => (
                              <p key={i} className="text-[10px] text-amber-600">• {note}</p>
                            ))}
                          </div>
                        )}
                        {message.analyse.recommendations && message.analyse.recommendations.length > 0 && (
                          <div className="mt-1.5 px-2 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-[10px] font-semibold text-blue-700 mb-0.5">💡 Recommendations</p>
                            {message.analyse.recommendations.map((rec, i) => (
                              <p key={i} className="text-[10px] text-blue-600">• {rec}</p>
                            ))}
                          </div>
                        )}

                        {/* BOQ Export buttons */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => exportBOQToCSV(message.analyse!)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-medium transition-colors"
                          >
                            <FileSpreadsheet className="h-3 w-3" />
                            Export CSV
                          </button>
                          <button
                            onClick={() => exportBOQToPrint(message.analyse!)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-medium transition-colors"
                          >
                            <Printer className="h-3 w-3" />
                            Print / PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] mt-1.5 px-1 ${message.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* User avatar */}
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {(isTyping || toolStatus) && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-slate-700" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  {isGeneratingImage ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ImageIcon className="h-3.5 w-3.5 animate-pulse text-indigo-500" />
                      <span>Generating architectural drawing...</span>
                    </div>
                  ) : isSearchingPlans ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Search className="h-3.5 w-3.5 animate-pulse text-violet-500" />
                      <span>Searching floor plan library...</span>
                    </div>
                  ) : isAnalysing ? (
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="h-3.5 w-3.5 animate-pulse text-emerald-500" />
                        <span>Analysing image &amp; extracting BOQ...</span>
                      </div>
                      <div className="flex gap-1 items-center ml-5">
                        {(['uploading', 'analysing', 'extracting', 'done'] as const).map((step, i) => {
                          const labels = ['📤 Uploading', '🧠 Analysing', '📋 Extracting', '✅ Done']
                          const active = analyseStep === step
                          const completed = ['uploading', 'analysing', 'extracting', 'done'].indexOf(analyseStep) > i
                          return (
                            <span key={step} className={`text-[9px] px-1.5 py-0.5 rounded-full transition-all ${active ? 'bg-emerald-100 text-emerald-700 font-semibold' : completed ? 'bg-emerald-50 text-emerald-500' : 'bg-gray-100 text-gray-400'}`}>
                              {labels[i]}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ) : toolStatus ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Wrench className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                      <span>{toolStatus}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          {(imagePreviewUrl || selectedPdfName) && (
            <div className="mb-3 relative inline-block">
              {imagePreviewUrl ? (
                <img 
                  src={imagePreviewUrl} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                />
              ) : selectedPdfName ? (
                <div className="h-16 px-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-red-50">
                  <FileText className="h-5 w-5 text-red-500" />
                  <span className="text-xs text-gray-700 max-w-[120px] truncate">{selectedPdfName}</span>
                </div>
              ) : null}
              <button 
                onClick={clearSelectedImage}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 relative"
          >
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*,.pdf,application/pdf"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 shrink-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={selectedImage ? (selectedPdfName ? `${selectedPdfName} attached — type /analyse or ask...` : "Describe this image or type /analyse...") : "/draw, /plans, /analyse, or ask anything..."}
              className="pr-12 rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 h-12 text-sm"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={(!inputValue.trim() && !selectedImage) || isTyping}
              className="absolute right-1.5 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2.5">
            <p className="text-[10px] text-gray-400 font-medium">
              <span className="text-indigo-500">/draw</span> generate • <span className="text-violet-500">/plans</span> search • <span className="text-emerald-500">/analyse</span> BOQ • <span className="text-red-400">/clear</span> reset
            </p>
          </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-full p-1 bg-transparent border-0 shadow-none overflow-hidden [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-black/80 z-[100]">
          <div className="relative w-full h-[85vh] flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-md">
            {previewImage && (
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
