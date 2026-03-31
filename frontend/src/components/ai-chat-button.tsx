import { Icon } from '@/components/ui/material-icon'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { aiApi, builderApi } from '@/services/api'
import type { Project, BOQBuildingItem, BOQProfessionalFee, BOQAdminExpense, BOQLabourCost, BOQMachinePlant, BOQLabourBreakdown, BOQScheduleTask, BOQScheduleMaterial } from '@/types/api'
import ReactMarkdown from 'react-markdown'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface AnalyseResult {
  summary: string;
  building_items: BOQBuildingItem[];
  professional_fees: BOQProfessionalFee[];
  admin_expenses: BOQAdminExpense[];
  labour_costs: BOQLabourCost[];
  machine_plants: BOQMachinePlant[];
  labour_breakdowns: BOQLabourBreakdown[];
  schedule_tasks: BOQScheduleTask[];
  schedule_materials: BOQScheduleMaterial[];
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
  suggestedProjects?: {id: number; title: string}[];
}

type SiteIntelRow = {
  aspect: string;
  finding: string;
  risk: string;
  recommendation: string;
}

type AiChatButtonProps = {
  project?: Project
  projectId?: number
}

export function AiChatButton({ project, projectId: propProjectId }: AiChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [sessionId, setSessionId] = useState<number | undefined>(undefined)
  const sessionIdRef = useRef<number | undefined>(undefined)
  const [isTyping, setIsTyping] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [isSearchingPlans, setIsSearchingPlans] = useState(false)
  const [isAnalysing, setIsAnalysing] = useState(false)
  const [isScanningPlan, setIsScanningPlan] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  
  const [showSessions, setShowSessions] = useState(false)
  const [sessions, setSessions] = useState<{id: number; title: string; updated_at: string}[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  const [analyseStep, setAnalyseStep] = useState<'idle' | 'uploading' | 'reading' | 'measuring' | 'costing' | 'labour' | 'schedule' | 'materials' | 'compliance' | 'finalising' | 'done'>('idle')
  const [analyseReasoningLog, setAnalyseReasoningLog] = useState<string[]>([])
  const [drawStep, setDrawStep] = useState<'idle' | 'reading' | 'formulating' | 'rendering' | 'refining' | 'done'>('idle')
  const [drawReasoningLog, setDrawReasoningLog] = useState<string[]>([])

  const scrollRef = useRef<HTMLDivElement>(null)
  const siteIntelRef = useRef<() => void>(() => {})

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    if (isOpen && !sessionId && messages.length === 0) {
       loadLatestSession()
    }
  }, [isOpen, sessionId, messages.length])

  const [projects, setProjects] = useState<{id: number, title: string}[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [isSavingBOQ, setIsSavingBOQ] = useState(false)
  const [boqSaveSuccessMsg, setBoqSaveSuccessMsg] = useState<string | null>(null)

  const resolvedProjectId = useMemo(() => {
    if (project?.id) return project.id
    if (propProjectId) return propProjectId
    if (typeof selectedProjectId === 'number') return selectedProjectId
    return undefined
  }, [project?.id, propProjectId, selectedProjectId])

  useEffect(() => {
    if (isOpen && projects.length === 0 && !project) {
      builderApi.getProjects().then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
      }).catch(err => console.error("Failed to load projects", err))
    }
  }, [isOpen, projects.length, project])

  const lastProjectIdRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (!project) return
    if (lastProjectIdRef.current === project.id) return
    lastProjectIdRef.current = project.id
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your **Dzenhare Budget Engineer**. I've synchronized with **${project.title}**'s survey data and site intelligence tools.\n\nI'm ready to assist with architectural design, BOQ generation, and regulatory compliance for this project. How can I help you today?`,
      timestamp: new Date(),
    }

    setMessages([welcome])
    setSelectedProjectId(project.id)
    setProjects((prev) => {
      if (prev.find((p) => p.id === project.id)) return prev
      return [...prev, { id: project.id, title: project.title }]
    })
  }, [project])

  const loadLatestSession = async () => {
      setIsLoadingHistory(true)
      try {
          const sessionsRes = await aiApi.getSessions()
          const sessions = sessionsRes.data
          if (sessions && sessions.length > 0) {
              const latestSession = sessions[0]
              setSessionId(latestSession.id)
              sessionIdRef.current = latestSession.id
              
              const detailRes = await aiApi.getSessionDetails(latestSession.id)
              const history = detailRes.data.messages.map((m: any) => ({
                  id: m.id.toString(),
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                  imageUrl: m.image_url || undefined,
                  timestamp: new Date(m.created_at)
              }))
              
              if (history.length > 0) {
                  const commandsHint: ChatMessage = {
                    id: 'commands-hint',
                    role: 'assistant',
                    content: '**Commands:** `/draw` generate • `/scan` redraw • `/plans` search • `/analyse` BOQ • `/clear` reset',
                    timestamp: new Date(history[0].timestamp.getTime() - 1)
                  }
                  setMessages([commandsHint, ...history])
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

  const exportBOQToCSV = (analyse: AnalyseResult) => { toast.info('Exporting 8 budget sheets to CSV is coming soon!') }
  const exportBOQToPrint = (analyse: AnalyseResult) => { toast.info('Printing 8 budget sheets is coming soon!') }

  const handleSaveToBOQ = async (analyse: AnalyseResult) => {
    const targetProjectId = resolvedProjectId
    if (!targetProjectId) {
      setBoqSaveSuccessMsg('Select a project before saving BOQ data.')
      return
    }
    setIsSavingBOQ(true)
    setBoqSaveSuccessMsg(null)
    try {
      const existingRes = await builderApi.getProjectBudgetSheets(Number(targetProjectId));
      const ext = existingRes.data;

      if (analyse.building_items) {
        for (let idx = 0; idx < analyse.building_items.length; idx++) {
          const item = analyse.building_items[idx]
          const description = (item.description || '').trim()
          const billNo = item.bill_no || `${idx + 1}`
          const specification = (item.specification || '').trim() || undefined
          if (!description) continue
          if (!ext.building_items.some(e => e.description === description && e.bill_no === billNo)) {
            await builderApi.createBOQBuildingItem({
              project: Number(targetProjectId),
              bill_no: billNo,
              description,
              specification,
              unit: item.unit || 'item',
              quantity: item.quantity,
              rate: item.rate,
              is_ai_generated: true,
            });
          }
        }
      }
      if (analyse.professional_fees) {
        for (const item of analyse.professional_fees) {
          if (!ext.professional_fees.some(e => e.discipline === item.discipline && e.role_scope === item.role_scope)) {
            await builderApi.createBOQProfessionalFee({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      if (analyse.admin_expenses) {
        for (const item of analyse.admin_expenses) {
          if (!ext.admin_expenses.some(e => e.item_role === item.item_role && e.description === item.description)) {
            await builderApi.createBOQAdminExpense({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      if (analyse.labour_costs) {
        for (const item of analyse.labour_costs) {
          if (!ext.labour_costs.some(e => e.phase === item.phase && e.trade_role === item.trade_role)) {
            await builderApi.createBOQLabourCost({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      if (analyse.machine_plants) {
        for (const item of analyse.machine_plants) {
          if (!ext.machine_plants.some(e => e.machine_item === item.machine_item && e.category === item.category)) {
            await builderApi.createBOQMachinePlant({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      if (analyse.labour_breakdowns) {
        for (const item of analyse.labour_breakdowns) {
          if (!ext.labour_breakdowns.some(e => e.phase === item.phase && e.trade_role === item.trade_role)) {
            await builderApi.createBOQLabourBreakdown({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      if (analyse.schedule_tasks) {
        for (const item of analyse.schedule_tasks) {
          if (!ext.schedule_tasks.some(e => e.wbs === item.wbs && e.task_description === item.task_description)) {
            await builderApi.createBOQScheduleTask({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      if (analyse.schedule_materials) {
        for (const item of analyse.schedule_materials) {
          if (!ext.schedule_materials?.some(e => e.section === item.section && e.material_description === item.material_description)) {
            await builderApi.createScheduleMaterial({ ...item, project: Number(targetProjectId), is_ai_generated: true });
          }
        }
      }
      setBoqSaveSuccessMsg(`All 8 budget sheets saved successfully!`)
    } catch (err) {
      console.error(err);
      setBoqSaveSuccessMsg("Error saving some items.")
    } finally {
      setIsSavingBOQ(false)
    }
  }
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, isTyping])

  const handleSendMessage = async (e?: React.FormEvent, overrideContent?: string) => {
    if (e) e.preventDefault()
    
    const content = overrideContent || inputValue.trim()
    if (!content) return

    if (content.toLowerCase().trim() === '/clear') {
      if (sessionId) {
        try { await aiApi.deleteSession(sessionId) } catch (_) { toast.error('Failed to clear session on server') }
      }
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Chat cleared! How can I help you today?\n\n**Commands:** `/scan` redraw • `/plans` search • `/analyse` BOQ • `/clear` reset',
        timestamp: new Date()
      }])
      setSessionId(undefined)
      sessionIdRef.current = undefined
      setInputValue('')
      return
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    }

    const chatHistory = [...messages, newMessage].map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    setMessages(prev => [...prev, newMessage])

    if (!overrideContent) setInputValue('')

    setIsTyping(true)
    setToolStatus(null)

    const lowerContent = content.toLowerCase()
    const isPlansSearch = lowerContent.startsWith('/plans')
    const isAnalyse = lowerContent.startsWith('/analyse') || lowerContent.startsWith('/analyze')
    const isScan = lowerContent.startsWith('/scan')
    const isCommand = isPlansSearch || isAnalyse || isScan
    if (isPlansSearch) setIsSearchingPlans(true)
    if (isScan) setIsScanningPlan(true)
    if (isScan) {
      setDrawReasoningLog([])
      setDrawStep('idle')
    }
    if (isAnalyse) {
      setIsAnalysing(true)
      setAnalyseReasoningLog([])
      setAnalyseStep('uploading')
    }

    try {
      let autoImage: string | undefined
      let autoPdf: string | undefined
      
      let targetProjectId = resolvedProjectId
      let targetProjectTitle = project?.title || projects.find(p => p.id === selectedProjectId)?.title || 'current project'

      if (isCommand) {
        const parts = content.split(' ')
        if (parts.length > 1) {
          const searchName = parts.slice(1).join(' ').toLowerCase().trim()
          const matchedProject = projects.find(p => p.title.toLowerCase().includes(searchName))
          if (matchedProject) {
            targetProjectId = matchedProject.id
            targetProjectTitle = matchedProject.title
          } else if (!resolvedProjectId) {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant' as const,
              content: `Could not find a project matching "**${searchName}**". Please select one from the list:`,
              suggestedProjects: projects,
              timestamp: new Date()
            }])
            setIsTyping(false)
            setIsAnalysing(false)
            setIsScanningPlan(false)
            setIsSearchingPlans(false)
            setIsGeneratingImage(false)
            setAnalyseStep('idle')
            return
          }
        }

        if (!targetProjectId) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: `Please select a project for this command so I can use its survey data:`,
            suggestedProjects: projects,
            timestamp: new Date()
          }])
          setIsTyping(false)
          setIsAnalysing(false)
          setIsScanningPlan(false)
          setIsSearchingPlans(false)
          setIsGeneratingImage(false)
          setAnalyseStep('idle')
          return
        }
      }

      if (isAnalyse) {
        setAnalyseStep('uploading')
        try {
          const drawingsRes = await builderApi.getProjectDrawingRequests(targetProjectId)
          const allRequests = Array.isArray(drawingsRes.data) ? drawingsRes.data : (drawingsRes.data as any).results || []
          const allFiles = allRequests.flatMap((r: any) => r.files || [])
          if (allFiles.length === 0) {
            setMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              role: 'assistant' as const,
              content: `No drawing files found for project **${targetProjectTitle}**. Please upload drawings first via the **Design Drafting** page, then come back and type \`/analyse\`.`,
              timestamp: new Date()
            }])
            setIsTyping(false)
            setIsAnalysing(false)
            setAnalyseStep('idle')
            return
          }
          const imageFile = allFiles.find((f: any) => ['png', 'jpg', 'jpeg', 'webp'].includes(f.file_type?.toLowerCase()))
          const pdfFile = allFiles.find((f: any) => f.file_type?.toLowerCase() === 'pdf')
          const chosenFile = imageFile || pdfFile || allFiles[0]

          const fileUrl = chosenFile.file.startsWith('http') ? chosenFile.file : `${apiBase}${chosenFile.file}`
          const fileRes = await fetch(fileUrl)
          const blob = await fileRes.blob()
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(blob)
          })

          if (chosenFile.file_type?.toLowerCase() === 'pdf') {
            autoPdf = base64.split(',')[1]
          } else {
            autoImage = base64
          }

          setMessages(prev => [...prev, {
            id: (Date.now() + 0.5).toString(),
            role: 'assistant' as const,
            content: `Found **${allFiles.length}** drawing file(s) for **${targetProjectTitle}**. Analysing: **${chosenFile.original_name}** (${chosenFile.file_type?.toUpperCase()})...`,
            timestamp: new Date()
          }])
        } catch (err) {
          console.error('Failed to fetch project drawings', err)
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: `Failed to fetch drawing files for **${targetProjectTitle}**. Please try again.`,
            timestamp: new Date()
          }])
          setIsTyping(false)
          setIsAnalysing(false)
          setAnalyseStep('idle')
          return
        }
      }

      if (isCommand) {
        if (isAnalyse) {
          const steps: { step: typeof analyseStep; msg: string; delay: number }[] = [
            { step: 'reading',    msg: 'Reading drawing & identifying building elements...', delay: 800 },
            { step: 'measuring',  msg: 'Measuring dimensions — walls, openings, floor areas...', delay: 3500 },
            { step: 'costing',    msg: 'Calculating quantities & applying rates (USD)...', delay: 7000 },
            { step: 'labour',     msg: 'Estimating labour gangs, durations & wage bills...', delay: 11000 },
            { step: 'schedule',   msg: 'Building project schedule & task timeline...', delay: 15000 },
            { step: 'materials',  msg: 'Compiling schedule of materials by section...', delay: 19000 },
            { step: 'compliance', msg: 'Checking SI-56 compliance & room schedule...', delay: 23000 },
            { step: 'finalising', msg: 'Finalising 8-sheet budget & recommendations...', delay: 27000 },
          ]
          const timers: ReturnType<typeof setTimeout>[] = []
          for (const { step, msg, delay } of steps) {
            timers.push(setTimeout(() => {
              setAnalyseStep(step)
              setAnalyseReasoningLog(prev => [...prev, msg])
            }, delay))
          }
          ;(window as any).__analyseTimers = timers
        }
        if (isScan) {
          const steps: { step: typeof drawStep; msg: string; delay: number }[] = [
            { step: 'reading',     msg: 'Analyzing uploaded sketch or plan...', delay: 800 },
            { step: 'formulating', msg: 'Extracting walls, doors, and room layouts...', delay: 3500 },
            { step: 'rendering',   msg: 'Converting to professional CAD-style rendering...', delay: 7000 },
            { step: 'refining',    msg: 'Finalizing high-resolution output...', delay: 11000 },
          ]
          const timers: ReturnType<typeof setTimeout>[] = []
          for (const { step, msg, delay } of steps) {
            timers.push(setTimeout(() => {
              setDrawStep(step)
              setDrawReasoningLog(prev => [...prev, msg])
            }, delay))
          }
          ;(window as any).__drawTimers = timers
        }
        const response = await aiApi.sendMessage(
          chatHistory,
          sessionId,
          autoImage || undefined,
          autoPdf || undefined,
          targetProjectId,
        )
        if (isAnalyse) {
          const timers = (window as any).__analyseTimers as ReturnType<typeof setTimeout>[] | undefined
          if (timers) timers.forEach(clearTimeout)
          setAnalyseStep('done')
          setAnalyseReasoningLog(prev => [...prev, 'Budget generation complete — 8 sheets ready!'])
        }
        if (isScan) {
          const timers = (window as any).__drawTimers as ReturnType<typeof setTimeout>[] | undefined
          if (timers) timers.forEach(clearTimeout)
          setDrawStep('done')
          setDrawReasoningLog(prev => [...prev, 'Architectural drawing complete!'])
        }

        if (response.data.session_id && !sessionIdRef.current) {
            setSessionId(response.data.session_id)
            sessionIdRef.current = response.data.session_id
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
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '**Notice:** I am strictly configured for specific project capabilities. Please use one of the available commands:\n\n* **`/scan`** - Redraw floor plans\n* **`/plans`** - Search floor plans\n* **`/analyse`** - Extract Bill of Quantities',
          timestamp: new Date()
        }])
      }
    } catch (error) {
      console.error("AI chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I couldn't process your request. Please check your connection and try again.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsGeneratingImage(false)
      setIsSearchingPlans(false)
      setIsAnalysing(false)
      setIsScanningPlan(false)
      setAnalyseStep('idle')
      setAnalyseReasoningLog([])
      setDrawStep('idle')
      setDrawReasoningLog([])
      setToolStatus(null)
    }
  }

  const handleFeedback = async (messageId: string, rating: 'up' | 'down') => {
    const message = messages.find(m => m.id === messageId)
    if (!message) return

    const numericId = parseInt(messageId)
    if (isNaN(numericId)) {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, feedbackGiven: rating } : m
      ))
      return
    }

    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, feedbackGiven: rating } : m
    ))

    try {
      await aiApi.submitFeedback(
        numericId,
        rating === 'up' ? 5 : 1,
        message.imagePrompt || '',
        message.presetId,
      )
    } catch (error) {
      console.error("Feedback submission error:", error)
      toast.error('Failed to submit feedback')
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

  const handleSiteIntel = async () => {
    if (!resolvedProjectId || !project) {
      toast.error('Select a project with location/site notes before requesting site intel.')
      setIsOpen(true)
      return
    }

    if (!project.location && !project.site_notes) {
      toast.error('Add a project location or site notes first to request site intel.')
      setIsOpen(true)
      return
    }

    const infoLines = [
      project.location ? `Location: ${project.location}` : null,
      project.latitude && project.longitude ? `Coordinates: ${project.latitude}, ${project.longitude}` : null,
      project.site_notes ? `Site notes: ${project.site_notes}` : null,
      project.constraints ? `Constraints: ${project.constraints}` : null,
      project.lot_size ? `Lot size: ${project.lot_size}` : null,
      project.footprint ? `Footprint: ${project.footprint}` : null,
    ].filter(Boolean)

    const userContent = `Requesting site intelligence for this project.\n${infoLines.join('\n')}`
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      const res = await aiApi.generateSiteIntel(resolvedProjectId)
      const rows = (res.data.rows || []) as SiteIntelRow[]
      const summary = res.data.summary
      const markdownTable = rows.length ? toMarkdownTable(rows) : ''
      const assistantContent = rows.length
        ? `${summary ? `**Summary:** ${summary}\n\n` : ''}Here is the site intel table:\n\n${markdownTable}`
        : res.data.raw_response || 'No site intel returned.'

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      }])

      window.dispatchEvent(new CustomEvent('site-intel-updated', { detail: { projectId: resolvedProjectId } }))
    } catch (err) {
      console.error('Site intel request failed', err)
      toast.error('Failed to generate site intelligence')
    }
  }

  useEffect(() => {
    siteIntelRef.current = () => {
      setIsOpen(true)
      setTimeout(() => handleSiteIntel(), 120)
    }
  }, [handleSiteIntel])

  const sideEffectsRef = useRef({
    site_intel: () => {
      setIsOpen(true)
      setTimeout(() => handleSiteIntel(), 120)
    },
  }).current

  useEffect(() => {
    const siListener = () => sideEffectsRef.current.site_intel()
    window.addEventListener('ai:site-intel', siListener)
    return () => {
      window.removeEventListener('ai:site-intel', siListener)
    }
  }, [])

  const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url
    return `${apiBase}${url}`
  }

  const toMarkdownTable = (rows: SiteIntelRow[]) => {
    if (!rows.length) return ''
    const header = '| Aspect | Finding | Risk | Recommendation |\n| --- | --- | --- | --- |'
    const body = rows.map(r => `| ${r.aspect || '-'} | ${r.finding || '-'} | ${r.risk || '-'} | ${r.recommendation || '-'} |`).join('\n')
    return `${header}\n${body}`
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 z-50 bg-gradient-to-tr from-slate-900 via-gray-800 to-slate-700 text-white p-0 border-2 border-slate-700/50 flex items-center justify-center group"
        aria-label="Open Budget Engineer Chat"
      >
        <Icon name="psychology" className="h-6 w-6 group-hover:scale-110 transition-all duration-300 text-white" />
      </Button>
    )
  }

  return (
    <>
      {/* Full Chat Panel with modal-style layout */}
      <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-6">
        <div className="w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col bg-white rounded-none sm:rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 shrink-0 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm overflow-hidden">
            <img src="/images/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white tracking-tight text-sm">Budget Engineer</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setShowSessions(prev => !prev); if (!showSessions) loadSessions() }}
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
            title="Chat history"
          >
            <Icon name="history" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 flex items-center justify-center"
          >
            <Icon name="close" className="h-4 w-4" />
          </Button>
        </div>

        {/* Project quick actions removed per request */}

        {/* Session sidebar panel */}
        {showSessions && (
          <div className="bg-slate-800 border-b border-slate-700 max-h-48 overflow-y-auto">
            <div className="p-2">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Recent Sessions</span>
                <button
                  onClick={() => { setSessionId(undefined); sessionIdRef.current = undefined; setMessages([{ id: 'welcome', role: 'assistant', content: 'New chat started! How can I help?\n\n**Commands:** `/scan` redraw • `/plans` search • `/analyse` BOQ • `/clear` reset', timestamp: new Date() }]); setShowSessions(false) }}
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
                  <div key={s.id} className="flex items-center group">
                    <button
                      onClick={() => switchToSession(s.id)}
                      className={`flex-1 text-left px-2.5 py-1.5 rounded-md text-[11px] truncate transition-colors ${
                        s.id === sessionId
                          ? 'bg-indigo-600/30 text-indigo-200'
                          : 'text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="font-medium">{s.title}</span>
                      <span className="text-[9px] text-slate-500 ml-2">{new Date(s.updated_at).toLocaleDateString()}</span>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        try {
                          await aiApi.deleteSession(s.id)
                          setSessions(prev => prev.filter(x => x.id !== s.id))
                          if (s.id === sessionId) {
                            setSessionId(undefined)
                            sessionIdRef.current = undefined
                            setMessages([{ id: 'welcome', role: 'assistant', content: 'New chat started! How can I help?\n\n**Commands:** `/scan` redraw • `/plans` search • `/analyse` BOQ • `/clear` reset', timestamp: new Date() }])
                          }
                          toast.success('Session deleted')
                        } catch { toast.error('Failed to delete session') }
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all ml-0.5 shrink-0"
                      title="Delete session"
                    >
                      <Icon name="delete" size={12} className="text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div 
          className="flex-1 min-h-0 overflow-hidden relative"
        >
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
                  <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                    <img src="/images/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-md shadow-md' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md shadow-sm'
                  }`}>
                    {/* Markdown rendered content */}
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user'
                        ? '[&_p]:text-white [&_strong]:text-white [&_em]:text-white/90 [&_code]:text-white/90 [&_code]:bg-white/15 [&_li]:text-white [&_ul]:text-white [&_ol]:text-white [&_a]:text-indigo-200'
                        : '[&_p]:text-gray-800 [&_strong]:text-gray-900 [&_code]:bg-gray-100 [&_code]:text-indigo-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:text-gray-100 [&_pre_code]:p-0 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ul]:text-sm [&_ol]:text-sm [&_li]:text-sm [&_p]:text-sm [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-1.5 [&_a]:text-indigo-600'
                    }`}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>

                    {/* Suggested Project Buttons */}
                    {message.role === 'assistant' && message.suggestedProjects && message.suggestedProjects.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestedProjects.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              const lastUserMsg = [...messages].reverse().find(m => m.role === 'user' && m.content.startsWith('/'))
                              if (lastUserMsg) {
                                const cmd = lastUserMsg.content.split(' ')[0]
                                handleSendMessage(null, `${cmd} ${p.title}`)
                              } else {
                                handleSendMessage(null, `/scan ${p.title}`)
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 hover:border-indigo-200 transition-all flex items-center gap-1.5"
                          >
                            <Icon name="folder_shared" className="h-3.5 w-3.5" />
                            {p.title}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Generated image */}
                    {message.imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        <div 
                          className="relative group cursor-zoom-in"
                          onClick={() => setPreviewImage(resolveImageUrl(message.imageUrl!))}
                        >
                          <img 
                            src={resolveImageUrl(message.imageUrl)}
                            alt="AI Generated Drawing"
                            className="w-full h-auto max-h-72 object-contain bg-white"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="text-white flex flex-col items-center gap-1">
                              <Icon name="maximize2" className="h-5 w-5" />
                              <span className="text-[10px] font-medium">Click to enlarge</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
                          <span className="text-[10px] text-gray-500 flex items-center gap-1.5 font-medium">
                            <img src="/images/logo.png" alt="Logo" className="h-3.5 w-3.5 object-contain" />
                            {message.presetName ? message.presetName : 'Africa Contech Hub'}
                          </span>
                          <a
                            href={resolveImageUrl(message.imageUrl)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                          >
                            <Icon name="download" className="h-3 w-3" />
                            Download
                          </a>
                        </div>

                        {/* Feedback */}
                        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-100 bg-white/80">
                          {message.feedbackGiven ? (
                            <span className="text-[10px] text-green-600 font-medium flex items-center gap-1">
                              {message.feedbackGiven === 'up' ? (
                                <> <Icon name="thumb_up" className="h-3 w-3" /> Thanks for the feedback!</>
                              ) : (
                                <> <Icon name="thumb_down" className="h-3 w-3" /> We'll improve — thanks!</>
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
                                <Icon name="thumb_up" className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleFeedback(message.id, 'down')}
                                className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                title="Poor result"
                              >
                                <Icon name="thumb_down" className="h-3.5 w-3.5" />
                              </button>
                              <div className="flex-1" />
                              <button
                                onClick={() => handleRegenerate(message.id)}
                                disabled={isTyping}
                                className="p-1 rounded-md hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                title="Regenerate drawing"
                              >
                                <Icon name="refresh" className="h-3.5 w-3.5" />
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
                          <Icon name="search" className="h-3 w-3 text-violet-500" />
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
                                  onClick={() => setPreviewImage(resolveImageUrl(plan.image_url!))}
                                >
                                  <img
                                    src={resolveImageUrl(plan.image_url)}
                                    alt={plan.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <Icon name="maximize2" className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                  <Icon name="image" className="h-6 w-6 text-gray-300" />
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

                    {/* Analyse / BOQ results — all 8 sections */}
                    {message.analyse && (message.analyse.building_items?.length > 0 || message.analyse.professional_fees?.length > 0 || message.analyse.schedule_materials?.length > 0) && (() => {
                      const a = message.analyse!
                      const sections = [
                        { key: 'building_items', label: '1. Building Items', count: a.building_items?.length || 0, icon: 'foundation', color: 'emerald' },
                        { key: 'professional_fees', label: '2. Professional Fees', count: a.professional_fees?.length || 0, icon: 'gavel', color: 'blue' },
                        { key: 'admin_expenses', label: '3. Admin & Expenses', count: a.admin_expenses?.length || 0, icon: 'receipt', color: 'amber' },
                        { key: 'labour_costs', label: '4. Labour Costs', count: a.labour_costs?.length || 0, icon: 'engineering', color: 'orange' },
                        { key: 'machine_plants', label: '5. Machine & Plant', count: a.machine_plants?.length || 0, icon: 'precision_manufacturing', color: 'sky' },
                        { key: 'labour_breakdowns', label: '6. Labour Breakdown', count: a.labour_breakdowns?.length || 0, icon: 'groups', color: 'violet' },
                        { key: 'schedule_tasks', label: '7. Schedule Tasks', count: a.schedule_tasks?.length || 0, icon: 'calendar_month', color: 'indigo' },
                        { key: 'schedule_materials', label: '8. Materials', count: a.schedule_materials?.length || 0, icon: 'inventory_2', color: 'teal' },
                      ]
                      const totalItems = sections.reduce((s, sec) => s + sec.count, 0)
                      const buildTotal = (a.building_items || []).reduce((s: number, i: any) => s + (Number(i.quantity || 0) * Number(i.rate || 0)), 0)

                      return (
                      <div className="mt-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Icon name="assignment" className="h-3 w-3 text-emerald-500" />
                          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                            Project Budget — 8 Sheets Generated ({totalItems} total items)
                          </span>
                        </div>

                        {/* Section summary grid */}
                        <div className="grid grid-cols-4 gap-1 mb-2">
                          {sections.map(sec => (
                            <div key={sec.key} className={`flex items-center gap-1 px-1.5 py-1 rounded text-[9px] ${sec.count > 0 ? `bg-${sec.color}-50 text-${sec.color}-700` : 'bg-gray-50 text-gray-400'}`}>
                              <Icon name={sec.icon} className="h-2.5 w-2.5" />
                              <span className="font-medium truncate">{sec.label}</span>
                              <span className={`ml-auto font-bold ${sec.count > 0 ? '' : 'text-gray-300'}`}>{sec.count}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Building items preview table */}
                        {a.building_items && a.building_items.length > 0 && (
                        <div className="overflow-x-auto -mx-1 px-1">
                          <table className="w-full text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-emerald-50 text-emerald-700">
                                <th className="text-left px-2 py-1.5 font-semibold border-b border-emerald-200">#</th>
                                <th className="text-left px-2 py-1.5 font-semibold border-b border-emerald-200">Description</th>
                                <th className="text-left px-2 py-1.5 font-semibold border-b border-emerald-200">Spec</th>
                                <th className="text-center px-2 py-1.5 font-semibold border-b border-emerald-200">Unit</th>
                                <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Qty</th>
                                <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Rate</th>
                                <th className="text-right px-2 py-1.5 font-semibold border-b border-emerald-200">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {a.building_items.slice(0, 8).map((item: any, idx: number) => {
                                const amt = Number(item.quantity || 0) * Number(item.rate || 0)
                                return (
                                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-2 py-1 text-gray-500 border-b border-gray-100">{item.bill_no || idx + 1}</td>
                                  <td className="px-2 py-1 text-gray-800 font-medium border-b border-gray-100 max-w-[120px] truncate" title={item.description}>{item.description}</td>
                                  <td className="px-2 py-1 text-gray-500 border-b border-gray-100 max-w-[80px] truncate" title={item.specification || ''}>{item.specification || '-'}</td>
                                  <td className="px-2 py-1 text-center text-gray-500 border-b border-gray-100">{item.unit || '-'}</td>
                                  <td className="px-2 py-1 text-right text-gray-700 border-b border-gray-100">{Number(item.quantity || 0).toLocaleString()}</td>
                                  <td className="px-2 py-1 text-right text-gray-700 border-b border-gray-100">${Number(item.rate || 0).toLocaleString()}</td>
                                  <td className="px-2 py-1 text-right text-gray-800 font-medium border-b border-gray-100">${amt.toLocaleString()}</td>
                                </tr>
                              )})}
                              {a.building_items.length > 8 && (
                                <tr className="bg-white">
                                  <td colSpan={7} className="px-2 py-1.5 text-center text-gray-500 italic border-b border-gray-100">
                                    ... and {a.building_items.length - 8} more building items
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot className="bg-emerald-50 border-t border-emerald-200">
                              <tr>
                                <td colSpan={6} className="px-2 py-1.5 text-right text-emerald-700 font-semibold text-[10px]">Building Items Subtotal</td>
                                <td className="px-2 py-1.5 text-right text-emerald-800 font-bold text-[10px]">${buildTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                        )}

                        {/* Save to Budget — prominent CTA */}
                        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="save" className="h-4 w-4 text-emerald-600" />
                            <p className="text-xs font-bold text-emerald-800">Save to Project Budget</p>
                          </div>
                          <p className="text-[10px] text-emerald-700 mb-2">
                            This will populate all 8 budget sheets ({totalItems} items) directly into the Construction Budget page.
                          </p>
                          <div className="flex gap-2 items-center">
                            {!project && (
                            <select 
                              value={selectedProjectId} 
                              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                              className="flex-1 text-[10px] px-2 py-2 rounded-md border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="" disabled>Select a project...</option>
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                              ))}
                            </select>
                            )}
                            <button
                              onClick={() => handleSaveToBOQ(message.analyse!)}
                              disabled={isSavingBOQ || !resolvedProjectId}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold rounded-lg shadow-md transition-all whitespace-nowrap"
                            >
                              <Icon name="save" className="h-3.5 w-3.5" />
                              {isSavingBOQ ? 'Saving all sheets...' : 'Save to Budget'}
                            </button>
                          </div>
                          {boqSaveSuccessMsg && (
                            <p className={`text-[10px] font-medium mt-2 ${boqSaveSuccessMsg.includes('Error') || boqSaveSuccessMsg.includes('Select') ? 'text-red-600' : 'text-emerald-700'}`}>
                              {boqSaveSuccessMsg}
                              {!boqSaveSuccessMsg.includes('Error') && !boqSaveSuccessMsg.includes('Select') && (
                                <a href="/builder/measurements" className="ml-2 underline text-emerald-800 hover:text-emerald-900 font-semibold">
                                  Open Budget Page →
                                </a>
                              )}
                            </p>
                          )}
                        </div>

                        {/* Export buttons */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            onClick={() => exportBOQToCSV(message.analyse!)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] font-medium transition-colors"
                          >
                            <Icon name="receipt_long" className="h-3 w-3" />
                            Export CSV
                          </button>
                          <button
                            onClick={() => exportBOQToPrint(message.analyse!)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-medium transition-colors"
                          >
                            <Icon name="print" className="h-3 w-3" />
                            Print / PDF
                          </button>
                        </div>
                      </div>
                    )})()}
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] mt-1.5 px-1 ${message.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* User avatar */}
                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="person" className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing indicator */}
            {(isTyping || toolStatus) && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/images/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  {isGeneratingImage || isScanningPlan ? (
                    <div className="flex flex-col gap-2 text-xs text-gray-600 min-w-[260px] max-w-[340px]">
                      <div className="flex items-center gap-2">
                        <Icon name={isScanningPlan ? "document_scanner" : "architecture"} className={`h-4 w-4 animate-pulse ${isScanningPlan ? 'text-cyan-500' : 'text-indigo-500'}`} />
                        <span className={`font-semibold ${isScanningPlan ? 'text-cyan-700' : 'text-indigo-700'}`}>
                          {isScanningPlan ? 'Budget Engineer — Redrawing Plan' : 'Budget Engineer — Designing Floor Plan'}
                        </span>
                      </div>

                      {/* Reasoning log */}
                      <div className={`ml-6 border-l-2 ${isScanningPlan ? 'border-cyan-200' : 'border-indigo-200'} pl-3 space-y-1 max-h-[180px] overflow-y-auto`}>
                        {drawReasoningLog.length === 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <span className={`w-1.5 h-1.5 ${isScanningPlan ? 'bg-cyan-400' : 'bg-indigo-400'} rounded-full animate-ping`} />
                            Initializing drawing engine...
                          </div>
                        )}
                        {drawReasoningLog.map((msg, i) => {
                          const isLatest = i === drawReasoningLog.length - 1
                          return (
                            <div key={i} className={`flex items-start gap-1.5 text-[10px] transition-all ${isLatest ? (isScanningPlan ? 'text-cyan-700 font-medium' : 'text-indigo-700 font-medium') : 'text-gray-400'}`}>
                              {isLatest ? (
                                <span className={`w-1.5 h-1.5 mt-1 ${isScanningPlan ? 'bg-cyan-500' : 'bg-indigo-500'} rounded-full animate-pulse shrink-0`} />
                              ) : (
                                <Icon name="check_circle" className={`h-3 w-3 ${isScanningPlan ? 'text-cyan-400' : 'text-indigo-400'} shrink-0 mt-0.5`} />
                              )}
                              <span>{msg}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Step pills */}
                      <div className="flex flex-wrap gap-1 ml-6 mt-1">
                        {([
                          { key: 'reading', label: 'Read' },
                          { key: 'formulating', label: 'Formulate' },
                          { key: 'rendering', label: 'Render' },
                          { key: 'refining', label: 'Refine' },
                        ] as const).map((s) => {
                          const allSteps = ['idle','reading','formulating','rendering','refining','done']
                          const currentIdx = allSteps.indexOf(drawStep)
                          const stepIdx = allSteps.indexOf(s.key)
                          const isActive = drawStep === s.key
                          const isComplete = currentIdx > stepIdx
                          return (
                            <span key={s.key} className={`text-[8px] px-1.5 py-0.5 rounded-full transition-all ${
                              isActive ? (isScanningPlan ? 'bg-cyan-100 text-cyan-700 font-bold ring-1 ring-cyan-300' : 'bg-indigo-100 text-indigo-700 font-bold ring-1 ring-indigo-300') :
                              isComplete ? (isScanningPlan ? 'bg-cyan-50 text-cyan-500' : 'bg-indigo-50 text-indigo-500') :
                              'bg-gray-100 text-gray-300'
                            }`}>
                              {isComplete ? '\u2713 ' : ''}{s.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ) : isSearchingPlans ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Icon name="manage_search" className="h-3.5 w-3.5 animate-pulse text-violet-500" />
                      <span>Searching floor plan library...</span>
                    </div>
                  ) : isAnalysing ? (
                    <div className="flex flex-col gap-2 text-xs text-gray-600 min-w-[260px] max-w-[340px]">
                      <div className="flex items-center gap-2">
                        <Icon name="analytics" className="h-4 w-4 animate-pulse text-emerald-500" />
                        <span className="font-semibold text-emerald-700">Budget Engineer — Analysing Drawing</span>
                      </div>

                      {/* Reasoning log */}
                      <div className="ml-6 border-l-2 border-emerald-200 pl-3 space-y-1 max-h-[180px] overflow-y-auto">
                        {analyseReasoningLog.length === 0 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                            Uploading drawing to Gemini Pro...
                          </div>
                        )}
                        {analyseReasoningLog.map((msg, i) => {
                          const isLatest = i === analyseReasoningLog.length - 1
                          return (
                            <div key={i} className={`flex items-start gap-1.5 text-[10px] transition-all ${isLatest ? 'text-emerald-700 font-medium' : 'text-gray-400'}`}>
                              {isLatest ? (
                                <span className="w-1.5 h-1.5 mt-1 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                              ) : (
                                <Icon name="check_circle" className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                              )}
                              <span>{msg}</span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Step pills */}
                      <div className="flex flex-wrap gap-1 ml-6 mt-1">
                        {([
                          { key: 'uploading', label: 'Upload' },
                          { key: 'reading', label: 'Read' },
                          { key: 'measuring', label: 'Measure' },
                          { key: 'costing', label: 'Cost' },
                          { key: 'labour', label: 'Labour' },
                          { key: 'schedule', label: 'Schedule' },
                          { key: 'materials', label: 'Materials' },
                          { key: 'compliance', label: 'SI-56' },
                          { key: 'finalising', label: 'Finalise' },
                        ] as const).map((s, i) => {
                          const allSteps = ['idle','uploading','reading','measuring','costing','labour','schedule','materials','compliance','finalising','done']
                          const currentIdx = allSteps.indexOf(analyseStep)
                          const stepIdx = allSteps.indexOf(s.key)
                          const isActive = analyseStep === s.key
                          const isComplete = currentIdx > stepIdx
                          return (
                            <span key={s.key} className={`text-[8px] px-1.5 py-0.5 rounded-full transition-all ${
                              isActive ? 'bg-emerald-100 text-emerald-700 font-bold ring-1 ring-emerald-300' :
                              isComplete ? 'bg-emerald-50 text-emerald-500' :
                              'bg-gray-100 text-gray-300'
                            }`}>
                              {isComplete ? '\u2713 ' : ''}{s.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  ) : toolStatus ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Icon name="precision_manufacturing" className="h-3.5 w-3.5 animate-pulse text-amber-500" />
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
          <form 
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 relative"
          >
            <div className="relative flex-1">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="/draw, /scan, /plans, /analyse"
                maxLength={4000}
                className="pr-12 rounded-xl border-gray-200 bg-gray-50 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 h-12 text-sm"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-sm flex items-center justify-center"
              >
                <Icon name="send" className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <div className="text-center mt-2.5">
            <p className="text-[10px] text-gray-400 font-medium">
              <span className="text-indigo-500">/draw</span> generate • <span className="text-cyan-500">/scan</span> redraw • <span className="text-violet-500">/plans</span> search • <span className="text-emerald-500">/analyse</span> BOQ • <span className="text-red-400">/clear</span> reset
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-5xl w-full p-1 bg-transparent border-0 shadow-none overflow-hidden [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-black/80 z-[10000]">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <DialogDescription className="sr-only">Enlarged view of the chat attachment.</DialogDescription>
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
