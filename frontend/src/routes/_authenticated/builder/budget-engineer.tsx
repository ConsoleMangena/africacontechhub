import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { Icon } from "@/components/ui/material-icon";
import { useState, useRef, useEffect, useCallback } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { ProjectWorkspacePicker } from "@/features/dashboards/builder/components/project-workspace-picker";
import { builderApi, aiApi } from "@/services/api";
import type { Project, BOQBuildingItem, BOQProfessionalFee, BOQAdminExpense, BOQLabourCost, BOQMachinePlant, BOQLabourBreakdown, BOQScheduleTask, BOQScheduleMaterial } from "@/types/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

export const Route = createFileRoute("/_authenticated/builder/budget-engineer")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: (search.projectId as string) || undefined,
  }),
});

/* ── Types ── */
interface AnalyseResult {
  summary: string
  building_items: BOQBuildingItem[]
  professional_fees: BOQProfessionalFee[]
  admin_expenses: BOQAdminExpense[]
  labour_costs: BOQLabourCost[]
  machine_plants: BOQMachinePlant[]
  labour_breakdowns: BOQLabourBreakdown[]
  schedule_tasks: BOQScheduleTask[]
  schedule_materials: BOQScheduleMaterial[]
  compliance_notes: string[]
  recommendations: string[]
}

interface FloorPlanResult {
  id: number
  title: string
  description: string
  category_name: string
  image_url: string | null
  created_at: string | null
}

type ToolResult = {
  type: 'analyse'
  data: AnalyseResult
  summary: string
} | {
  type: 'scan'
  imageUrl: string
  message: string
} | {
  type: 'plans'
  plans: FloorPlanResult[]
  message: string
} | {
  type: 'error'
  message: string
} | {
  type: 'info'
  message: string
}

type AnalyseStep = 'idle' | 'uploading' | 'reading' | 'measuring' | 'costing' | 'labour' | 'schedule' | 'materials' | 'compliance' | 'finalising' | 'done'
type DrawStep = 'idle' | 'reading' | 'formulating' | 'rendering' | 'refining' | 'done'

const ANALYSE_STEPS: { key: AnalyseStep; label: string }[] = [
  { key: 'uploading', label: 'Upload' },
  { key: 'reading', label: 'Read' },
  { key: 'measuring', label: 'Measure' },
  { key: 'costing', label: 'Cost' },
  { key: 'labour', label: 'Labour' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'materials', label: 'Materials' },
  { key: 'compliance', label: 'SI-56' },
  { key: 'finalising', label: 'Finalise' },
]

const DRAW_STEPS: { key: DrawStep; label: string }[] = [
  { key: 'reading', label: 'Read' },
  { key: 'formulating', label: 'Formulate' },
  { key: 'rendering', label: 'Render' },
  { key: 'refining', label: 'Refine' },
]

function RouteComponent() {
  const { projectId: searchProjectId } = Route.useSearch();
  const navigate = useNavigate();
  const builderStore = useBuilderStore();
  const resolvedProjectId = searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(resolvedProjectId);

  const selectProject = (id: number) => {
    setSelectedProject(id);
    builderStore.selectProject(id);
    navigate({
      to: "/builder/budget-engineer",
      search: { projectId: String(id) },
      replace: true,
    });
  };

  const exitProject = useCallback(() => {
    setSelectedProject(null);
    clearResults();
    builderStore.exitProject();
    navigate({
      to: "/builder/budget-engineer",
      search: { projectId: undefined },
      replace: true,
    });
  }, [navigate, builderStore]);

  const currentProject = projects.find((p) => p.id === selectedProject);

  useEffect(() => {
    setSelectedProject(searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null);
  }, [searchProjectId, builderStore.selectedProjectId]);

  useEffect(() => {
    setLoadingProjects(true);
    builderApi
      .getProjects()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
        setProjects(data);
      })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoadingProjects(false));
  }, []);

  // --- Budget Engineer State ---
  const [results, setResults] = useState<ToolResult[]>([]);
  const [sessionId, setSessionId] = useState<number | undefined>(undefined);
  const sessionIdRef = useRef<number | undefined>(undefined);

  const [runningTool, setRunningTool] = useState<'analyse' | 'scan' | 'plans' | null>(null);
  const [analyseStep, setAnalyseStep] = useState<AnalyseStep>('idle');
  const [analyseLog, setAnalyseLog] = useState<string[]>([]);
  const [drawStep, setDrawStep] = useState<DrawStep>('idle');
  const [drawLog, setDrawLog] = useState<string[]>([]);

  const [isSavingBOQ, setIsSavingBOQ] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- History State ---
  interface HistoryEntry {
    id: number;
    project: number;
    user: number | null;
    user_name: string;
    file_name: string;
    summary: string;
    data: AnalyseResult;
    total_items: number;
    total_cost: number;
    created_at: string;
  }
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [viewingBOQ, setViewingBOQ] = useState<{ data: AnalyseResult; summary: string; title: string } | null>(null);
  const [boqTab, setBOQTab] = useState<string>('building_items');
  const lastAnalysedFileName = useRef<string>('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiBase = isLocalhost ? (import.meta.env.VITE_API_URL || 'http://localhost:8000') : '';
  const resolveImageUrl = (url: string) => url.startsWith('http') ? url : `${apiBase}${url}`;

  // Load history from DB when project is selected
  const fetchHistory = useCallback((projectId: number) => {
    setLoadingHistory(true);
    builderApi.getAnalysisHistory(projectId)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
        setHistory(data);
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingHistory(false));
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchHistory(selectedProject);
    } else {
      setHistory([]);
    }
  }, [selectedProject, fetchHistory]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [results, runningTool]);

  /* ── Run /analyse ── */
  const runAnalyse = async () => {
    if (!selectedProject || runningTool) return;
    setRunningTool('analyse');
    setAnalyseLog([]);
    setAnalyseStep('uploading');

    const chatHistory = [{ role: 'user' as const, content: '/analyse' }];

    try {
      // Fetch drawings
      const drawingsRes = await builderApi.getProjectDrawingRequests(selectedProject);
      const allRequests = Array.isArray(drawingsRes.data) ? drawingsRes.data : (drawingsRes.data as any).results || [];
      const allFiles = allRequests.flatMap((r: any) => r.files || []);

      if (allFiles.length === 0) {
        setResults(prev => [...prev, { type: 'error', message: 'No drawing files found. Upload drawings via the Design Drafting page first, then try again.' }]);
        setRunningTool(null);
        setAnalyseStep('idle');
        return;
      }

      const imageFile = allFiles.find((f: any) => ['png', 'jpg', 'jpeg', 'webp'].includes(f.file_type?.toLowerCase()));
      const pdfFile = allFiles.find((f: any) => f.file_type?.toLowerCase() === 'pdf');
      const chosenFile = imageFile || pdfFile || allFiles[0];
      const fileUrl = chosenFile.file.startsWith('http') ? chosenFile.file : `${apiBase}${chosenFile.file}`;

      setResults(prev => [...prev, { type: 'info', message: `Analysing **${chosenFile.original_name}** (${chosenFile.file_type?.toUpperCase()}) from ${allFiles.length} file(s)...` }]);
      lastAnalysedFileName.current = chosenFile.original_name || 'drawing';

      const fileRes = await fetch(fileUrl);
      const blob = await fileRes.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      let autoImage: string | undefined;
      let autoPdf: string | undefined;
      if (chosenFile.file_type?.toLowerCase() === 'pdf') {
        autoPdf = base64.split(',')[1];
      } else {
        autoImage = base64;
      }

      // Progress simulation
      const stepTimers: { step: AnalyseStep; msg: string; delay: number }[] = [
        { step: 'reading', msg: 'Reading drawing & identifying building elements...', delay: 800 },
        { step: 'measuring', msg: 'Measuring dimensions — walls, openings, floor areas...', delay: 3500 },
        { step: 'costing', msg: 'Calculating quantities & applying rates...', delay: 7000 },
        { step: 'labour', msg: 'Estimating labour gangs, durations & wage bills...', delay: 11000 },
        { step: 'schedule', msg: 'Building project schedule & task timeline...', delay: 15000 },
        { step: 'materials', msg: 'Compiling schedule of materials by section...', delay: 19000 },
        { step: 'compliance', msg: 'Checking SI-56 compliance & room schedule...', delay: 23000 },
        { step: 'finalising', msg: 'Finalising 8-sheet budget & recommendations...', delay: 27000 },
      ];
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (const { step, msg, delay } of stepTimers) {
        timers.push(setTimeout(() => {
          setAnalyseStep(step);
          setAnalyseLog(prev => [...prev, msg]);
        }, delay));
      }

      const response = await aiApi.sendMessage(chatHistory, sessionId, autoImage, autoPdf, selectedProject);

      timers.forEach(clearTimeout);
      setAnalyseStep('done');
      setAnalyseLog(prev => [...prev, 'Budget generation complete — 8 sheets ready!']);

      if (response.data.session_id && !sessionIdRef.current) {
        setSessionId(response.data.session_id);
        sessionIdRef.current = response.data.session_id;
      }

      if (response.data.analyse) {
        const analyseData = response.data.analyse;
        setResults(prev => [...prev, {
          type: 'analyse',
          data: analyseData,
          summary: response.data.message || '',
        }]);

        // Auto-save to DB
        if (selectedProject) {
          const sections = [
            analyseData.building_items, analyseData.professional_fees,
            analyseData.admin_expenses, analyseData.labour_costs,
            analyseData.machine_plants, analyseData.labour_breakdowns,
            analyseData.schedule_tasks, analyseData.schedule_materials,
          ];
          const totalItems = sections.reduce((s, arr) => s + (arr?.length || 0), 0);
          const totalCost = (analyseData.building_items || []).reduce((s: number, i: any) => s + (Number(i.quantity || 0) * Number(i.rate || 0)), 0);
          builderApi.createAnalysisHistory({
            project: selectedProject,
            file_name: lastAnalysedFileName.current,
            summary: response.data.message || '',
            data: analyseData,
            total_items: totalItems,
            total_cost: totalCost,
          }).then(() => fetchHistory(selectedProject)).catch(() => { /* silent */ });
        }
      } else {
        setResults(prev => [...prev, { type: 'info', message: response.data.message || 'Analysis complete.' }]);
      }
    } catch (err) {
      console.error('Analyse failed', err);
      setResults(prev => [...prev, { type: 'error', message: 'Failed to analyse drawing. Please check your connection or wait for drawing processing.' }]);
    } finally {
      setRunningTool(null);
      setAnalyseStep('idle');
      setAnalyseLog([]);
    }
  };

  /* ── Run /scan ── */
  const runScan = async () => {
    if (!selectedProject || runningTool) return;
    setRunningTool('scan');
    setDrawLog([]);
    setDrawStep('idle');

    const chatHistory = [{ role: 'user' as const, content: '/scan' }];

    try {
      const stepTimers: { step: DrawStep; msg: string; delay: number }[] = [
        { step: 'reading', msg: 'Analyzing uploaded sketch or plan...', delay: 800 },
        { step: 'formulating', msg: 'Extracting walls, doors, and room layouts...', delay: 3500 },
        { step: 'rendering', msg: 'Converting to professional CAD-style rendering...', delay: 7000 },
        { step: 'refining', msg: 'Finalizing high-resolution output...', delay: 11000 },
      ];
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (const { step, msg, delay } of stepTimers) {
        timers.push(setTimeout(() => {
          setDrawStep(step);
          setDrawLog(prev => [...prev, msg]);
        }, delay));
      }

      const response = await aiApi.sendMessage(chatHistory, sessionId, undefined, undefined, selectedProject);

      timers.forEach(clearTimeout);
      setDrawStep('done');
      setDrawLog(prev => [...prev, 'Architectural drawing complete!']);

      if (response.data.session_id && !sessionIdRef.current) {
        setSessionId(response.data.session_id);
        sessionIdRef.current = response.data.session_id;
      }

      if (response.data.image_url) {
        setResults(prev => [...prev, {
          type: 'scan',
          imageUrl: response.data.image_url,
          message: response.data.message || 'Drawing generated.',
        }]);
      } else {
        setResults(prev => [...prev, { type: 'info', message: response.data.message || 'Scan complete.' }]);
      }
    } catch (err) {
      console.error('Scan failed', err);
      setResults(prev => [...prev, { type: 'error', message: 'Failed to scan drawing. Please try again.' }]);
    } finally {
      setRunningTool(null);
      setDrawStep('idle');
      setDrawLog([]);
    }
  };

  /* ── Run /plans ── */
  const runPlansSearch = async () => {
    if (!selectedProject || runningTool) return;
    setRunningTool('plans');

    const chatHistory = [{ role: 'user' as const, content: '/plans' }];

    try {
      const response = await aiApi.sendMessage(chatHistory, sessionId, undefined, undefined, selectedProject);

      if (response.data.session_id && !sessionIdRef.current) {
        setSessionId(response.data.session_id);
        sessionIdRef.current = response.data.session_id;
      }

      if (response.data.floor_plans?.length) {
        setResults(prev => [...prev, {
          type: 'plans',
          plans: response.data.floor_plans,
          message: response.data.message || '',
        }]);
      } else {
        setResults(prev => [...prev, { type: 'info', message: response.data.message || 'No plans found.' }]);
      }
    } catch (err) {
      console.error('Plans search failed', err);
      setResults(prev => [...prev, { type: 'error', message: 'Failed to search plans. Please try again.' }]);
    } finally {
      setRunningTool(null);
    }
  };

  /* ── Save BOQ ── */
  const handleSaveToBOQ = async (analyse: AnalyseResult) => {
    if (!selectedProject) return;
    setIsSavingBOQ(true);
    let createdCount = 0;
    try {
      const existingRes = await builderApi.getProjectBudgetSheets(selectedProject);
      const ext = existingRes.data;

      if (analyse.building_items) {
        for (let idx = 0; idx < analyse.building_items.length; idx++) {
          const item = analyse.building_items[idx];
          const description = (item.description || '').trim();
          const billNo = item.bill_no || String(idx + 1);
          const specification = (item.specification || '').trim() || undefined;
          if (!description) continue;
          if (!ext.building_items?.some((e: any) => e.description === description && e.bill_no === billNo)) {
            await builderApi.createBOQBuildingItem({
              project: selectedProject,
              bill_no: billNo, description, specification,
              unit: item.unit || 'item', quantity: item.quantity, rate: item.rate,
              is_ai_generated: true,
            });
          }
        }
      }
      if (analyse.professional_fees) {
        for (const item of analyse.professional_fees) {
          if (!ext.professional_fees?.some((e: any) => e.discipline === item.discipline && e.role_scope === item.role_scope)) {
            await builderApi.createBOQProfessionalFee({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      if (analyse.admin_expenses) {
        for (const item of analyse.admin_expenses) {
          if (!ext.admin_expenses?.some((e: any) => e.item_role === item.item_role && e.description === item.description)) {
            await builderApi.createBOQAdminExpense({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      if (analyse.labour_costs) {
        for (const item of analyse.labour_costs) {
          if (!ext.labour_costs?.some((e: any) => e.phase === item.phase && e.trade_role === item.trade_role)) {
            await builderApi.createBOQLabourCost({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      if (analyse.machine_plants) {
        for (const item of analyse.machine_plants) {
          if (!ext.machine_plants?.some((e: any) => e.machine_item === item.machine_item && e.category === item.category)) {
            await builderApi.createBOQMachinePlant({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      if (analyse.labour_breakdowns) {
        for (const item of analyse.labour_breakdowns) {
          if (!ext.labour_breakdowns?.some((e: any) => e.phase === item.phase && e.trade_role === item.trade_role)) {
            await builderApi.createBOQLabourBreakdown({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      if (analyse.schedule_tasks) {
        for (const item of analyse.schedule_tasks) {
          if (!ext.schedule_tasks?.some((e: any) => e.wbs === item.wbs && e.task_description === item.task_description)) {
            await builderApi.createBOQScheduleTask({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      if (analyse.schedule_materials) {
        for (const item of analyse.schedule_materials) {
          if (!ext.schedule_materials?.some((e: any) => e.section === item.section && e.material_description === item.material_description)) {
            await builderApi.createScheduleMaterial({ ...item, project: selectedProject, is_ai_generated: true });
            createdCount++;
          }
        }
      }
      
      if (createdCount > 0) {
        toast.success(`Budget sheets updated! Added ${createdCount} new items.`);
      } else {
        toast.error('This budget analysis was already saved. Duplicate items were skipped.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error saving some items.');
    } finally {
      setIsSavingBOQ(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setSessionId(undefined);
    sessionIdRef.current = undefined;
  };

  if (loadingProjects) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Select a project tile to activate the Budget Engineer for this project."
              projects={[]}
              loading
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })}
              primaryActionLabel="Open Portfolio"
            />
          </div>
        </Main>
      </>
    );
  }

  if (!selectedProject || !currentProject) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4">
            <Search />
            <ProfileDropdown />
          </div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Pick a project tile to open the Budget Engineer tools for BOQ extraction, scanning plans, and AI insights."
              projects={projects}
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })}
              primaryActionLabel="Open Portfolio"
              emptyTitle="No projects ready"
              emptyDescription="Create a project from the builder portfolio first, then return here to use the Budget Engineer."
            />
          </div>
        </Main>
      </>
    );
  }

  const isBusy = runningTool !== null;

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Icon name="engineering" className="text-emerald-600" size={28} />
                Budget Engineer
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                AI-powered extraction, scanning, and BOQ tools for <strong>{currentProject.title}</strong>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exitProject}
                className="h-9 px-4 flex items-center text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Icon name="logout" size={16} className="mr-1.5" />
                Change Project
              </button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Available Tools</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={runAnalyse}
                disabled={isBusy}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all',
                  runningTool === 'analyse'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 scale-[0.98]'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md',
                  isBusy && runningTool !== 'analyse' && 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50',
                )}
              >
                <Icon name="analytics" size={36} className={runningTool === 'analyse' ? 'animate-pulse' : ''} />
                <div>
                  <span className="block text-sm font-bold uppercase tracking-widest text-slate-900 mb-1">Analyse Drawings</span>
                  <span className="block text-[11px] text-slate-500 font-medium">Extract quantities and rates to build BOQ</span>
                </div>
              </button>
              <button
                onClick={runScan}
                disabled={isBusy}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all',
                  runningTool === 'scan'
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-700 scale-[0.98]'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-md',
                  isBusy && runningTool !== 'scan' && 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50',
                )}
              >
                <Icon name="document_scanner" size={36} className={runningTool === 'scan' ? 'animate-pulse' : ''} />
                <div>
                  <span className="block text-sm font-bold uppercase tracking-widest text-slate-900 mb-1">Scan Plan</span>
                  <span className="block text-[11px] text-slate-500 font-medium">Redraw sketches into clean architectural plans</span>
                </div>
              </button>
              <button
                onClick={runPlansSearch}
                disabled={isBusy}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border-2 p-5 text-center transition-all',
                  runningTool === 'plans'
                    ? 'border-violet-300 bg-violet-50 text-violet-700 scale-[0.98]'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md',
                  isBusy && runningTool !== 'plans' && 'opacity-40 cursor-not-allowed border-slate-100 bg-slate-50',
                )}
              >
                <Icon name="manage_search" size={36} className={runningTool === 'plans' ? 'animate-pulse' : ''} />
                <div>
                  <span className="block text-sm font-bold uppercase tracking-widest text-slate-900 mb-1">Search Library</span>
                  <span className="block text-[11px] text-slate-500 font-medium">Find matching standard floor plans</span>
                </div>
              </button>
            </div>
            {results.length > 0 && !isBusy && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearResults}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <Icon name="delete_sweep" size={16} />
                  Clear Results
                </button>
              </div>
            )}
          </div>

          {/* Analysis History Panel */}
          {(history.length > 0 || loadingHistory) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setHistoryExpanded(!historyExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon name="history" size={20} className="text-slate-600" />
                  <span className="text-sm font-bold text-slate-900">Analysis History</span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {history.length}
                  </span>
                </div>
                <Icon name={historyExpanded ? 'expand_less' : 'expand_more'} size={20} className="text-slate-400" />
              </button>
              {historyExpanded && (
                <div className="border-t border-slate-100">
                  {loadingHistory ? (
                    <div className="p-6 text-center text-sm text-slate-400">Loading history…</div>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                      {history.map((entry) => {
                        const date = new Date(entry.created_at);
                        const buildCost = Number(entry.total_cost || 0);
                        return (
                          <div
                            key={entry.id}
                            className="px-5 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                              <Icon name="assignment" size={18} className="text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{entry.file_name || 'Drawing Analysis'}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                                <span className="text-[11px] text-slate-400">
                                  {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {entry.total_items} items
                                </span>
                                {buildCost > 0 && (
                                  <span className="text-[11px] text-emerald-600 font-bold">
                                    ${buildCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setViewingBOQ({
                                  data: entry.data,
                                  summary: entry.summary,
                                  title: `${entry.file_name || 'Analysis'} — ${date.toLocaleDateString()}`,
                                })}
                                className="h-8 px-3 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1"
                              >
                                <Icon name="visibility" size={14} />
                                View BOQ
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Delete this analysis from history?')) return;
                                  try {
                                    await builderApi.deleteAnalysisHistory(entry.id);
                                    setHistory(prev => prev.filter(h => h.id !== entry.id));
                                    toast.success('Analysis removed from history');
                                  } catch {
                                    toast.error('Failed to delete');
                                  }
                                }}
                                className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Icon name="delete_outline" size={16} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Active progress */}
          {runningTool === 'analyse' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="analytics" size={20} className="text-emerald-600 animate-pulse" />
                <span className="text-sm font-bold text-emerald-700">Analysing Drawing for Quantity Takeoff…</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {ANALYSE_STEPS.map((s) => {
                  const allKeys = ['idle', 'uploading', 'reading', 'measuring', 'costing', 'labour', 'schedule', 'materials', 'compliance', 'finalising', 'done'];
                  const cur = allKeys.indexOf(analyseStep);
                  const idx = allKeys.indexOf(s.key);
                  const active = analyseStep === s.key;
                  const done = cur > idx;
                  return (
                    <span key={s.key} className={cn(
                      'text-xs px-2.5 py-1 rounded-full transition-all flex items-center gap-1',
                      active ? 'bg-emerald-200 text-emerald-800 font-bold ring-2 ring-emerald-300 ring-offset-1' :
                      done ? 'bg-emerald-100 text-emerald-600 font-medium' : 'bg-slate-100 text-slate-400 font-medium',
                    )}>
                      {done && <Icon name="check" size={12} />}
                      {s.label}
                    </span>
                  )
                })}
              </div>
              {analyseLog.length > 0 && (
                <div className="bg-white rounded-lg border border-emerald-100 p-3 shadow-inner">
                  <div className="border-l-2 border-emerald-200 pl-3 space-y-1">
                    {analyseLog.map((msg, i) => (
                      <p key={i} className={cn('text-sm transition-all', i === analyseLog.length - 1 ? 'text-emerald-700 font-medium scale-100 opacity-100' : 'text-slate-500 scale-95 opacity-70')}>
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {runningTool === 'scan' && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50/50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="document_scanner" size={20} className="text-cyan-600 animate-pulse" />
                <span className="text-sm font-bold text-cyan-700">Redrawing Plan…</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {DRAW_STEPS.map((s) => {
                  const allKeys = ['idle', 'reading', 'formulating', 'rendering', 'refining', 'done'];
                  const cur = allKeys.indexOf(drawStep);
                  const idx = allKeys.indexOf(s.key);
                  const active = drawStep === s.key;
                  const done = cur > idx;
                  return (
                    <span key={s.key} className={cn(
                      'text-xs px-2.5 py-1 rounded-full transition-all flex items-center gap-1',
                      active ? 'bg-cyan-200 text-cyan-800 font-bold ring-2 ring-cyan-300 ring-offset-1' :
                      done ? 'bg-cyan-100 text-cyan-600 font-medium' : 'bg-slate-100 text-slate-400 font-medium',
                    )}>
                      {done && <Icon name="check" size={12} />}
                      {s.label}
                    </span>
                  )
                })}
              </div>
              {drawLog.length > 0 && (
                <div className="bg-white rounded-lg border border-cyan-100 p-3 shadow-inner">
                  <div className="border-l-2 border-cyan-200 pl-3 space-y-1">
                    {drawLog.map((msg, i) => (
                      <p key={i} className={cn('text-sm', i === drawLog.length - 1 ? 'text-cyan-700 font-medium' : 'text-slate-500')}>
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {runningTool === 'plans' && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-5 shadow-sm flex items-center gap-3">
              <Icon name="manage_search" size={24} className="text-violet-600 animate-pulse" />
              <span className="text-sm font-bold text-violet-700">Searching floor plan library across standard models…</span>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-6">
            {results.length === 0 && !runningTool && (
              <div className="text-center py-16 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                <Icon name="engineering" size={48} className="mx-auto text-emerald-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">Budget Engineer is ready</h3>
                <p className="max-w-md mx-auto text-sm text-slate-500">
                  Select a tool above to analyze your project drawings, extract BOQ items automatically, or redraw sketches.
                </p>
              </div>
            )}

            {results.map((result, idx) => (
              <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Info message */}
                {result.type === 'info' && (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="prose prose-sm max-w-none text-slate-600">
                      <ReactMarkdown>{result.message}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Error */}
                {result.type === 'error' && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm flex items-start gap-3">
                    <Icon name="error_outline" size={24} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-800 mb-1">Error processing request</h4>
                      <p className="text-sm text-red-700">{result.message}</p>
                    </div>
                  </div>
                )}

                {/* Scan result — image */}
                {result.type === 'scan' && (
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                      <Icon name="document_scanner" size={18} className="text-cyan-600" />
                      <h4 className="font-bold text-slate-900 text-lg tracking-tight">AI-Generated Architectural Plan</h4>
                    </div>
                    <div className="p-5 flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/2">
                        <div
                          className="relative cursor-zoom-in group rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                          onClick={() => setPreviewImage(resolveImageUrl(result.imageUrl))}
                        >
                          <img
                            src={resolveImageUrl(result.imageUrl)}
                            alt="AI Generated Drawing"
                            className="w-full h-auto object-contain"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <Icon name="zoom_in" size={32} className="text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                      <div className="w-full md:w-1/2 flex flex-col">
                        <div className="prose prose-sm max-w-none text-slate-600 mb-6 flex-1">
                          <ReactMarkdown>{result.message}</ReactMarkdown>
                        </div>
                        <a
                          href={resolveImageUrl(result.imageUrl)}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm w-full md:w-max"
                        >
                          <Icon name="download" size={16} />
                          Download High-Res Plan
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Plans search result */}
                {result.type === 'plans' && (
                  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                      <Icon name="manage_search" size={18} className="text-violet-600" />
                      <h4 className="font-bold text-slate-900 text-lg tracking-tight">
                        {result.plans.length} Floor Plan{result.plans.length !== 1 ? 's' : ''} Found
                      </h4>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {result.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all group flex flex-col"
                        >
                          {plan.image_url ? (
                            <div
                              className="aspect-video bg-slate-100 overflow-hidden relative cursor-zoom-in"
                              onClick={() => setPreviewImage(resolveImageUrl(plan.image_url!))}
                            >
                              <img
                                src={resolveImageUrl(plan.image_url)}
                                alt={plan.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-slate-100 flex items-center justify-center">
                              <Icon name="image" size={32} className="text-slate-300" />
                            </div>
                          )}
                          <div className="p-4 flex flex-col flex-1">
                            <h5 className="font-bold text-slate-900 mb-1 line-clamp-1">{plan.title}</h5>
                            <span className="inline-block self-start text-xs font-semibold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md mb-2">
                              {plan.category_name}
                            </span>
                            <p className="text-sm text-slate-500 line-clamp-2 mt-auto">{plan.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analyse result — BOQ */}
                {result.type === 'analyse' && (() => {
                  const a = result.data;
                  const sections = [
                    { key: 'building_items', label: 'Building Items', count: a.building_items?.length || 0, icon: 'foundation', color: 'emerald' },
                    { key: 'professional_fees', label: 'Professional Fees', count: a.professional_fees?.length || 0, icon: 'gavel', color: 'blue' },
                    { key: 'admin_expenses', label: 'Admin Expenses', count: a.admin_expenses?.length || 0, icon: 'receipt', color: 'amber' },
                    { key: 'labour_costs', label: 'Labour Costs', count: a.labour_costs?.length || 0, icon: 'engineering', color: 'orange' },
                    { key: 'machine_plants', label: 'Machine & Plant', count: a.machine_plants?.length || 0, icon: 'precision_manufacturing', color: 'sky' },
                    { key: 'labour_breakdowns', label: 'Labour Breakdown', count: a.labour_breakdowns?.length || 0, icon: 'groups', color: 'violet' },
                    { key: 'schedule_tasks', label: 'Schedule Tasks', count: a.schedule_tasks?.length || 0, icon: 'calendar_month', color: 'indigo' },
                    { key: 'schedule_materials', label: 'Materials', count: a.schedule_materials?.length || 0, icon: 'inventory_2', color: 'teal' },
                  ];
                  const totalItems = sections.reduce((s, sec) => s + sec.count, 0);
                  const buildTotal = (a.building_items || []).reduce((s: number, i: any) => s + (Number(i.quantity || 0) * Number(i.rate || 0)), 0);

                  return (
                    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Icon name="assignment" size={20} className="text-emerald-600" />
                          <h4 className="font-bold text-slate-900 text-lg tracking-tight">8 Budget Sheets Generated</h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          {totalItems} items extracted
                        </span>
                      </div>

                      {/* Summary */}
                      {result.summary && (
                        <div className="px-6 py-5 border-b border-slate-100">
                          <div className="prose prose-slate max-w-none text-sm [&_strong]:text-slate-900">
                            <ReactMarkdown>{result.summary}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {/* Section Summary Row */}
                      <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/30">
                        {sections.map(sec => (
                          <div key={sec.key} className={cn(
                            'flex flex-col items-start gap-2 p-4 rounded-xl border transition-all',
                            sec.count > 0 ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/50 border-slate-100 opacity-60',
                          )}>
                            <div className="flex items-center justify-between w-full">
                              <Icon name={sec.icon} size={20} className={sec.count > 0 ? 'text-slate-700' : 'text-slate-400'} />
                              <span className="text-lg font-bold text-slate-900">{sec.count}</span>
                            </div>
                            <span className="font-medium text-sm text-slate-600 line-clamp-1">{sec.label}</span>
                          </div>
                        ))}
                      </div>

                      {/* Building items preview */}
                      {a.building_items && a.building_items.length > 0 && (
                        <div className="px-6 py-6 border-t border-slate-100">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-bold text-slate-800 text-base">Building Items Review</h5>
                            <span className="text-sm font-bold text-emerald-700">Subtotal: ${buildTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold">
                                <tr>
                                  <th className="px-4 py-3 border-b border-slate-200">Description</th>
                                  <th className="px-4 py-3 border-b border-slate-200 text-right">Qty</th>
                                  <th className="px-4 py-3 border-b border-slate-200 text-right">Rate</th>
                                  <th className="px-4 py-3 border-b border-slate-200 text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {a.building_items.slice(0, 5).map((item: any, i: number) => {
                                  const amt = Number(item.quantity || 0) * Number(item.rate || 0);
                                  return (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                      <td className="px-4 py-3 font-medium text-slate-800">{item.description}</td>
                                      <td className="px-4 py-3 text-right text-slate-600">{Number(item.quantity).toLocaleString()}</td>
                                      <td className="px-4 py-3 text-right text-slate-600">${Number(item.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                      <td className="px-4 py-3 text-right font-bold text-slate-900">${amt.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                  )
                                })}
                                {a.building_items.length > 5 && (
                                  <tr className="bg-slate-50/50">
                                    <td colSpan={4} className="px-4 py-3 text-center text-sm text-slate-500 italic">
                                      + {a.building_items.length - 5} additional items not shown
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Save CTA */}
                      <div className="p-6 border-t border-slate-200 bg-emerald-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-sm text-slate-600 max-w-md">
                          Review looks good? Save all these 8 sheets directly to your <strong>{currentProject.title}</strong> project budget.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingBOQ({
                              data: a,
                              summary: result.summary,
                              title: 'Current Analysis',
                            })}
                            className="flex items-center gap-2 px-4 py-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-sm font-bold uppercase tracking-wider rounded-xl transition-all"
                          >
                            <Icon name="visibility" size={18} />
                            View Full BOQ
                          </button>
                          <button
                            onClick={() => handleSaveToBOQ(a)}
                            disabled={isSavingBOQ}
                            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md"
                          >
                            {isSavingBOQ ? (
                              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Icon name="save" size={18} />
                            )}
                            {isSavingBOQ ? 'Saving to Project...' : 'Save BOQ to Project'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ))}
            <div ref={scrollRef} className="h-4" />
          </div>
        </div>
      </Main>

      {/* Full BOQ Viewer Dialog */}
      <Dialog open={!!viewingBOQ} onOpenChange={(v) => !v && setViewingBOQ(null)}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogTitle className="sr-only">Full BOQ View</DialogTitle>
          <DialogDescription className="sr-only">Complete 8-sheet budget analysis view.</DialogDescription>
          {viewingBOQ && (() => {
            const a = viewingBOQ.data;
            const BOQ_TABS = [
              { key: 'building_items', label: 'Building Items', items: a.building_items || [], icon: 'foundation' },
              { key: 'professional_fees', label: 'Professional Fees', items: a.professional_fees || [], icon: 'gavel' },
              { key: 'admin_expenses', label: 'Admin Expenses', items: a.admin_expenses || [], icon: 'receipt' },
              { key: 'labour_costs', label: 'Labour Costs', items: a.labour_costs || [], icon: 'engineering' },
              { key: 'machine_plants', label: 'Machine & Plant', items: a.machine_plants || [], icon: 'precision_manufacturing' },
              { key: 'labour_breakdowns', label: 'Labour Breakdown', items: a.labour_breakdowns || [], icon: 'groups' },
              { key: 'schedule_tasks', label: 'Schedule Tasks', items: a.schedule_tasks || [], icon: 'calendar_month' },
              { key: 'schedule_materials', label: 'Materials', items: a.schedule_materials || [], icon: 'inventory_2' },
            ];
            const activeTabData = BOQ_TABS.find(t => t.key === boqTab) || BOQ_TABS[0];
            const totalAllItems = BOQ_TABS.reduce((s, t) => s + t.items.length, 0);

            // Helper to render fields of each item dynamically
            const renderItemCards = (items: any[], tabKey: string) => {
              if (items.length === 0) return (
                <div className="p-12 text-center text-slate-400">
                  <Icon name="inbox" size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No items in this sheet</p>
                </div>
              );

              // Field configs per tab
              const fieldMap: Record<string, { primary: string; secondary?: string; amount?: string; badges?: string[] }> = {
                building_items: { primary: 'description', secondary: 'specification', amount: 'amount', badges: ['bill_no', 'unit'] },
                professional_fees: { primary: 'discipline', secondary: 'role_scope', amount: 'estimated_fee', badges: ['basis', 'rate'] },
                admin_expenses: { primary: 'item_role', secondary: 'description', amount: 'total_cost', badges: ['trips_per_week', 'distance'] },
                labour_costs: { primary: 'trade_role', secondary: 'phase', amount: 'total_cost', badges: ['skill_level', 'gang_size', 'duration_weeks'] },
                machine_plants: { primary: 'machine_item', secondary: 'category', amount: 'total_cost', badges: ['qty', 'days_rqd'] },
                labour_breakdowns: { primary: 'trade_role', secondary: 'phase', amount: 'total_cost', badges: ['gang_size', 'duration_weeks'] },
                schedule_tasks: { primary: 'task_description', secondary: 'wbs', amount: 'est_cost', badges: ['start_date', 'end_date', 'days'] },
                schedule_materials: { primary: 'material_description', secondary: 'specification', badges: ['section', 'estimated_qty'] },
              };
              const fields = fieldMap[tabKey] || { primary: 'description' };

              return (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 p-4">
                  {items.map((item: any, idx: number) => {
                    const amtVal = fields.amount ? Number(item[fields.amount] || 0) : null;
                    return (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-slate-300 transition-all" style={{ animation: `tileIn 0.3s ease-out ${idx * 30}ms both` }}>
                        <p className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1">
                          {item[fields.primary] || '—'}
                        </p>
                        {fields.secondary && item[fields.secondary] && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{item[fields.secondary]}</p>
                        )}
                        {fields.badges && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {fields.badges.map(bk => {
                              const val = item[bk];
                              if (!val && val !== 0) return null;
                              return (
                                <span key={bk} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  {bk.replace(/_/g, ' ')}: {val}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {amtVal !== null && (
                          <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">${amtVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            };

            return (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Icon name="assignment" size={20} className="text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{viewingBOQ.title}</h3>
                      <p className="text-xs text-slate-500">{totalAllItems} items across 8 sheets</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingBOQ(null)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors text-slate-500">
                    <Icon name="close" size={20} />
                  </button>
                </div>

                {/* Summary */}
                {viewingBOQ.summary && (
                  <div className="px-6 py-4 border-b border-slate-100 bg-white max-h-[20vh] overflow-y-auto shrink-0">
                    <div className="prose prose-sm max-w-none text-slate-600 [&_strong]:text-slate-900">
                      <ReactMarkdown>{viewingBOQ.summary}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-0.5 border-b border-slate-200 overflow-x-auto px-4 pt-2 bg-white shrink-0 scrollbar-hide">
                  {BOQ_TABS.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setBOQTab(tab.key)}
                      className={cn(
                        'px-3 py-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 flex items-center gap-1',
                        boqTab === tab.key
                          ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                          : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300',
                      )}
                    >
                      <Icon name={tab.icon} size={14} />
                      {tab.label}
                      <span className={cn(
                        'ml-1 text-[9px] py-0.5 px-1.5 rounded-full',
                        boqTab === tab.key ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                      )}>
                        {tab.items.length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Content */}
                <style>{`@keyframes tileIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
                <div className="flex-1 overflow-y-auto bg-slate-50/30">
                  {renderItemCards(activeTabData.items, activeTabData.key)}

                  {/* Total row for tabs that have amounts */}
                  {activeTabData.items.length > 0 && (() => {
                    const amountKey: Record<string, string> = {
                      building_items: 'amount', professional_fees: 'estimated_fee',
                      admin_expenses: 'total_cost', labour_costs: 'total_cost',
                      machine_plants: 'total_cost', labour_breakdowns: 'total_cost',
                      schedule_tasks: 'est_cost',
                    };
                    const key = amountKey[activeTabData.key];
                    if (!key) return null;
                    const total = activeTabData.items.reduce((s: number, i: any) => {
                      const qty = Number(i.quantity || 0);
                      const rate = Number(i.rate || 0);
                      const direct = Number(i[key] || 0);
                      return s + (activeTabData.key === 'building_items' ? qty * rate : direct);
                    }, 0);
                    return (
                      <div className="mx-4 mb-4 flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 shadow-sm">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Total {activeTabData.label}</span>
                        <span className="text-lg font-bold text-white">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    );
                  })()}

                  {/* Compliance & Recommendations */}
                  {(boqTab === 'building_items') && (
                    <div className="px-4 pb-4 space-y-3">
                      {a.compliance_notes && a.compliance_notes.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="verified" size={16} className="text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">SI-56 Compliance Notes</span>
                          </div>
                          <ul className="space-y-1">
                            {a.compliance_notes.map((note: string, i: number) => (
                              <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                {note}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {a.recommendations && a.recommendations.length > 0 && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="lightbulb" size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Recommendations</span>
                          </div>
                          <ul className="space-y-1">
                            {a.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="text-xs text-blue-800 flex items-start gap-2">
                                <span className="text-blue-400 mt-0.5">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer — Save to project */}
                {currentProject && (
                  <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
                    <p className="text-xs text-slate-500">Save this analysis to <strong>{currentProject.title}</strong> project budget</p>
                    <button
                      onClick={() => { handleSaveToBOQ(a); setViewingBOQ(null); }}
                      disabled={isSavingBOQ}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                    >
                      <Icon name="save" size={16} />
                      {isSavingBOQ ? 'Saving…' : 'Save BOQ to Project'}
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(v) => !v && setPreviewImage(null)}>
        <DialogContent className="max-w-6xl w-full p-2 bg-transparent border-0 shadow-none overflow-hidden [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-3 [&>button]:hover:bg-black/80 z-[100] top-1/2 -translate-y-1/2">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <DialogDescription className="sr-only">Enlarged view of the drawing.</DialogDescription>
          <div className="relative w-full h-[85vh] flex items-center justify-center bg-black/40 rounded-2xl backdrop-blur-md">
            {previewImage && (
              <img src={previewImage} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl drop-shadow-2xl" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
