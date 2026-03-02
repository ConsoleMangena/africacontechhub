import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileUp, Trash2, Cpu, CheckCircle2, Loader2, Save, Brain, Upload, FileText, Eye } from 'lucide-react'
import { adminApi, aiApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from 'sonner'

export function KnowledgeBase() {
    const [documents, setDocuments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    
    const [instructions, setInstructions] = useState("")
    const [isSavingInstructions, setIsSavingInstructions] = useState(false)

    // Preview state
    const [previewDoc, setPreviewDoc] = useState<{title: string, content: string} | null>(null)
    const [isPreviewLoading, setIsPreviewLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [docsRes, instRes] = await Promise.all([
                adminApi.getDocuments(),
                adminApi.getInstructions()
            ]);
            setDocuments(docsRes.data)
            setInstructions(instRes.data.instruction_text)
        } catch (error) {
            console.error("Failed to fetch knowledge base data", error)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchDocuments = async () => {
        try {
            const res = await adminApi.getDocuments()
            setDocuments(res.data)
        } catch (error) {
            console.error("Failed to fetch documents", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpload = async (file: File) => {
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            await adminApi.uploadDocument(formData)
            await fetchDocuments()
        } catch (error) {
            console.error('Upload failed', error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this document from the AI memory?")) {
            try {
                await adminApi.deleteDocument(id)
                fetchDocuments()
                toast.success("Document deleted")
            } catch (error) {
                console.error("Deletion failed", error)
                toast.error("Failed to delete document")
            }
        }
    }

    const handlePreview = async (id: number) => {
        setIsPreviewLoading(true)
        try {
            const res = await adminApi.getDocumentDetail(id)
            setPreviewDoc({ title: res.data.title, content: res.data.content })
        } catch (error) {
            console.error("Failed to fetch document preview", error)
            toast.error("Failed to load document content")
        } finally {
            setIsPreviewLoading(false)
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleUpload(e.target.files[0])
        }
    }

    const handleSaveInstructions = async () => {
        setIsSavingInstructions(true)
        try {
            await adminApi.updateInstructions(instructions)
        } catch (error) {
            console.error("Failed to save instructions", error)
        } finally {
            setIsSavingInstructions(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    Knowledge Base
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 ml-[46px]">
                    Manage AI behavior instructions and embedded reference documents.
                </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Left: AI Instructions - Takes 3/5 */}
                <Card className="lg:col-span-3 shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-indigo-500" />
                                    AI Behavior Instructions
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                    Customize the system prompt to guide how the AI assistant responds.
                                </CardDescription>
                            </div>
                            <Button 
                                size="sm" 
                                onClick={handleSaveInstructions} 
                                disabled={isSavingInstructions || isLoading}
                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                            >
                                {isSavingInstructions ? (
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                    <Save className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Save
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-32 w-full bg-muted/30 animate-pulse rounded-md border border-border/60"></div>
                        ) : (
                            <Textarea 
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Enter the AI system prompt..."
                                className="min-h-[180px] text-sm resize-y bg-muted/20 border-border/60 focus-visible:ring-indigo-500/30 font-mono leading-relaxed"
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Right: Upload Area - Takes 2/5 */}
                <Card className="lg:col-span-2 shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Upload className="h-4 w-4 text-emerald-500" />
                            Upload Documents
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Drop files to vector-embed for AI reference.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                                dragActive 
                                    ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]' 
                                    : 'border-border/80 hover:border-indigo-300 hover:bg-muted/20'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center ring-1 ring-indigo-100">
                                    <FileUp className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">PDF or TXT, up to 10MB</p>
                                </div>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        accept=".pdf,.txt"
                                        disabled={isUploading}
                                    />
                                    <Button variant="outline" size="sm" disabled={isUploading} className="text-xs h-8 px-4 shadow-sm">
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                                Embedding...
                                            </>
                                        ) : 'Browse Files'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Embedded Documents */}
            <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-green-500" />
                                Embedded Documents
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {documents.length} document{documents.length !== 1 ? 's' : ''} in AI memory
                            </CardDescription>
                        </div>
                        {documents.length > 0 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                                {documents.length} file{documents.length !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-border/60">
                            <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                <Cpu className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Upload PDF or TXT files to add them to the AI memory.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {documents.map(doc => (
                                <div key={doc.id} className="group flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/30 hover:border-border transition-all duration-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 ring-1 ring-green-100">
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                                            <p className="text-[11px] text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 h-7 w-7" 
                                            onClick={() => handlePreview(doc.id)}
                                            disabled={isPreviewLoading}
                                            title="View extracted content"
                                        >
                                            {isPreviewLoading && previewDoc?.title === doc.title ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Eye className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 h-7 w-7" 
                                            onClick={() => handleDelete(doc.id)}
                                            title="Delete document"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Document Content Preview Dialog */}
            <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
                <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 py-4 border-b bg-muted/30 shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            {previewDoc?.title}
                        </DialogTitle>
                        <DialogDescription>
                            This is the exact text the AI model extracted and learned from this document.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden relative">
                        <ScrollArea className="h-full w-full p-6 bg-white absolute inset-0">
                            <div className="prose prose-sm max-w-none prose-slate">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed bg-transparent p-0 border-0">
                                    {previewDoc?.content}
                                </pre>
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
