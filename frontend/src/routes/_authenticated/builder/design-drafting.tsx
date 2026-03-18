import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useState, useRef, useEffect, useCallback } from 'react'
import { builderApi } from '@/services/api'
import type { Project, DrawingRequest, DrawingFile } from '@/types/api'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/builder/design-drafting')({
  component: RouteComponent,
})

const ARTISAN_ROLES: { value: string; label: string; icon: string }[] = [
  { value: 'architect', label: 'Architect', icon: 'architecture' },
  { value: 'structural_engineer', label: 'Structural Engineer', icon: 'foundation' },
  { value: 'contractor', label: 'General Contractor', icon: 'engineering' },
  { value: 'project_manager', label: 'Project Manager', icon: 'manage_accounts' },
  { value: 'quantity_surveyor', label: 'Quantity Surveyor', icon: 'calculate' },
  { value: 'electrician', label: 'Electrician', icon: 'electrical_services' },
  { value: 'plumber', label: 'Plumber', icon: 'water_damage' },
  { value: 'mason', label: 'Mason/Bricklayer', icon: 'wall' },
  { value: 'carpenter', label: 'Carpenter', icon: 'carpenter' },
  { value: 'painter', label: 'Painter', icon: 'format_paint' },
  { value: 'roofer', label: 'Roofer', icon: 'roofing' },
  { value: 'tiler', label: 'Tiler', icon: 'grid_on' },
]

const PROFESSIONAL_ROLES = ARTISAN_ROLES;

// Skeleton cards for loading state
function RequestsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

function DesignLoadingBar() {
  return (
    <div className="h-0.5 w-full bg-slate-100 overflow-hidden rounded-full">
      <div className="h-full w-1/3 bg-indigo-500 rounded-full" style={{ animation: 'designShimmer 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes designShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
    </div>
  )
}

function RouteComponent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [requests, setRequests] = useState<DrawingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [uploadingForRequest, setUploadingForRequest] = useState<number | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedDrawingType, setSelectedDrawingType] = useState<DrawingRequest['drawing_type']>('floor_plan')
  const [refetching, setRefetching] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const directUploadRef = useRef<HTMLInputElement>(null)
  const [showDirectUpload, setShowDirectUpload] = useState(false)
  const [directUploadForm, setDirectUploadForm] = useState({
    drawingType: 'floor_plan' as DrawingRequest['drawing_type'],
    title: '',
  })
  const [directFiles, setDirectFiles] = useState<File[]>([])
  const [uploadingDirect, setUploadingDirect] = useState(false)

  // Caches
  const requestsCacheRef = useRef<Map<number, DrawingRequest[]>>(new Map())
  const projectsCachedRef = useRef(false)

  // Explore Professionals State
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<any | null>(null)
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loadingPros, setLoadingPros] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<'all' | string>('architect')

  // Form state
  const [form, setForm] = useState({
    drawingType: 'floor_plan' as DrawingRequest['drawing_type'],
    title: '',
  })

  // Load projects
  const fetchProjects = useCallback(() => {
    builderApi.getProjects()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
        projectsCachedRef.current = true
        if (data.length > 0 && !selectedProject) setSelectedProject(data[0].id)
      })
      .catch(() => toast.error('Failed to load projects'))
  }, [selectedProject])

  useEffect(() => {
    if (projectsCachedRef.current && projects.length > 0) return
    fetchProjects()
  }, [])

  const fetchProfessionals = async () => {
    setLoadingPros(true)
    try {
      const res = await builderApi.getProfessionals({ 
        role: selectedRole === 'all' ? undefined : selectedRole,
        search: searchTerm || undefined
      })
      setProfessionals(res.data.results || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load professionals')
    } finally {
      setLoadingPros(false)
    }
  }

  useEffect(() => {
    if (showExploreModal) {
      fetchProfessionals()
    }
  }, [showExploreModal, searchTerm, selectedRole])

  const handleAddToTeam = async (pro: any) => {
    if (!selectedProject) {
      toast.error('Please select a project first')
      return
    }

    try {
      await builderApi.addToTeam({
        project: selectedProject,
        user: pro.user,
        role: pro.role,
        status: 'assigned',
        notes: `Added from Design Drafting page`
      })
      toast.success(`${pro.user_details?.full_name} assigned to project`)
      fetchProjects() // Refresh projects to get new architect_details
      setShowExploreModal(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to add professional to team')
    }
  }

  const handleContact = (professional: any) => {
    setSelectedProfessional(professional)
    setShowContactModal(true)
  }

  const getRoleIcon = (role: string) => {
    return ARTISAN_ROLES.find(r => r.value === role)?.icon || 'person'
  }

  const getRoleLabel = (role: string) => {
    return ARTISAN_ROLES.find(r => r.value === role)?.label || role
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200'
      case 'busy': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'unavailable': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon 
        key={i} 
        name={i < Math.floor(rating) ? 'star' : 'star_border'} 
        size={14} 
        className={i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-300'}
      />
    ))
  }

  const fetchRequests = useCallback(async () => {
    if (!selectedProject) return
    // Show cached data immediately
    const cached = requestsCacheRef.current.get(selectedProject)
    if (cached) {
      setRequests(cached)
      setRefetching(true)
    } else {
      setLoading(true)
    }
    try {
      const res = await builderApi.getProjectDrawingRequests(selectedProject)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      setRequests(data)
      requestsCacheRef.current.set(selectedProject, data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
      setRefetching(false)
    }
  }, [selectedProject])

  useEffect(() => {
    fetchRequests()
  }, [selectedProject])

  const handleSubmitRequest = async () => {
    if (!selectedProject || !form.title) {
      toast.error('Please select a project and enter a title')
      return
    }

    setSaving(true)
    try {
      await builderApi.createDrawingRequest({
        project: selectedProject,
        drawing_type: form.drawingType,
        title: form.title,
      })
      setForm({ drawingType: 'floor_plan', title: '' })
      setShowRequestForm(false)
      toast.success('Drawing request submitted to architect')
      fetchRequests()
    } catch (err) {
      console.error(err)
      toast.error('Failed to submit request')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (requestId: number, files: FileList | null) => {
    if (!files || files.length === 0) return

    const maxSize = 50 * 1024 * 1024
    setLoading(true)

    try {
      for (const file of Array.from(files)) {
        if (file.size > maxSize) {
          toast.error(`${file.name}: File too large (max 50MB)`)
          continue
        }

        const formData = new FormData()
        formData.append('request', requestId.toString())
        formData.append('file', file)
        formData.append('original_name', file.name)
        formData.append('file_type', file.name.split('.').pop()?.toLowerCase() || 'file')
        formData.append('file_size', (file.size / (1024 * 1024)).toFixed(1) + ' MB')

        await builderApi.uploadDrawingFile(formData)
        toast.success(`${file.name} uploaded successfully`)
      }
      fetchRequests()
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload files')
    } finally {
      setLoading(false)
      setUploadingForRequest(null)
      setShowUploadModal(false)
    }
  }

  const handleDeleteFile = async (requestId: number, fileId: number) => {
    try {
      await builderApi.deleteDrawingFile(fileId)
      toast.success('File removed')
      fetchRequests()
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove file')
    }
  }

  const handleDeleteRequest = async (requestId: number) => {
    // Optimistic delete
    const previousRequests = requests
    const updated = requests.filter(r => r.id !== requestId)
    setRequests(updated)
    if (selectedProject) requestsCacheRef.current.set(selectedProject, updated)
    try {
      await builderApi.deleteDrawingRequest(requestId)
      toast.success('Request deleted')
    } catch (err) {
      console.error(err)
      setRequests(previousRequests)
      if (selectedProject) requestsCacheRef.current.set(selectedProject, previousRequests)
      toast.error('Failed to delete request')
    }
  }

  const handleDirectUpload = async () => {
    if (!selectedProject || directFiles.length === 0) {
      toast.error('Please select a project and choose files')
      return
    }

    setUploadingDirect(true)
    try {
      const generatedTitle = directFiles.length === 1
        ? directFiles[0].name.replace(/\.[^/.]+$/, '')
        : `${directFiles.length} uploaded drawing files`
      const title = directUploadForm.title.trim() || generatedTitle

      // Create a drawing request for the uploaded files
      const res = await builderApi.createDrawingRequest({
        project: selectedProject,
        drawing_type: directUploadForm.drawingType,
        title,
      })
      const requestId = res.data.id

      // Upload all selected files
      const maxSize = 50 * 1024 * 1024
      for (const file of directFiles) {
        if (file.size > maxSize) {
          toast.error(`${file.name}: File too large (max 50MB)`)
          continue
        }
        const formData = new FormData()
        formData.append('request', requestId.toString())
        formData.append('file', file)
        formData.append('original_name', file.name)
        formData.append('file_type', file.name.split('.').pop()?.toLowerCase() || 'file')
        formData.append('file_size', (file.size / (1024 * 1024)).toFixed(1) + ' MB')
        await builderApi.uploadDrawingFile(formData)
      }

      toast.success(`${directFiles.length} file(s) uploaded successfully`)
      setDirectUploadForm({ drawingType: 'floor_plan', title: '' })
      setDirectFiles([])
      setShowDirectUpload(false)
      fetchRequests()
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload drawings')
    } finally {
      setUploadingDirect(false)
    }
  }

  const getStatusColor = (status: DrawingRequest['status']) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200'
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getDrawingTypeLabel = (type: DrawingRequest['drawing_type']) => {
    switch (type) {
      case 'floor_plan': return 'Floor Plan'
      case 'elevation': return 'Elevation'
      case 'section': return 'Section View'
      case '3d_render': return '3D Render'
      case 'blueprint': return 'Blueprint'
      default: return 'Other'
    }
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'picture_as_pdf'
      case 'png':
      case 'jpg':
      case 'jpeg': return 'image'
      case 'dwg':
      case 'dxf': return 'architecture'
      case 'zip':
      case 'rar':
      case '7z': return 'archive'
      case 'doc':
      case 'docx': return 'description'
      case 'xls':
      case 'xlsx': return 'table_view'
      default: return 'insert_drive_file'
    }
  }

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Icon name="architecture" size={24} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display">Design Drafting</h1>
                <p className="text-sm text-muted-foreground">
                  Upload your own drawings or request them from certified architects
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDirectUpload(true)}
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <Icon name="cloud_upload" size={14} className="mr-1.5" />
                Upload Drawings
              </Button>
              <Button
                onClick={() => setShowRequestForm(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs font-semibold"
              >
                <Icon name="add" size={14} className="mr-1.5" />
                Request Drawing
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-indigo-600 uppercase tracking-wider">Total Requests</p>
                <span className="text-xl font-bold text-indigo-700">{requests.length}</span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
                <span className="text-xl font-bold text-amber-700">{requests.filter(r => r.status === 'PENDING').length}</span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider">In Progress</p>
                <span className="text-xl font-bold text-blue-700">{requests.filter(r => r.status === 'IN_PROGRESS').length}</span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wider">Completed</p>
                <span className="text-xl font-bold text-green-700">{requests.filter(r => r.status === 'COMPLETED').length}</span>
              </CardContent>
            </Card>
          </div>

          {/* Request Form */}
          {showRequestForm && (
            <Card className="border-indigo-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="request_page" size={20} />
                  Request New Drawing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assigned Architect - Dynamic */}
                <div className={cn(
                  "border rounded-lg p-4 transition-colors",
                  projects.find(p => p.id === selectedProject)?.architect_details 
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200" 
                    : "bg-slate-50 border-slate-200"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon name="architecture" size={20} className={cn(
                        projects.find(p => p.id === selectedProject)?.architect_details ? "text-amber-600" : "text-slate-400"
                      )} />
                      <span className={cn(
                        "text-sm font-semibold uppercase tracking-wider",
                        projects.find(p => p.id === selectedProject)?.architect_details ? "text-amber-800" : "text-slate-500"
                      )}>
                        Assigned Architect (Team: {projects.find(p => p.id === selectedProject)?.total_team_count || 0})
                      </span>
                    </div>
                    {!projects.find(p => p.id === selectedProject)?.architect_details && (
                      <Button 
                        onClick={() => setShowExploreModal(true)}
                        variant="outline" 
                        size="sm"
                        className="h-7 text-[10px] font-bold gap-1 border-slate-300 hover:bg-white"
                      >
                        <Icon name="person_search" size={14} />
                        Assign Architect
                      </Button>
                    )}
                  </div>

                  {projects.find(p => p.id === selectedProject)?.architect_details ? (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border border-amber-200">
                        {projects.find(p => p.id === selectedProject)?.architect_details?.avatar ? (
                          <img 
                            src={projects.find(p => p.id === selectedProject)?.architect_details?.avatar || ''} 
                            alt="avatar" 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <Icon name="person" size={20} className="text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {projects.find(p => p.id === selectedProject)?.architect_details?.full_name}
                        </p>
                        <p className="text-sm text-slate-500">Professional Architect</p>
                        <p className="text-xs text-slate-400">
                          {projects.find(p => p.id === selectedProject)?.architect_details?.email} · {projects.find(p => p.id === selectedProject)?.architect_details?.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 text-center">
                      <p className="text-xs text-slate-500 italic">
                        {projects.find(p => p.id === selectedProject)?.total_team_count && projects.find(p => p.id === selectedProject)?.total_team_count! > 0 
                          ? `You have ${projects.find(p => p.id === selectedProject)?.total_team_count} team members, but no Architect assigned.`
                          : "No architect has been assigned to this project yet."}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">You need an architect to process your drawing requests.</p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select 
                      value={selectedProject?.toString() || ''} 
                      onValueChange={(v) => setSelectedProject(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Drawing Type</Label>
                    <Select 
                      value={form.drawingType} 
                      onValueChange={(v) => setForm(prev => ({ ...prev, drawingType: v as DrawingRequest['drawing_type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floor_plan">Floor Plan</SelectItem>
                        <SelectItem value="elevation">Elevation</SelectItem>
                        <SelectItem value="section">Section View</SelectItem>
                        <SelectItem value="3d_render">3D Render</SelectItem>
                        <SelectItem value="blueprint">Technical Blueprint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Ground Floor Plan - 4 Bedroom Layout"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitRequest}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Icon name="send" size={14} className="mr-1.5" />
                    )}
                    {saving ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Direct Upload Form */}
          {showDirectUpload && (
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="cloud_upload" size={20} className="text-emerald-600" />
                  Upload Your Drawings
                </CardTitle>
                <p className="text-xs text-muted-foreground">Already have drawing files? Upload them directly without requesting from an architect.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Project</Label>
                    <Select
                      value={selectedProject?.toString() || ''}
                      onValueChange={(v) => setSelectedProject(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Drawing Type</Label>
                    <Select
                      value={directUploadForm.drawingType}
                      onValueChange={(v) => setDirectUploadForm(prev => ({ ...prev, drawingType: v as DrawingRequest['drawing_type'] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floor_plan">Floor Plan</SelectItem>
                        <SelectItem value="elevation">Elevation</SelectItem>
                        <SelectItem value="section">Section View</SelectItem>
                        <SelectItem value="3d_render">3D Render</SelectItem>
                        <SelectItem value="blueprint">Technical Blueprint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title (optional)</Label>
                    <Input
                      value={directUploadForm.title}
                      onChange={(e) => setDirectUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Ground Floor Plan - Final (auto-generated if blank)"
                    />
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                    directFiles.length > 0 ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/30"
                  )}
                  onClick={() => directUploadRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const files = Array.from(e.dataTransfer.files)
                    setDirectFiles(prev => [...prev, ...files])
                  }}
                >
                  <Icon name="cloud_upload" size={36} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Click to select files or drag and drop</p>
                  <p className="text-xs text-slate-400">PDF, PNG, JPG, DWG, DXF and more (Max 50MB each)</p>
                </div>
                <input
                  type="file"
                  ref={directUploadRef}
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setDirectFiles(prev => [...prev, ...Array.from(e.target.files!)])
                      e.target.value = ''
                    }
                  }}
                />

                {/* Selected files list */}
                {directFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{directFiles.length} file(s) selected</p>
                    <div className="space-y-1.5">
                      {directFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Icon name={getFileIcon(file.name.split('.').pop() || '')} size={16} className="text-slate-500" />
                            <span className="text-sm text-slate-700">{file.name}</span>
                            <span className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDirectFiles(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <Icon name="close" size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setShowDirectUpload(false); setDirectFiles([]) }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDirectUpload}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 h-8 text-xs"
                    disabled={uploadingDirect || !selectedProject || directFiles.length === 0}
                  >
                    {uploadingDirect ? (
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
                    ) : (
                      <Icon name="cloud_upload" size={14} className="mr-1.5" />
                    )}
                    {uploadingDirect ? 'Uploading...' : `Upload ${directFiles.length} File(s)`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => uploadingForRequest && handleFileUpload(uploadingForRequest, e.target.files)}
          />

          {/* Requests List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="folder" size={20} />
              Drawing Requests & Files
            </h2>

            {refetching && <DesignLoadingBar />}

            {loading ? (
              <RequestsSkeleton />
            ) : requests.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="architecture" size={20} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-medium text-slate-900 mb-1">No Drawing Requests Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
                  Request drawings from a certified architect, or upload your own files directly.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => setShowDirectUpload(true)} size="sm" variant="outline" className="h-7 px-3 text-[11px] border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    <Icon name="cloud_upload" size={13} className="mr-1" />
                    Upload Drawings
                  </Button>
                  <Button onClick={() => setShowRequestForm(true)} size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-7 px-3 text-[11px]">
                    <Icon name="add" size={13} className="mr-1" />
                    Request Drawing
                  </Button>
                </div>
              </Card>
            ) : (
              requests.map(request => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                          <Icon name={
                            request.drawing_type === 'floor_plan' ? 'domain' :
                            request.drawing_type === 'elevation' ? 'view_sidebar' :
                            request.drawing_type === 'section' ? 'view_column' :
                            request.drawing_type === '3d_render' ? 'view_in_ar' :
                            'blueprint'
                          } size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{request.title}</CardTitle>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500">{getDrawingTypeLabel(request.drawing_type)}</p>
                          <p className="text-xs text-slate-400 mt-1">Requested: {new Date(request.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => {
                            setUploadingForRequest(request.id)
                            setShowUploadModal(true)
                          }}
                        >
                          <Icon name="cloud_upload" size={14} className="mr-1" />
                          Upload
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteRequest(request.id)}
                        >
                          <Icon name="delete" size={14} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {request.files.length > 0 && (
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Icon name="attach_file" size={16} />
                          Attached Files ({request.files.length})
                        </h4>
                        <div className="grid gap-2">
                          {request.files.map(file => (
                            <div 
                              key={file.id} 
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center border">
                                  <Icon name={getFileIcon(file.file_type || file.original_name.split('.').pop() || '')} size={20} className="text-slate-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{file.original_name}</p>
                                  <p className="text-xs text-slate-500">
                                    {(file.file_type || 'file').toUpperCase()} · {file.file_size} · {new Date(file.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => window.open(file.file, '_blank')}
                                >
                                  <Icon name="visibility" size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteFile(request.id, file.id)}
                                >
                                  <Icon name="delete" size={14} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
            ))
          )}
          </div>

          {/* File Types Info */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon name="info" size={16} />
                <span>Supported file formats: All formats supported (max 50MB per file)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>

      {/* Upload Modal */}
      {showUploadModal && uploadingForRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="cloud_upload" size={20} />
                Upload Drawing Files
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadingForRequest(null)
                }}
                className="ml-auto"
              >
                <Icon name="close" size={20} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Drawing Type</Label>
                <Select 
                  value={selectedDrawingType} 
                  onValueChange={(v) => setSelectedDrawingType(v as DrawingRequest['drawing_type'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="floor_plan">Floor Plan</SelectItem>
                    <SelectItem value="elevation">Elevation</SelectItem>
                    <SelectItem value="section">Section View</SelectItem>
                    <SelectItem value="3d_render">3D Render</SelectItem>
                    <SelectItem value="blueprint">Blueprint</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Files</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Icon name="cloud_upload" size={40} className="text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Click to select files or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">
                    All file formats supported (Max 50MB each)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 h-8 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="folder_open" size={14} className="mr-1.5" />
                    Select Files
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadingForRequest(null)
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false)
                    fileInputRef.current?.click()
                  }}
                  className="flex-1 h-8 text-xs"
                >
                  <Icon name="cloud_upload" size={14} className="mr-1.5" />
                  Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (uploadingForRequest) {
            handleFileUpload(uploadingForRequest, e.target.files)
          }
        }}
      />

      {/* Explore Professionals Modal */}
      {showExploreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="verified_user" size={20} />
                Explore Verified Building Professionals
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowExploreModal(false)}
                className="h-8 w-8"
              >
                <Icon name="close" size={20} />
              </Button>
            </CardHeader>
            <CardContent className="p-4 overflow-y-auto max-h-[70vh]">
              {/* Search and Filters */}
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="space-y-2">
                  <Label>Search Professionals</Label>
                  <div className="relative">
                    <Icon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, company, or specialty..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Filter by Role</Label>
                  <Select 
                    value={selectedRole} 
                    onValueChange={(v) => setSelectedRole(v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {PROFESSIONAL_ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center gap-2">
                            <Icon name={role.icon} size={16} />
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Professionals List */}
              <div className="grid gap-4">
                {loadingPros ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                    <p className="text-slate-500 text-sm">Searching professionals...</p>
                  </div>
                ) : professionals.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Icon name="search_off" size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No professionals found</p>
                  </div>
                ) : (
                  professionals.map(professional => (
                    <Card key={professional.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden">
                              {professional.user_details?.avatar ? (
                                <img src={professional.user_details.avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Icon name={getRoleIcon(professional.role)} size={24} className="text-indigo-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900">{professional.user_details?.full_name}</h3>
                                {professional.is_verified && (
                                  <div className="flex items-center gap-1">
                                    <Icon name="verified" size={14} className="text-emerald-600" />
                                    <span className="text-xs font-semibold text-emerald-600">VERIFIED</span>
                                  </div>
                                )}
                                <Badge className={getAvailabilityColor(professional.availability)}>
                                  {professional.availability.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-slate-600 text-sm font-medium">{getRoleLabel(professional.role)} · {professional.company_name}</p>
                              <p className="text-slate-500 text-xs mt-1">{professional.location} · {professional.experience_years} years experience</p>
                              
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1">
                                  {renderStars(parseFloat(professional.average_rating))}
                                  <span className="text-xs text-slate-600">({professional.average_rating})</span>
                                </div>
                                <span className="text-xs text-slate-500">
                                  <span className="font-medium">{professional.completed_projects_count}</span> projects
                                </span>
                                <span className="text-xs font-medium text-slate-700">{professional.hourly_rate}</span>
                              </div>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {professional.specialties.slice(0, 3).map((specialty: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Button
                              onClick={() => handleAddToTeam(professional)}
                              className="bg-indigo-600 hover:bg-indigo-700 h-7 px-2.5 text-[11px] font-bold gap-1"
                              size="sm"
                            >
                              <Icon name="person_add" size={13} className="-ml-0.5" />
                              Add to Team
                            </Button>
                            <Button
                              onClick={() => handleContact(professional)}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[11px] font-bold gap-1 border-slate-200"
                            >
                              <Icon name="contact_phone" size={13} className="-ml-0.5" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedProfessional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="contact_phone" size={20} />
                Contact {selectedProfessional.user_details?.full_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="phone" size={20} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{selectedProfessional.user_details?.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="email" size={20} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{selectedProfessional.user_details?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="business" size={20} className="text-slate-400" />
                  <div>
                    <p className="text-sm text-slate-500">Company</p>
                    <p className="font-medium">{selectedProfessional.company_name}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 h-7 text-[11px] font-bold border-slate-200"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedProfessional.user_details?.phone_number) {
                      navigator.clipboard.writeText(selectedProfessional.user_details.phone_number);
                      toast.success('Phone number copied to clipboard');
                    } else {
                      toast.error('No phone number available');
                    }
                  }}
                  className="flex-1 h-7 text-[11px] font-bold gap-1"
                >
                  <Icon name="content_copy" size={13} className="-ml-0.5" />
                  Copy Phone
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
