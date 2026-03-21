import { Icon } from '@/components/ui/material-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface ProjectDocument {
  id: number
  name: string
  type: 'contract' | 'permit' | 'invoice' | 'insurance' | 'warranty' | 'other'
  size: number
  uploadedAt: string
  uploadedBy: string
  url?: string
}

interface DocumentManagerProps {
  documents: ProjectDocument[]
  onUpload: (file: File, type: ProjectDocument['type']) => void
  onDelete: (id: number) => void
  onDownload: (doc: ProjectDocument) => void
  readOnly?: boolean
}

const DOC_TYPES: { value: ProjectDocument['type']; label: string; icon: string; color: string }[] = [
  { value: 'contract', label: 'Contracts', icon: 'description', color: 'blue' },
  { value: 'permit', label: 'Permits', icon: 'verified', color: 'emerald' },
  { value: 'invoice', label: 'Invoices', icon: 'receipt', color: 'violet' },
  { value: 'insurance', label: 'Insurance', icon: 'shield', color: 'amber' },
  { value: 'warranty', label: 'Warranties', icon: 'workspace_premium', color: 'rose' },
  { value: 'other', label: 'Other', icon: 'folder', color: 'slate' },
]

export function DocumentManager({ documents, onUpload, onDelete, onDownload, readOnly = false }: DocumentManagerProps) {
  const [selectedType, setSelectedType] = useState<ProjectDocument['type'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadType, setUploadType] = useState<ProjectDocument['type']>('contract')

  const filteredDocs = documents.filter(doc => {
    const matchesType = selectedType === 'all' || doc.type === selectedType
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const getDocIcon = (type: ProjectDocument['type']) => {
    return DOC_TYPES.find(t => t.value === type)?.icon || 'description'
  }

  const getDocColor = (type: ProjectDocument['type']) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      violet: 'bg-violet-50 text-violet-600 border-violet-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200',
      rose: 'bg-rose-50 text-rose-600 border-rose-200',
      slate: 'bg-slate-50 text-slate-600 border-slate-200',
    }
    const color = DOC_TYPES.find(t => t.value === type)?.color || 'slate'
    return colorMap[color]
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="folder_open" size={20} className="text-blue-600" />
            Project Documents
          </CardTitle>
          {!readOnly && (
            <Button size="sm" onClick={() => setShowUploadForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Icon name="upload_file" size={14} className="mr-1" />
              Upload
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search documents..."
              className="pl-10 h-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedType('all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                selectedType === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              All ({documents.length})
            </button>
            {DOC_TYPES.map(type => {
              const count = documents.filter(d => d.type === type.value).length
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border',
                    selectedType === type.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  {type.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Icon name="folder_off" size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="group rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border', getDocColor(doc.type))}>
                    <Icon name={getDocIcon(doc.type)} size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate mb-1">{doc.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{formatDate(doc.uploadedAt)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">by {doc.uploadedBy}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(doc)}
                    className="flex-1 h-7 text-xs"
                  >
                    <Icon name="download" size={12} className="mr-1" />
                    Download
                  </Button>
                  {!readOnly && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(doc.id)}
                      className="h-7 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                    >
                      <Icon name="delete" size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upload Document</CardTitle>
                  <button onClick={() => setShowUploadForm(false)} className="text-slate-400 hover:text-slate-600">
                    <Icon name="close" size={18} />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Document Type</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as ProjectDocument['type'])}
                    className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {DOC_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Select File</label>
                  <input
                    type="file"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onUpload(file, uploadType)
                        setShowUploadForm(false)
                      }
                    }}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
