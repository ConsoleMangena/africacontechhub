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
import { useState, useEffect } from 'react'
import { builderApi } from '@/services/api'
import type { ProfessionalProfile } from '@/types/api'

export const Route = createFileRoute('/_authenticated/sqb-team')({
  component: RouteComponent,
})


type ProfessionalRole = 'architect' | 'structural_engineer' | 'contractor' | 'electrician' | 'plumber' | 'mason' | 'carpenter' | 'painter' | 'roofer' | 'tiler' | 'quantity_surveyor' | 'project_manager'

const PROFESSIONAL_ROLES: { value: ProfessionalRole; label: string; icon: string }[] = [
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



function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole | 'all'>('all')
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const ITEMS_PER_PAGE = 10

  const fetchProfessionals = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        search: searchTerm || undefined,
      }
      if (selectedRole !== 'all') params.role = selectedRole

      const res = await builderApi.getProfessionals(params)
      setProfessionals(res.data.results)
      setTotalCount(res.data.count)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load professionals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfessionals()
  }, [currentPage, selectedRole, searchTerm])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleContact = (professional: ProfessionalProfile) => {
    setSelectedProfessional(professional)
    setShowContactModal(true)
  }

  const getRoleIcon = (role: string) => {
    return PROFESSIONAL_ROLES.find(r => r.value === role)?.icon || 'person'
  }

  const getRoleLabel = (role: string) => {
    return PROFESSIONAL_ROLES.find(r => r.value === role)?.label || role
  }

  const getAvailabilityColor = (availability: ProfessionalProfile['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200'
      case 'busy': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'unavailable': return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Icon 
        key={i} 
        name={i < Math.floor(rating) ? 'star' : 'star_border'} 
        size={16} 
        className={i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-300'}
      />
    ))
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
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Icon name="verified_user" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">SQB Building Team</h1>
              <p className="text-xs text-muted-foreground">
                Connect with Zimbabwe's most trusted and verified construction professionals
              </p>
            </div>
          </div>

          {/* Stats Cards - Compact */}
          <div className="grid gap-2 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
              <CardContent className="p-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-emerald-100 flex items-center justify-center shrink-0">
                  <Icon name="group" size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase">Total Pros</p>
                  <span className="text-base font-bold text-emerald-700">{totalCount}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
              <CardContent className="p-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="check_circle" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-green-600 uppercase">Available</p>
                  <span className="text-base font-bold text-green-700">{professionals.filter(p => p.availability === 'available').length}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
              <CardContent className="p-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                  <Icon name="star" size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-amber-600 uppercase">Avg Rating</p>
                  <span className="text-base font-bold text-amber-700">
                    {(professionals.reduce((sum, p) => sum + parseFloat(p.average_rating), 0) / (professionals.length || 1)).toFixed(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <CardContent className="p-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon name="checklist" size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-blue-600 uppercase">Projects</p>
                  <span className="text-base font-bold text-blue-700">{professionals.reduce((sum, p) => sum + p.completed_projects_count, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="border-emerald-200">
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
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
                    onValueChange={(v) => setSelectedRole(v as ProfessionalRole | 'all')}
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
            </CardContent>
          </Card>

          {/* Verified Professionals List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="verified_user" size={24} />
              Verified Building Professionals
            </h2>
            
            <div className="grid gap-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="text-slate-500 font-medium">Loading professionals...</p>
                </div>
              ) : professionals.length === 0 ? (
                <Card className="p-12 text-center border-emerald-100">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="search_off" size={40} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No professionals found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    We couldn't find any professionals matching your search criteria. Try adjusting your filters.
                  </p>
                </Card>
              ) : (
                professionals.map(professional => (
                  <Card key={professional.id} className="overflow-hidden hover:shadow-lg transition-shadow border-emerald-100">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                            {professional.user_details?.avatar ? (
                              <img src={professional.user_details.avatar} alt="" className="h-full w-full object-cover rounded-lg" />
                            ) : (
                              <Icon name={getRoleIcon(professional.role)} size={32} className="text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-slate-900">{professional.user_details?.full_name}</h3>
                              {professional.is_verified && (
                                <div className="flex items-center gap-1">
                                  <Icon name="verified" size={16} className="text-emerald-600" />
                                  <span className="text-xs font-semibold text-emerald-600">VERIFIED</span>
                                </div>
                              )}
                              <Badge className={getAvailabilityColor(professional.availability)}>
                                {professional.availability.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-slate-600 font-medium">{getRoleLabel(professional.role)} · {professional.company_name}</p>
                            <p className="text-sm text-slate-500 mt-1">{professional.location} · {professional.experience_years} years experience</p>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1">
                                {renderStars(parseFloat(professional.average_rating))}
                                <span className="text-sm text-slate-600">({professional.average_rating})</span>
                              </div>
                              <span className="text-sm text-slate-500">
                                <span className="font-medium">{professional.completed_projects_count}</span> projects completed
                              </span>
                              <span className="text-sm font-medium text-emerald-700">{professional.hourly_rate}</span>
                            </div>

                            <div className="flex flex-wrap gap-1 mt-2">
                              {professional.specialties.map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{professional.bio}</p>

                            {professional.certifications.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {professional.certifications.slice(0, 2).map((cert, index) => (
                                  <span key={index} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            onClick={() => handleContact(professional)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Icon name="contact_phone" size={16} className="mr-2" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            <Icon name="visibility" size={16} className="mr-2" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Icon name="chevron_left" size={16} />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Icon name="chevron_right" size={16} />
                </Button>
              </div>
            )}
          </div>

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
                      className="flex-1"
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
                      className="flex-1"
                    >
                      <Icon name="content_copy" size={16} className="mr-2" />
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
