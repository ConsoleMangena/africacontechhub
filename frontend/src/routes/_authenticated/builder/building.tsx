import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useState, useEffect, useRef, useCallback } from 'react'
import { builderApi } from '@/services/api'
import type { Project, ProjectTeam, ProfessionalProfile } from '@/types/api'

export const Route = createFileRoute('/_authenticated/builder/building')({
  component: RouteComponent,
})

const ARTISAN_ROLES: { value: ProjectTeam['role']; label: string; icon: string }[] = [
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

// Skeleton cards for loading artisans
function ArtisansSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-slate-100">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
              </div>
              <div className="h-7 w-[90px] bg-slate-100 rounded animate-pulse" />
              <div className="h-7 w-7 bg-slate-100 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function BuildLoadingBar() {
  return (
    <div className="h-0.5 w-full bg-slate-100 overflow-hidden rounded-full mb-2">
      <div className="h-full w-1/3 bg-green-500 rounded-full" style={{ animation: 'buildShimmer 1.2s ease-in-out infinite' }} />
      <style>{`@keyframes buildShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
    </div>
  )
}

function RouteComponent() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [artisans, setArtisans] = useState<ProjectTeam[]>([])
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [refetching, setRefetching] = useState(false)
  const [showExploreModal, setShowExploreModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | 'all'>('all')
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null)
  const [isArtisansExpanded, setIsArtisansExpanded] = useState(true)
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [loadingPros, setLoadingPros] = useState(false)

  // Caches
  const teamCacheRef = useRef<Map<number, ProjectTeam[]>>(new Map())
  const projectsCachedRef = useRef(false)

  // Load projects
  useEffect(() => {
    if (projectsCachedRef.current && projects.length > 0) return
    builderApi.getProjects()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
        setProjects(data)
        projectsCachedRef.current = true
        if (data.length > 0 && !selectedProject) setSelectedProject(data[0].id)
      })
      .catch(() => toast.error('Failed to load projects'))
  }, [])

  const fetchTeam = useCallback(async () => {
    if (!selectedProject) return
    const cached = teamCacheRef.current.get(selectedProject)
    if (cached) {
      setArtisans(cached)
      setRefetching(true)
    } else {
      setLoadingTeam(true)
    }
    try {
      const res = await builderApi.getProjectTeam(selectedProject)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || []
      setArtisans(data)
      teamCacheRef.current.set(selectedProject, data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load project team')
    } finally {
      setLoadingTeam(false)
      setRefetching(false)
    }
  }, [selectedProject])

  const fetchProfessionals = async () => {
    setLoadingPros(true)
    try {
      const params: any = { search: searchTerm || undefined }
      if (selectedRole !== 'all') params.role = selectedRole
      const res = await builderApi.getProfessionals(params)
      setProfessionals(res.data.results)
    } catch (err) {
      toast.error('Failed to load professionals')
    } finally {
      setLoadingPros(false)
    }
  }

  useEffect(() => {
    if (showExploreModal) fetchProfessionals()
  }, [showExploreModal, searchTerm, selectedRole])

  useEffect(() => {
    fetchTeam()
  }, [selectedProject])

  const handleDelete = async (id: number) => {
    // Optimistic delete
    const previousArtisans = artisans
    const updated = artisans.filter(a => a.id !== id)
    setArtisans(updated)
    if (selectedProject) teamCacheRef.current.set(selectedProject, updated)
    try {
      await builderApi.removeFromTeam(id)
      toast.success('Artisan removed')
    } catch (err) {
      setArtisans(previousArtisans)
      if (selectedProject) teamCacheRef.current.set(selectedProject, previousArtisans)
      toast.error('Failed to remove artisan')
    }
  }

  const handleStatusChange = async (id: number, status: ProjectTeam['status']) => {
    try {
      await builderApi.updateTeamMember(id, { status })
      setArtisans(prev => prev.map(a => a.id === id ? { ...a, status } : a))
      toast.success(`Status updated to ${status}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleContact = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional)
    setShowContactModal(true)
  }

  const handleAddToTeam = async (professional: ProfessionalProfile) => {
    if (!selectedProject) {
      toast.error('Please select a project first')
      return
    }

    if (artisans.some(a => a.user === professional.user)) {
      toast.error('This professional is already on your team')
      return
    }

    try {
      const res = await builderApi.addToTeam({
        project: selectedProject,
        user: professional.user,
        role: professional.role as any,
        status: 'pending',
        notes: `Added from verified professionals - ${professional.completed_projects_count} completed projects`
      })
      setArtisans(prev => [res.data, ...prev])
      toast.success(`${professional.user_details?.full_name} added to your building team!`)
      setShowExploreModal(false)
      fetchTeam()
    } catch (err) {
      toast.error('Failed to add professional to team')
    }
  }


  const getStatusColor = (status: ProjectTeam['status']) => {
    switch (status) {
      case 'assigned': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
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

  const assignedCount = artisans.filter(a => a.status === 'assigned').length
  const pendingCount = artisans.filter(a => a.status === 'pending').length
  const completedCount = artisans.filter(a => a.status === 'completed').length

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
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon name="construction" size={24} className="text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display">Building the Project</h1>
                <p className="text-sm text-muted-foreground">
                  Manage construction progress and on-site activities
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowExploreModal(true)}
              className="bg-green-600 hover:bg-green-700 h-8 px-4 text-xs font-bold gap-1.5"
            >
              <Icon name="person_add" size={18} className="-ml-1" />
              Add Building Team Member
            </Button>
          </div>

          {/* Project Selection */}
          <Card className="border-green-100 bg-green-50/30">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Icon name="folder_shared" size={20} className="text-green-600" />
                <Label className="text-sm font-semibold text-green-800">Selected Project</Label>
              </div>
              <Select 
                value={selectedProject?.toString() || ''} 
                onValueChange={(v) => setSelectedProject(Number(v))}
              >
                <SelectTrigger className="w-full md:w-64 bg-white border-green-200">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-3 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wider">Total Artisans</p>
                <span className="text-xl font-bold text-green-700">{projects.find(p => p.id === selectedProject)?.total_team_count || 0}</span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-amber-600 uppercase tracking-wider">Pending</p>
                <span className="text-xl font-bold text-amber-700">{projects.find(p => p.id === selectedProject)?.team_stats?.pending || 0}</span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-green-600 uppercase tracking-wider">Active</p>
                <span className="text-xl font-bold text-green-700">{projects.find(p => p.id === selectedProject)?.team_stats?.assigned || 0}</span>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardContent className="p-3">
                <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider">Completed</p>
                <span className="text-xl font-bold text-blue-700">{projects.find(p => p.id === selectedProject)?.team_stats?.completed || 0}</span>
              </CardContent>
            </Card>
          </div>

          {/* Artisans List */}
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer group"
              onClick={() => setIsArtisansExpanded(!isArtisansExpanded)}
            >
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Icon name="groups" size={20} className="text-slate-600" />
                Assigned Artisans & Professionals
                <Badge variant="secondary" className="ml-2 text-[10px] bg-slate-100 text-slate-500 border-none">
                  {artisans.length}
                </Badge>
              </h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full transition-all">
                <Icon 
                  name={isArtisansExpanded ? 'expand_less' : 'expand_more'} 
                  size={20} 
                  className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isArtisansExpanded ? '' : 'rotate-180'}`}
                />
              </Button>
            </div>
            
            {isArtisansExpanded && (
              <>

            {refetching && <BuildLoadingBar />}

            {loadingTeam ? (
              <ArtisansSkeleton />
            ) : artisans.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="person_add" size={24} className="text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">No Artisans Assigned Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
                  Start building your team by assigning architects, contractors, and other professionals.
                </p>
                <Button onClick={() => setShowExploreModal(true)} className="bg-green-600 hover:bg-green-700 h-8 px-4 text-xs font-bold gap-1.5">
                  <Icon name="person_add" size={18} className="-ml-1" />
                  Add Building Team Member
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {artisans.map(artisan => (
                  <Card key={artisan.id} className="overflow-hidden border-slate-100 shadow-none hover:border-slate-200 transition-colors">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                            {artisan.user_details?.avatar ? (
                              <img src={artisan.user_details.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Icon name={getRoleIcon(artisan.role)} size={18} className="text-slate-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-xs font-bold text-slate-800 truncate">{artisan.full_name}</h3>
                              <Badge className={`${getStatusColor(artisan.status)} text-[8px] px-1 py-0 h-3.5 border-none font-bold uppercase tracking-tight`}>
                                {artisan.status}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-500 truncate font-medium">
                              {getRoleLabel(artisan.role)}
                            </p>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                          {artisan.user_details?.phone && (
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                              <Icon name="phone" size={12} />
                              {artisan.user_details.phone}
                            </span>
                          )}
                          {artisan.user_details?.email && (
                            <span className="flex items-center gap-0.5 text-[10px] text-slate-400 font-medium">
                              <Icon name="email" size={12} />
                              {artisan.user_details.email}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <Select 
                            value={artisan.status} 
                            onValueChange={(v) => handleStatusChange(artisan.id, v as ProjectTeam['status'])}
                          >
                            <SelectTrigger className="h-7 w-[90px] text-[10px] py-0 px-2 bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending" className="text-[10px]">Pending</SelectItem>
                              <SelectItem value="assigned" className="text-[10px]">Assigned</SelectItem>
                              <SelectItem value="completed" className="text-[10px]">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(artisan.id)}
                            className="h-7 w-7 text-slate-300 hover:text-red-600 hover:bg-red-50"
                          >
                            <Icon name="delete" size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
              </>
            )}
          </div>

          {/* Explore Verified Professionals Modal */}
          {showExploreModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="verified_user" size={20} />
                    Explore Verified Building Professionals
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowExploreModal(false)}
                    className="ml-auto"
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
                      <div className="grid gap-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i} className="overflow-hidden">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-lg bg-slate-200 animate-pulse shrink-0" />
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                                  <div className="h-3 w-56 bg-slate-100 rounded animate-pulse" />
                                  <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
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
                                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                                  {professional.user_details?.avatar ? (
                                    <img src={professional.user_details.avatar} alt="" className="h-full w-full object-cover" />
                                  ) : (
                                    <Icon name={getRoleIcon(professional.role)} size={24} className="text-green-600" />
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
                                    {professional.specialties.slice(0, 3).map((specialty, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {specialty}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button 
                                  onClick={() => handleAddToTeam(professional)}
                                  className="bg-green-600 hover:bg-green-700 h-8 px-3 text-xs font-bold gap-1.5"
                                  size="sm"
                                >
                                  <Icon name="person_add" size={16} className="-ml-0.5" />
                                  Add to Team
                                </Button>
                                <Button 
                                  onClick={() => {
                                    handleContact(professional)
                                    setShowExploreModal(false)
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs font-bold gap-1.5 border-slate-200"
                                >
                                  <Icon name="contact_phone" size={16} className="-ml-0.5" />
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
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 h-8 text-xs font-bold border-slate-200"
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={() => {
                        if (selectedProfessional.user_details?.phone_number) {
                          navigator.clipboard.writeText(selectedProfessional.user_details.phone_number);
                          toast.success('Phone number copied to clipboard');
                        } else {
                          toast.error('No phone number available');
                        }
                      }}
                      className="flex-1 h-8 text-xs font-bold gap-1.5"
                    >
                      <Icon name="content_copy" size={16} className="-ml-1" />
                      Copy Phone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Main>
    </>
  )
}
