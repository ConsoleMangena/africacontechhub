import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { Icon } from "@/components/ui/material-icon";
import { useState, useEffect, useCallback } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { ProjectWorkspacePicker } from "@/features/dashboards/builder/components/project-workspace-picker";
import { builderApi } from "@/services/api";
import type { Project } from "@/types/api";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/builder/contract-analyser")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    projectId: (search.projectId as string) || undefined,
  }),
});

function RouteComponent() {
  const { projectId: searchProjectId } = Route.useSearch();
  const navigate = useNavigate();
  const builderStore = useBuilderStore();
  const resolvedProjectId = searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(resolvedProjectId);
  const [analyzing, setAnalyzing] = useState(false);
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);

  const selectProject = (id: number) => {
    setSelectedProject(id);
    builderStore.selectProject(id);
    navigate({
      to: "/builder/contract-analyser",
      search: { projectId: String(id) },
      replace: true,
    });
  };

  const exitProject = useCallback(() => {
    setSelectedProject(null);
    builderStore.exitProject();
    navigate({
      to: "/builder/contract-analyser",
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

  const handleUploadClick = () => {
    setFileSelected(true);
    setAnalysisComplete(false);
    toast.success("Subcontractor_Agreement_v2.pdf uploaded successfully");
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisComplete(true);
      toast.success("AI Analysis Complete. 3 Critical Risks Found.");
    }, 3000);
  };

  const riskFactors = [
    {
      id: 1,
      clause: "Section 4.2: Payment Terms",
      severity: "high",
      issue: "Payment window is defined as Net 90 days after milestone completion.",
      recommendation: "Negotiate to Net 30 or Net 45. A 90-day cash flow gap dramatically risks project liquidity.",
    },
    {
      id: 2,
      clause: "Section 7.1: Liquidated Damages",
      severity: "high",
      issue: "Delay penalty set at $5,000 per day with no maximum cap.",
      recommendation: "Demand a cap of 10% of total contract value. Uncapped damages pose an existential fiscal threat.",
    },
    {
      id: 3,
      clause: "Section 12.3: Indemnification",
      severity: "medium",
      issue: "Broad form indemnity requiring builder to cover client's own negligence.",
      recommendation: "Push for comparative fault indemnity; only accept responsibility for damages caused by the builder's own actions.",
    },
    {
      id: 4,
      clause: "Section 9.5: Weather Delays",
      severity: "low",
      issue: "Forces majeure covers 'unforeseeable' weather, but does not specify a rainfall threshold.",
      recommendation: "Clearly define weather thresholds (e.g., >20mm rainfall per day) to avoid disputes during seasonal storms.",
    }
  ];

  if (loadingProjects) {
    return (
      <>
        <Header>
          <div className="ms-auto flex items-center space-x-4"><Search /><ProfileDropdown /></div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Select a project tile to activate the AI Contract Analyser."
              projects={[]} loading onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })} primaryActionLabel="Open Portfolio"
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
          <div className="ms-auto flex items-center space-x-4"><Search /><ProfileDropdown /></div>
        </Header>
        <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ProjectWorkspacePicker
              title="Choose a project workspace"
              description="Pick a project to securely scan and interpret legal contracts, finding financial trapdoors and compliance risks instantly."
              projects={projects} onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })} primaryActionLabel="Open Portfolio"
              emptyTitle="No projects available"
            />
          </div>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
          
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Icon name="gavel" className="text-slate-800" size={28} />
                AI Contract Analyser
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Identify fiscal traps, unhedgeable risks, and toxic clauses before you sign on <strong>{currentProject.title}</strong>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Upload / Status */}
            <div className="space-y-6">
              <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 mb-4">Input Legal Document</h3>
                  
                  {!fileSelected ? (
                    <div 
                      onClick={handleUploadClick}
                      className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group"
                    >
                      <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                        <Icon name="upload_file" className="text-blue-600" size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">Click to Upload PDF</p>
                      <p className="text-xs text-slate-500">Agreements, BOQs, or Conditions</p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-red-100 border border-red-200 flex flex-col items-center justify-center shrink-0">
                        <Icon name="picture_as_pdf" className="text-red-600" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">Subcontractor_Agreement_v2.pdf</p>
                        <p className="text-xs text-slate-500">4.2 MB • Scanned clean</p>
                      </div>
                      {!analysisComplete && !analyzing && (
                        <button onClick={() => setFileSelected(false)} className="text-slate-400 hover:text-red-500">
                          <Icon name="close" size={16} />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={handleAnalyze}
                      disabled={!fileSelected || analyzing || analysisComplete}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {analyzing ? (
                        <>
                          <Icon name="memory" className="animate-pulse text-blue-400" size={18} />
                          Scanning Clauses...
                        </>
                      ) : analysisComplete ? (
                        <>
                          <Icon name="check_circle" className="text-emerald-400" size={18} />
                          Analysis Complete
                        </>
                      ) : (
                        <>
                          <Icon name="plagiarism" size={18} />
                          Run AI Risk Audit
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>

              {analysisComplete && (
                <Card className="bg-white border-slate-200 shadow-sm text-center">
                  <CardContent className="p-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Overall Contract Posture</p>
                    <p className="text-2xl font-bold font-display text-red-600 mb-1">High Risk</p>
                    <p className="text-xs text-slate-600">Considerable liability exposure detected. Renegotiation heavily advised before execution.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Col: Analysis View */}
            <div className="lg:col-span-2">
              {!analysisComplete && !analyzing ? (
                <Card className="bg-white border-slate-200 shadow-sm h-full hidden lg:flex flex-col items-center justify-center p-12 text-center opacity-60">
                   <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Icon name="find_in_page" size={32} className="text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 mb-2">No Document Context</h3>
                   <p className="text-sm text-slate-500 max-w-sm">Upload a construction contract or legal agreement to automatically extract and evaluate risks.</p>
                </Card>
              ) : analyzing ? (
                <Card className="bg-white border-slate-200 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center">
                   <Icon name="memory" size={48} className="text-blue-500 animate-spin-slow mb-4" />
                   <h3 className="text-lg font-bold text-slate-900 mb-2 animate-pulse">Running Neural Lexical Analysis...</h3>
                   <p className="text-sm text-slate-500 max-w-sm">Cross-referencing clauses against standard FIDIC and NEC architectures.</p>
                </Card>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">Extracted Risk Factors</h3>
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      {riskFactors.filter(r => r.severity === 'high').length} Critical Issues
                    </span>
                  </div>

                  {riskFactors.map((risk) => (
                    <Card key={risk.id} className="bg-white border-slate-200 shadow-sm">
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-start gap-4">
                           <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${
                             risk.severity === 'high' ? 'bg-red-50 border-red-200 text-red-600' :
                             risk.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                             'bg-blue-50 border-blue-200 text-blue-600'
                           }`}>
                             <Icon name={risk.severity === 'high' ? 'warning' : risk.severity === 'medium' ? 'gavel' : 'info'} size={16} />
                           </div>
                           
                           <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <h4 className="text-sm font-bold text-slate-900">{risk.clause}</h4>
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border self-start sm:self-auto ${
                                  risk.severity === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                                  risk.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                  'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                  {risk.severity} Risk
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 font-medium mb-3 border-l-2 border-slate-300 pl-3 italic">
                                "{risk.issue}"
                              </p>
                              
                              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
                                <h5 className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
                                  <Icon name="psychology" size={14} className="text-slate-400" />
                                  AI Counter-Strategy
                                </h5>
                                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                                  {risk.recommendation}
                                </p>
                              </div>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </Main>
    </>
  );
}
