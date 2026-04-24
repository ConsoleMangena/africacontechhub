import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { Icon } from "@/components/ui/material-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useRef, useEffect, useCallback } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { ProjectModeBadge } from "@/components/project-mode-badge";
import { ProjectWorkspacePicker } from "@/features/dashboards/builder/components/project-workspace-picker";
import { builderApi } from "@/services/api";
import type { Project, DrawingRequest } from "@/types/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/builder/design-drafting")(
  {
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
      projectId: (search.projectId as string) || undefined,
    }),
  },
);

const ARTISAN_ROLES: { value: string; label: string; icon: string }[] = [
  { value: "architect", label: "Architect", icon: "architecture" },
  {
    value: "structural_engineer",
    label: "Structural Engineer",
    icon: "foundation",
  },
  { value: "contractor", label: "General Contractor", icon: "engineering" },
  {
    value: "project_manager",
    label: "Project Manager",
    icon: "manage_accounts",
  },
  { value: "quantity_surveyor", label: "Quantity Surveyor", icon: "calculate" },
  { value: "electrician", label: "Electrician", icon: "electrical_services" },
  { value: "plumber", label: "Plumber", icon: "water_damage" },
  { value: "mason", label: "Mason/Bricklayer", icon: "wall" },
  { value: "carpenter", label: "Carpenter", icon: "carpenter" },
  { value: "painter", label: "Painter", icon: "format_paint" },
  { value: "roofer", label: "Roofer", icon: "roofing" },
  { value: "tiler", label: "Tiler", icon: "grid_on" },
];

const DRAWING_TYPES: { value: string; label: string; icon: string }[] = [
  { value: "floor_plan", label: "Floor Plan", icon: "domain" },
  { value: "elevation", label: "Elevation", icon: "view_sidebar" },
  { value: "section", label: "Section View", icon: "view_column" },
  { value: "3d_render", label: "3D Render", icon: "view_in_ar" },
  { value: "blueprint", label: "Blueprint", icon: "blueprint" },
];

const STATUS_CLS: Record<string, string> = {
  PENDING: "bg-slate-50 text-slate-500 border border-slate-100",
  IN_PROGRESS: "bg-slate-50 text-slate-700 border border-slate-200 font-bold",
  COMPLETED: "bg-slate-900 text-white border-slate-900 shadow-none",
  REJECTED: "bg-red-50 text-red-600 border border-red-100",
};

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function RouteComponent() {
  const { projectId: searchProjectId } = Route.useSearch();
  const navigate = useNavigate();
  const builderStore = useBuilderStore();
  const resolvedProjectId = searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(
    resolvedProjectId,
  );

  const selectProject = (id: number) => {
    setSelectedProject(id);
    builderStore.selectProject(id);
    navigate({
      to: "/builder/design-drafting",
      search: { projectId: String(id) },
      replace: true,
    });
  };

  const exitProject = useCallback(() => {
    setSelectedProject(null);
    setRequests([]);
    setShowRequestForm(false);
    setShowDirectUpload(false);
    setShowExploreModal(false);
    setShowContactModal(false);
    setSelectedProfessional(null);
    setDirectFiles([]);
    builderStore.exitProject();
    navigate({
      to: "/builder/design-drafting",
      search: { projectId: undefined },
      replace: true,
    });
  }, [navigate, builderStore]);

  const [requests, setRequests] = useState<DrawingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [uploadingForRequest, setUploadingForRequest] = useState<number | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directUploadRef = useRef<HTMLInputElement>(null);
  const [showDirectUpload, setShowDirectUpload] = useState(false);
  const [directUploadForm, setDirectUploadForm] = useState({
    drawingType: "floor_plan" as DrawingRequest["drawing_type"],
    title: "",
  });
  const [directFiles, setDirectFiles] = useState<File[]>([]);
  const [uploadingDirect, setUploadingDirect] = useState(false);

  // Caches
  const requestsCacheRef = useRef<Map<number, DrawingRequest[]>>(new Map());
  const projectsCachedRef = useRef(false);

  // Explore Professionals State
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<any | null>(
    null,
  );
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loadingPros, setLoadingPros] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<"all" | string>("architect");

  // Form state
  const [form, setForm] = useState({
    drawingType: "floor_plan" as DrawingRequest["drawing_type"],
    title: "",
  });

  // DIFY mode check
  const currentProject = projects.find((p) => p.id === selectedProject);
  const isDIFY = currentProject?.engagement_tier === "DIFY";

  const filteredRequests = requests;

  useEffect(() => {
    setSelectedProject(searchProjectId ? Number(searchProjectId) : builderStore.selectedProjectId ?? null);
  }, [searchProjectId, builderStore.selectedProjectId]);

  const fetchProjects = useCallback(() => {
    setLoadingProjects(true);
    builderApi
      .getProjects()
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data as any).results || [];
        setProjects(data);
        projectsCachedRef.current = true;
      })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoadingProjects(false));
  }, []);

  useEffect(() => {
    if (projectsCachedRef.current && projects.length > 0) {
      setLoadingProjects(false);
      return;
    }
    fetchProjects();
  }, [fetchProjects, projects.length]);

  useEffect(() => {
    if (loadingProjects || !selectedProject) return;
    if (projects.some((project) => project.id === selectedProject)) return;
    exitProject();
  }, [exitProject, loadingProjects, projects, selectedProject]);

  const fetchProfessionals = async () => {
    setLoadingPros(true);
    try {
      const res = await builderApi.getProfessionals({
        role: selectedRole === "all" ? undefined : selectedRole,
        search: searchTerm || undefined,
      });
      setProfessionals(res.data.results || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load professionals");
    } finally {
      setLoadingPros(false);
    }
  };

  useEffect(() => {
    if (showExploreModal) {
      fetchProfessionals();
    }
  }, [showExploreModal, searchTerm, selectedRole]);

  const handleAddToTeam = async (pro: any) => {
    if (!selectedProject) {
      toast.error("Please select a project first");
      return;
    }

    try {
      await builderApi.addToTeam({
        project: selectedProject,
        user: pro.user,
        role: pro.role,
        status: "assigned",
        notes: `Added from Design Drafting page`,
      });
      toast.success(`${pro.user_details?.full_name} assigned to project`);
      fetchProjects(); // Refresh projects to get new architect_details
      setShowExploreModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add professional to team");
    }
  };

  const handleContact = (professional: any) => {
    setSelectedProfessional(professional);
    setShowContactModal(true);
  };

  const getRoleLabel = (role: string) => {
    return ARTISAN_ROLES.find((r) => r.value === role)?.label || role;
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "busy":
        return "bg-slate-50 text-slate-500 border-slate-100 italic";
      case "unavailable":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const fetchRequests = useCallback(async () => {
    if (!selectedProject) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await builderApi.getProjectDrawingRequests(selectedProject);
      const data = Array.isArray(res.data)
        ? res.data
        : (res.data as any).results || [];
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmitRequest = async () => {
    if (!selectedProject || !form.title) {
      toast.error("Please select a project and enter a title");
      return;
    }

    setSaving(true);
    try {
      await builderApi.createDrawingRequest({
        project: selectedProject,
        drawing_type: form.drawingType,
        title: form.title,
      });
      setForm({ drawingType: "floor_plan", title: "" });
      setShowRequestForm(false);
      toast.success("Drawing request submitted to architect");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit request");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    requestId: number,
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) return;

    const maxSize = 50 * 1024 * 1024;
    setLoading(true);

    try {
      for (const file of Array.from(files)) {
        if (file.size > maxSize) {
          toast.error(`${file.name}: File too large (max 50MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append("request", requestId.toString());
        formData.append("file", file);
        formData.append("original_name", file.name);
        formData.append(
          "file_type",
          file.name.split(".").pop()?.toLowerCase() || "file",
        );
        formData.append(
          "file_size",
          (file.size / (1024 * 1024)).toFixed(1) + " MB",
        );

        await builderApi.uploadDrawingFile(formData);
        toast.success(`${file.name} uploaded successfully`);
      }
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload files");
    } finally {
      setLoading(false);
      setUploadingForRequest(null);
    }
  };

  const handleDeleteFile = async (requestId: number, fileId: number) => {
    try {
      await builderApi.deleteDrawingFile(fileId);
      toast.success("File removed");
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove file");
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    // Optimistic delete
    const previousRequests = requests;
    const updated = requests.filter((r) => r.id !== requestId);
    setRequests(updated);
    try {
      await builderApi.deleteDrawingRequest(requestId);
      toast.success("Request deleted");
    } catch (err) {
      console.error(err);
      setRequests(previousRequests);
      toast.error("Failed to delete request");
    }
  };

  const handleDirectUpload = async () => {
    if (!selectedProject || directFiles.length === 0) {
      toast.error("Please select a project and choose files");
      return;
    }

    setUploadingDirect(true);
    try {
      const generatedTitle =
        directFiles.length === 1
          ? directFiles[0].name.replace(/\.[^/.]+$/, "")
          : `${directFiles.length} uploaded drawing files`;
      const title = directUploadForm.title.trim() || generatedTitle;

      // Create a drawing request container explicitly marked as COMPLETED for the library
      const res = await builderApi.createDrawingRequest({
        project: selectedProject,
        drawing_type: directUploadForm.drawingType,
        title,
        status: "COMPLETED",
      });
      const requestId = res.data.id;

      // Upload all selected files
      const maxSize = 50 * 1024 * 1024;
      for (const file of directFiles) {
        if (file.size > maxSize) {
          toast.error(`${file.name}: File too large (max 50MB)`);
          continue;
        }
        const formData = new FormData();
        formData.append("request", requestId.toString());
        formData.append("file", file);
        formData.append("original_name", file.name);
        formData.append(
          "file_type",
          file.name.split(".").pop()?.toLowerCase() || "file",
        );
        formData.append(
          "file_size",
          (file.size / (1024 * 1024)).toFixed(1) + " MB",
        );
        await builderApi.uploadDrawingFile(formData);
      }

      toast.success(`${directFiles.length} file(s) uploaded successfully`);
      setDirectUploadForm({ drawingType: "floor_plan", title: "" });
      setDirectFiles([]);
      setShowDirectUpload(false);
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload drawings");
    } finally {
      setUploadingDirect(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "picture_as_pdf";
      case "png":
      case "jpg":
      case "jpeg":
        return "image";
      case "dwg":
      case "dxf":
        return "architecture";
      case "zip":
      case "rar":
      case "7z":
        return "archive";
      case "doc":
      case "docx":
        return "description";
      case "xls":
      case "xlsx":
        return "table_view";
      default:
        return "insert_drive_file";
    }
  };

  const curProj = projects.find((p) => p.id === selectedProject);
  const archDetails = curProj?.architect_details;

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
              title="Choose a design workspace"
              description="Select a project tile before opening requests, architect assignments, or studio shortcuts. Only the selected project's design data will load into this workspace."
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
              title="Choose a design workspace"
              description="Pick a project tile to open its drawing requests, architect context, and studio handoff. Until then, this page stays clean and avoids loading project-specific design records."
              projects={projects}
              onSelectProject={selectProject}
              onPrimaryAction={() => navigate({ to: "/builder" })}
              primaryActionLabel="Open Portfolio"
              emptyTitle="No design-ready projects yet"
              emptyDescription="Create a project from the builder portfolio first, then return here to manage its drawings and studio workflow."
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
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-5">
          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Design Drafting
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {currentProject.title}{currentProject.location ? ` • ${currentProject.location}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ProjectModeBadge
                engagementTier={currentProject.engagement_tier}
                size="sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={exitProject}
                className="h-9 text-[10px] font-bold uppercase tracking-wider border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Icon name="logout" size={14} className="mr-1.5" />
                Exit Project
              </Button>
              {isDIFY ? (
                <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <Icon name="info" size={14} className="text-slate-400" />
                  <span>SQB manages design for DIFY projects</span>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => setShowDirectUpload(true)}
                    size="sm"
                    variant="outline"
                    className="h-9 text-[10px] font-bold uppercase tracking-wider border-slate-200 text-slate-900 hover:bg-slate-50"
                  >
                    <Icon name="cloud_upload" size={16} className="mr-1.5" />
                    Upload
                  </Button>
                  <Button
                    onClick={() => setShowRequestForm(true)}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 h-9 text-[10px] font-bold uppercase tracking-wider text-white shadow-none"
                  >
                    <Icon name="add" size={16} className="mr-1.5" />
                    Request Drawing
                  </Button>
                  <Link
                    to="/builder/architectural-studio"
                    search={selectedProject ? { projectId: String(selectedProject) } : {}}
                  >
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 h-9 text-[10px] font-bold uppercase tracking-wider text-white shadow-none gap-1.5"
                    >
                      <Icon name="draw" size={16} />
                      Open Studio
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {(
              [
                {
                  icon: "description",
                  label: "Total",
                  value: filteredRequests.length,
                  bg: "bg-slate-50",
                  text: "text-slate-600",
                },
                {
                  icon: "schedule",
                  label: "Pending",
                  value: filteredRequests.filter((r) => r.status === "PENDING").length,
                  bg: "bg-slate-50",
                  text: "text-slate-500",
                },
                {
                  icon: "sync",
                  label: "In Progress",
                  value: filteredRequests.filter((r) => r.status === "IN_PROGRESS")
                    .length,
                  bg: "bg-slate-50",
                  text: "text-slate-700",
                },
                {
                  icon: "check_circle",
                  label: "Library Items",
                  value: filteredRequests.filter((r) => r.status === "COMPLETED")
                    .length,
                  bg: "bg-slate-900",
                  text: "text-white",
                },
              ] as const
            ).map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}
                >
                  <Icon name={s.icon} size={20} className={s.text} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide leading-none">
                    {s.label}
                  </p>
                  <p className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Architect bar ── */}
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5">
            {archDetails ? (
              <>
                <div className="h-9 w-9 rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow-sm bg-slate-100 flex items-center justify-center">
                  {archDetails.avatar ? (
                    <img
                      src={archDetails.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon
                      name="architecture"
                      size={18}
                      className="text-slate-400"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {archDetails.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Architect · {archDetails.email}
                  </p>
                </div>
                <Badge className="bg-slate-900 text-white text-[9px] border-none shadow-none font-bold uppercase tracking-wider">
                  Assigned
                </Badge>
              </>
            ) : (
              <>
                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon
                    name="person_off"
                    size={18}
                    className="text-slate-400"
                  />
                </div>
                <p className="text-sm text-slate-500 flex-1">
                  No architect assigned
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setShowExploreModal(true)}
                >
                  <Icon name="person_search" size={14} className="mr-1" />
                  Assign
                </Button>
              </>
            )}
          </div>

          {/* ── Request Form ── */}
          {showRequestForm && (
            <div className="rounded-xl border-2 border-slate-900 bg-white overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Icon
                    name="request_page"
                    size={18}
                    className="text-slate-600"
                  />
                  Request New Drawing
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowRequestForm(false)}
                >
                  <Icon name="close" size={16} />
                </Button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Drawing Type
                    </label>
                    <Select
                      value={form.drawingType}
                      onValueChange={(v) =>
                        setForm((prev) => ({
                          ...prev,
                          drawingType: v as DrawingRequest["drawing_type"],
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DRAWING_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Title
                    </label>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g. Ground Floor Plan"
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-white shadow-none rounded-lg"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Icon name="send" size={14} className="mr-1.5" />
                    )}
                    {saving ? "Submitting…" : "Submit"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Direct Upload ── */}
          {showDirectUpload && (
            <div className="rounded-xl border-2 border-slate-900 bg-white overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Icon
                    name="cloud_upload"
                    size={18}
                    className="text-slate-600"
                  />
                  Upload Your Drawings
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setShowDirectUpload(false);
                    setDirectFiles([]);
                  }}
                >
                  <Icon name="close" size={16} />
                </Button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Drawing Type
                    </label>
                    <Select
                      value={directUploadForm.drawingType}
                      onValueChange={(v) =>
                        setDirectUploadForm((prev) => ({
                          ...prev,
                          drawingType: v as DrawingRequest["drawing_type"],
                        }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DRAWING_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Title (optional)
                    </label>
                    <Input
                      value={directUploadForm.title}
                      onChange={(e) =>
                        setDirectUploadForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Auto-generated if blank"
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                    directFiles.length > 0
                      ? "border-slate-400 bg-slate-50"
                      : "border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                  )}
                  onClick={() => directUploadRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDirectFiles((prev) => [
                      ...prev,
                      ...Array.from(e.dataTransfer.files),
                    ]);
                  }}
                >
                  <Icon
                    name="cloud_upload"
                    size={32}
                    className="text-slate-300 mx-auto mb-2"
                  />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Click or drag files to upload
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    PDF, PNG, JPG, DWG (max 50MB)
                  </p>
                </div>
                <input
                  type="file"
                  ref={directUploadRef}
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setDirectFiles((prev) => [
                        ...prev,
                        ...Array.from(e.target.files!),
                      ]);
                      e.target.value = "";
                    }
                  }}
                />
                {directFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {directFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            name={getFileIcon(file.name.split(".").pop() || "")}
                            size={14}
                            className="text-slate-400 shrink-0"
                          />
                          <span className="truncate text-slate-700 font-medium">
                            {file.name}
                          </span>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                          onClick={() =>
                            setDirectFiles((prev) =>
                              prev.filter((_, idx) => idx !== i),
                            )
                          }
                        >
                          <Icon name="close" size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                    onClick={() => {
                      setShowDirectUpload(false);
                      setDirectFiles([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDirectUpload}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-white shadow-none rounded-lg"
                    disabled={
                      uploadingDirect ||
                      !selectedProject ||
                      directFiles.length === 0
                    }
                  >
                    {uploadingDirect ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Icon name="cloud_upload" size={14} className="mr-1.5" />
                    )}
                    {uploadingDirect
                      ? "Uploading…"
                      : `Upload ${directFiles.length} File(s)`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) =>
              uploadingForRequest &&
              handleFileUpload(uploadingForRequest, e.target.files)
            }
          />

          {/* ── Active Studio Requests ── */}
          <div className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="design_services" size={18} className="text-indigo-600" />
                  Active Studio Requests
                  <Badge className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0 shadow-none border-none ml-1">
                    {filteredRequests.filter((r) => r.status !== "COMPLETED").length}
                  </Badge>
                </h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Pending and in-progress drafts mapped to your architect</p>
              </div>
              <Button
                onClick={() => setShowRequestForm(true)}
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 h-8 text-[10px] font-bold uppercase tracking-wider text-white shadow-none rounded-lg"
              >
                <Icon name="add" size={14} className="mr-1.5" />
                New Request
              </Button>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="px-4 py-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-40 bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-slate-50 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredRequests.filter((r) => r.status !== "COMPLETED").length === 0 ? (
              <div className="px-4 py-10 text-center bg-slate-50/30">
                <Icon
                  name="architecture"
                  size={32}
                  className="mx-auto mb-3 text-slate-300"
                />
                <p className="text-sm font-bold text-slate-500">
                  No active requests
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When you request a fresh draft from an architect, its progress will be tracked here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filteredRequests
                  .filter((r) => r.status !== "COMPLETED")
                  .map((request) => {
                    const dtCfg = DRAWING_TYPES.find(
                      (d) => d.value === request.drawing_type,
                    );
                    return (
                      <div key={request.id}>
                        <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
                            <Icon
                              name={dtCfg?.icon || "description"}
                              size={20}
                              className="text-slate-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                                {request.title}
                              </p>
                              <Badge
                                className={`${STATUS_CLS[request.status] || "bg-slate-100 text-slate-600"} text-[9px] px-2 py-0 border-none shadow-none font-bold uppercase tracking-wider`}
                              >
                                {request.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                              <Icon name="category" size={12} /> {dtCfg?.label || request.drawing_type}
                              <span>•</span>
                              <Icon name="event" size={12} /> {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shrink-0 transition-colors"
                              onClick={() => {
                                setUploadingForRequest(request.id);
                                fileInputRef.current?.click();
                              }}
                            >
                              <Icon name="attach_file" size={14} className="mr-1" /> Ref
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0 transition-colors"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
                              <Icon name="delete" size={16} />
                            </Button>
                          </div>
                        </div>

                        {/* Inline Files (e.g. references or draft previews) */}
                        {request.files.length > 0 && (
                          <div className="px-4 pb-3 pl-16">
                            <div className="space-y-1 mt-1">
                              {request.files.map((file) => {
                                const ext = file.file_type || file.original_name.split(".").pop() || "";
                                const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext.toLowerCase());
                                return (
                                  <div key={file.id} className="flex items-center gap-2.5 py-1.5 px-3 rounded-lg bg-slate-50/50 hover:bg-slate-100 transition-colors group/file">
                                    {isImage ? (
                                      <Icon name="image" size={14} className="text-indigo-400 shrink-0" />
                                    ) : (
                                      <Icon name={getFileIcon(ext)} size={14} className="text-slate-400 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                      <p className="text-xs font-medium text-slate-700 truncate">{file.original_name}</p>
                                      <span className="text-[9px] text-slate-400">{file.file_size}</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-slate-900" onClick={() => window.open(file.file, "_blank")}>
                                        <Icon name="open_in_new" size={12} />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-red-600" onClick={() => handleDeleteFile(request.id, file.id)}>
                                        <Icon name="close" size={12} />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ── Project Drawings Library ── */}
          <div className="rounded-xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Icon name="folder_open" size={18} className="text-emerald-600" />
                  Project Drawings Library
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 shadow-none border-none ml-1">
                    {filteredRequests.filter((r) => r.status === "COMPLETED").length}
                  </Badge>
                </h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">Finalized prints and direct file uploads</p>
              </div>
              <Button
                onClick={() => setShowDirectUpload(true)}
                size="sm"
                className="bg-slate-100 border border-slate-200 hover:bg-slate-200 h-8 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-none rounded-lg"
              >
                <Icon name="cloud_upload" size={14} className="mr-1.5" />
                Upload Documents
              </Button>
            </div>

            {loading ? (
              <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse border border-slate-200" />
                ))}
              </div>
            ) : filteredRequests.filter((r) => r.status === "COMPLETED").length === 0 ? (
              <div className="px-4 py-12 text-center bg-slate-50/30">
                <Icon
                  name="inventory_2"
                  size={32}
                  className="mx-auto mb-3 text-slate-300"
                />
                <p className="text-sm font-bold text-slate-500">
                  Library is empty
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Completed drafts and directly uploaded sheets will be safely stored here for easy access.
                </p>
              </div>
            ) : (
              <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRequests
                  .filter((r) => r.status === "COMPLETED")
                  .map((request) => {
                    const dtCfg = DRAWING_TYPES.find(
                      (d) => d.value === request.drawing_type,
                    );
                    return (
                      <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300 transition-colors shadow-sm group">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Icon
                              name={dtCfg?.icon || "description"}
                              size={20}
                              className="text-emerald-600"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate mb-1" title={request.title}>
                              {request.title}
                            </p>
                            <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5 truncate">
                              {dtCfg?.label || request.drawing_type}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Icon name="delete" size={14} />
                          </Button>
                        </div>
                        
                        {/* Inline Files specific to this library upload */}
                        {request.files.length > 0 ? (
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                            {request.files.map((file) => {
                              const ext = file.file_type || file.original_name.split(".").pop() || "";
                              const isImage = ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext.toLowerCase());
                              return (
                                <div key={file.id} className="flex items-center gap-2 py-1.5 px-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-100 group/file cursor-pointer" onClick={() => window.open(file.file, "_blank")}>
                                  {isImage ? (
                                    <Icon name="image" size={14} className="text-indigo-500 shrink-0" />
                                  ) : (
                                    <Icon name={getFileIcon(ext)} size={14} className="text-slate-500 shrink-0" />
                                  )}
                                  <p className="text-[11px] font-medium text-slate-700 truncate flex-1 min-w-0">
                                    {file.original_name}
                                  </p>
                                  <div className="flex items-center gap-1 opacity-0 group-hover/file:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-slate-400 font-bold mr-1">{file.file_size}</span>
                                    <Icon name="download" size={14} className="text-slate-600" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[10px] text-slate-400 italic">No files attached yet</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded"
                              onClick={() => {
                                setUploadingForRequest(request.id);
                                fileInputRef.current?.click();
                              }}
                            >
                              <Icon name="add" size={12} className="mr-1" /> Add Files
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
           </div>
        </div>
      </Main>

      {/* ── Explore Professionals Modal ── */}
      {showExploreModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowExploreModal(false)}
        >
          <Card
            className="w-full max-w-4xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon name="verified_user" size={20} />
                Verified Professionals
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowExploreModal(false)}
              >
                <Icon name="close" size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 overflow-y-auto max-h-[70vh]">
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Icon
                    name="search"
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search…"
                    className="pl-9 h-9"
                  />
                </div>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v)}
                >
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ARTISAN_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {loadingPros ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100"
                    >
                      <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                        <div className="h-3 w-48 bg-slate-50 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : professionals.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No professionals found
                  </div>
                ) : (
                  professionals.map((pro: any) => (
                    <div
                      key={pro.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-900 transition-all group"
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center ring-2 ring-white shadow-sm">
                        {pro.user_details?.avatar ? (
                          <img
                            src={pro.user_details.avatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Icon
                            name="person"
                            size={20}
                            className="text-slate-400"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {pro.user_details?.full_name}
                          </p>
                          {pro.is_verified && (
                            <Icon
                              name="verified"
                              size={14}
                              className="text-slate-400 shrink-0"
                            />
                          )}
                          <Badge
                            className={`${getAvailabilityColor(pro.availability)} text-[9px] px-2 py-0 border-none`}
                          >
                            {pro.availability}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {getRoleLabel(pro.role)} · {pro.company_name} ·{" "}
                          {pro.experience_years}yr · ★{pro.average_rating}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 h-8 px-4 text-[10px] font-bold uppercase tracking-wider text-white shrink-0 rounded-lg shadow-none"
                        onClick={() => handleAddToTeam(pro)}
                      >
                        <Icon name="person_add" size={14} className="mr-1.5" />
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 shrink-0 rounded-lg border-slate-200 text-slate-400 group-hover:text-slate-900 transition-colors"
                        onClick={() => {
                          handleContact(pro);
                          setShowExploreModal(false);
                        }}
                      >
                        <Icon name="call" size={14} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Contact Modal ── */}
      {showContactModal && selectedProfessional && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowContactModal(false)}
        >
          <Card
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="pt-6 pb-5 px-6 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center ring-2 ring-white shadow-md">
                {selectedProfessional.user_details?.avatar ? (
                  <img
                    src={selectedProfessional.user_details.avatar}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Icon name="person" size={32} className="text-slate-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-3">
                {selectedProfessional.user_details?.full_name}
              </h3>
              <p className="text-sm text-slate-500">
                {getRoleLabel(selectedProfessional.role)} ·{" "}
                {selectedProfessional.company_name}
              </p>
              <div className="w-full mt-5 space-y-2.5 text-left">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <Icon
                    name="phone"
                    size={18}
                    className="text-slate-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Phone
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {selectedProfessional.user_details?.phone_number || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <Icon
                    name="email"
                    size={18}
                    className="text-slate-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Email
                    </p>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {selectedProfessional.user_details?.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-9 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                  onClick={() => setShowContactModal(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-none"
                  onClick={() => {
                    if (selectedProfessional.user_details?.phone_number) {
                      navigator.clipboard.writeText(
                        selectedProfessional.user_details.phone_number,
                      );
                      toast.success("Phone number copied");
                    } else {
                      toast.error("No phone number");
                    }
                  }}
                >
                  <Icon name="content_copy" size={14} className="mr-1.5" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
