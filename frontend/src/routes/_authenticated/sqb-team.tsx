import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

const AVAIL_CLS: Record<string, { dot: string; badge: string }> = {
  available:   { dot: 'bg-green-500',  badge: 'bg-green-100 text-green-700' },
  busy:        { dot: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700' },
  unavailable: { dot: 'bg-red-400',    badge: 'bg-red-100 text-red-600' },
}

function getInitials(name?: string) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function Avatar({ src, name, size = 'lg' }: { src?: string; name?: string; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-24 w-24' : 'h-14 w-14'
  const textSz = size === 'lg' ? 'text-2xl' : 'text-base'
  if (src) {
    return <img src={src} alt={name ?? ''} className={`${dim} rounded-full object-cover ring-2 ring-white shadow-md`} />
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center ring-2 ring-white shadow-md`}>
      <span className={`${textSz} font-bold text-white`}>{getInitials(name)}</span>
    </div>
  )
}

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<ProfessionalRole | 'all'>('all')
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalProfile | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const ITEMS_PER_PAGE = 12

  const fetchProfessionals = async () => {
    setLoading(true)
    try {
      const params: any = { page: currentPage, search: searchTerm || undefined }
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

  useEffect(() => { fetchProfessionals() }, [currentPage, selectedRole, searchTerm])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const getRoleLabel = (role: string) => PROFESSIONAL_ROLES.find(r => r.value === role)?.label || role

  return (
    <>
      <Header>
        <div className="ms-auto flex items-center space-x-4">
          <Search />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="bg-slate-50 min-h-[calc(100vh-theme(spacing.16))]">
        <div className="w-full p-4 md:p-8 space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">SQB Building Team</h1>
              <p className="text-sm text-slate-500 mt-0.5">Verified construction professionals you can trust</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" />Available</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" />Busy</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-400" />Unavailable</span>
            </div>
          </div>

          {/* ── Search / Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="relative flex-1">
              <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                placeholder="Search by name, company, specialty…"
                className="pl-9 h-10 border-slate-200"
              />
            </div>
            <Select value={selectedRole} onValueChange={v => { setSelectedRole(v as ProfessionalRole | 'all'); setCurrentPage(1) }}>
              <SelectTrigger className="h-10 w-full sm:w-48 border-slate-200"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {PROFESSIONAL_ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* ── Results count ── */}
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {loading ? 'Loading…' : `${totalCount} professional${totalCount !== 1 ? 's' : ''} found`}
          </p>

          {/* ── Grid ── */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 flex flex-col items-center gap-4">
                  <div className="h-24 w-24 rounded-full bg-slate-100 animate-pulse" />
                  <div className="w-32 h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="w-24 h-3 bg-slate-50 rounded animate-pulse" />
                  <div className="w-full h-8 bg-slate-50 rounded animate-pulse mt-2" />
                </div>
              ))}
            </div>
          ) : professionals.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
              <Icon name="search_off" size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500 font-medium">No professionals match your search</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {professionals.map(pro => {
                const avail = AVAIL_CLS[pro.availability] ?? AVAIL_CLS.unavailable
                return (
                  <div
                    key={pro.id}
                    className="group rounded-xl border border-slate-200 bg-white hover:shadow-lg hover:border-green-300 transition-all duration-200 overflow-hidden"
                  >
                    {/* Top accent */}
                    <div className="h-16 bg-gradient-to-r from-green-700 to-green-900 relative">
                      {pro.is_verified && (
                        <span className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-2 py-0.5">
                          <Icon name="verified" size={12} className="text-green-700" />
                          <span className="text-[9px] font-bold text-green-800 uppercase">Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Avatar overlapping accent */}
                    <div className="flex justify-center -mt-12">
                      <div className="relative">
                        <Avatar src={pro.user_details?.avatar} name={pro.user_details?.full_name} size="lg" />
                        <span className={`absolute bottom-1 right-1 h-4 w-4 rounded-full ${avail.dot} ring-2 ring-white`} />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="px-5 pt-3 pb-5 text-center">
                      <h3 className="text-base font-bold text-slate-900 truncate">{pro.user_details?.full_name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{getRoleLabel(pro.role)}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{pro.company_name} · {pro.location}</p>

                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3 text-[11px] sm:text-xs text-slate-500 line-clamp-2">
                        <span className="flex items-center gap-1">
                          <Icon name="star" size={14} className="text-amber-400" />
                          <span className="font-bold text-slate-700">{pro.average_rating}</span>
                        </span>
                        <span className="hidden sm:inline h-3 w-px bg-slate-200" />
                        <span>
                          <span className="font-bold text-slate-700">{pro.completed_projects_count}</span> projects
                        </span>
                        <span className="hidden sm:inline h-3 w-px bg-slate-200" />
                        <span>
                          <span className="font-bold text-slate-700">{pro.experience_years}</span>yr
                        </span>
                      </div>

                      {/* Specialties */}
                      {pro.specialties.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1 mt-3">
                          {pro.specialties.slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] font-medium bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">{s}</span>
                          ))}
                          {pro.specialties.length > 3 && (
                            <span className="text-[10px] font-medium text-slate-400">+{pro.specialties.length - 3}</span>
                          )}
                        </div>
                      )}

                      {/* Rate + availability */}
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {pro.hourly_rate && (
                          <span className="text-xs font-bold text-green-800 bg-green-50 rounded-full px-2.5 py-0.5">{pro.hourly_rate}</span>
                        )}
                        <Badge className={`${avail.badge} text-[10px] px-2 py-0 border-none`}>{pro.availability}</Badge>
                      </div>

                      {/* Action */}
                      <Button
                        size="sm"
                        className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white h-9"
                        onClick={() => { setSelectedProfessional(pro); setShowContactModal(true) }}
                      >
                        <Icon name="call" size={16} className="mr-1.5" />
                        Contact
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0">
                <Icon name="chevron_left" size={16} />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'dots' ? (
                    <span key={`d${idx}`} className="text-slate-400 text-xs px-1">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={currentPage === item ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(item as number)}
                      className={`h-8 w-8 p-0 ${currentPage === item ? 'bg-green-700 hover:bg-green-800' : ''}`}
                    >
                      {item}
                    </Button>
                  )
                )}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
                <Icon name="chevron_right" size={16} />
              </Button>
            </div>
          )}

          {/* ── Contact Modal ── */}
          {showContactModal && selectedProfessional && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowContactModal(false)}>
              <Card className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <CardContent className="pt-6 pb-5 px-6 flex flex-col items-center text-center">
                  <Avatar src={selectedProfessional.user_details?.avatar} name={selectedProfessional.user_details?.full_name} size="lg" />
                  <h3 className="text-lg font-bold text-slate-900 mt-3">{selectedProfessional.user_details?.full_name}</h3>
                  <p className="text-sm text-slate-500">{getRoleLabel(selectedProfessional.role)} · {selectedProfessional.company_name}</p>

                  <div className="w-full mt-5 space-y-2.5 text-left">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <Icon name="phone" size={18} className="text-green-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Phone</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{selectedProfessional.user_details?.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <Icon name="email" size={18} className="text-green-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Email</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{selectedProfessional.user_details?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                      <Icon name="location_on" size={18} className="text-green-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">Location</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{selectedProfessional.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full mt-5">
                    <Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => setShowContactModal(false)}>Close</Button>
                    <Button size="sm" className="flex-1 h-9 bg-green-700 hover:bg-green-800" onClick={() => {
                      if (selectedProfessional.user_details?.phone_number) {
                        navigator.clipboard.writeText(selectedProfessional.user_details.phone_number)
                        toast.success('Phone number copied')
                      } else { toast.error('No phone number') }
                    }}>
                      <Icon name="content_copy" size={14} className="mr-1" />Copy Phone
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
