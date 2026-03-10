import { Icon } from '@/components/ui/material-icon'
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi, builderApi } from '@/services/api'
import { FloorPlanCategory, FloorPlanDataset } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function AdminFloorPlans() {
    const queryClient = useQueryClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState<string>('')

    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryDesc, setNewCategoryDesc] = useState('')
    
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // Fetches
    const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
        queryKey: ['floor-plan-categories'],
        queryFn: async () => {
            const res = await builderApi.getFloorPlanCategories()
            return res.data.results
        }
    })

    const { data: plansData, isLoading: plansLoading } = useQuery({
        queryKey: ['floor-plans'],
        queryFn: async () => {
            const res = await builderApi.getFloorPlans()
            return res.data.results
        }
    })

    // Mutations
    const createCategoryMutation = useMutation({
        mutationFn: (data: Partial<FloorPlanCategory>) => adminApi.createFloorPlanCategory(data),
        onSuccess: () => {
            toast.success("Category created")
            setNewCategoryName('')
            setNewCategoryDesc('')
            queryClient.invalidateQueries({ queryKey: ['floor-plan-categories'] })
        },
        onError: () => toast.error("Failed to create category")
    })

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: number) => adminApi.deleteFloorPlanCategory(id),
        onSuccess: () => {
            toast.success("Category deleted")
            queryClient.invalidateQueries({ queryKey: ['floor-plan-categories'] })
        },
        onError: () => toast.error("Failed to delete category")
    })

    const createPlanMutation = useMutation({
        mutationFn: (formData: FormData) => adminApi.createFloorPlan(formData),
        onSuccess: () => {
            toast.success("Floor plan uploaded successfully")
            setSelectedFile(null)
            setTitle('')
            setDescription('')
            setCategoryId('')
            if (fileInputRef.current) fileInputRef.current.value = ''
            queryClient.invalidateQueries({ queryKey: ['floor-plans'] })
        },
        onError: () => toast.error("Failed to upload floor plan")
    })

    const deletePlanMutation = useMutation({
        mutationFn: (id: number) => adminApi.deleteFloorPlan(id),
        onSuccess: () => {
            toast.success("Floor plan deleted")
            queryClient.invalidateQueries({ queryKey: ['floor-plans'] })
        },
        onError: () => toast.error("Failed to delete floor plan")
    })

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile || !title || !categoryId) {
            toast.error("Please fill in all required fields and select an image")
            return
        }

        const formData = new FormData()
        formData.append('title', title)
        formData.append('description', description)
        formData.append('category', categoryId)
        formData.append('image', selectedFile)

        createPlanMutation.mutate(formData)
    }

    const handleCreateCategory = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCategoryName.trim()) return
        createCategoryMutation.mutate({ name: newCategoryName, description: newCategoryDesc })
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Icon name="layout_grid" className="h-5 w-5 text-violet-600" />
                    </div>
                    Floor Plan Datasets
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 ml-[46px]">
                    Upload and organize 2D floor plans for the Builder discovery library.
                </p>
            </div>

            {/* Upload + Categories Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upload Form */}
                <Card className="lg:col-span-2 shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Icon name="upload_cloud" className="h-4 w-4 text-violet-500" />
                            Upload Floor Plan
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Add a new 2D floor plan image with metadata.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Title *</label>
                                    <Input
                                        placeholder="E.g., 3-Bedroom Contemporary House"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-9 text-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Category *</label>
                                    <Select value={categoryId} onValueChange={setCategoryId} required>
                                        <SelectTrigger className="h-9 text-sm">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoriesData?.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                            {categoriesData?.length === 0 && (
                                                <SelectItem value="none" disabled>No categories available</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Description</label>
                                <Textarea
                                    placeholder="Add details about dimensions, rooms, or suitable plot sizes..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                    className="text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Floor Plan Image *</label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        className="flex-1 text-sm h-9"
                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                                {selectedFile && (
                                    <Badge variant="secondary" className="px-2.5 py-0.5 text-xs">
                                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </Badge>
                                )}
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-9 text-sm bg-violet-600 hover:bg-violet-700 shadow-sm"
                                disabled={createPlanMutation.isPending}
                            >
                                {createPlanMutation.isPending ? (
                                    <><Icon name="progress_activity" className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                                ) : (
                                    <><Icon name="upload_cloud" className="mr-2 h-4 w-4" /> Save Floor Plan</>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Categories Management */}
                <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Icon name="folder_open" className="h-4 w-4 text-amber-500" />
                            Categories
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Organize floor plans by type.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleCreateCategory} className="space-y-2.5">
                            <Input
                                placeholder="New category name..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="h-9 text-sm"
                                required
                            />
                            <Button 
                                type="submit" 
                                variant="secondary" 
                                className="w-full h-8 text-xs"
                                disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                            >
                                <Icon name="add" className="h-3.5 w-3.5 mr-1.5" />
                                Add Category
                            </Button>
                        </form>

                        <div className="pt-2 border-t">
                            <p className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider mb-2">Existing</p>
                            {categoriesLoading ? (
                                <div className="text-xs text-muted-foreground flex items-center gap-2 py-3 justify-center">
                                    <Icon name="progress_activity" className="h-3 w-3 animate-spin"/>
                                    Loading...
                                </div>
                            ) : categoriesData?.length === 0 ? (
                                <p className="text-xs text-muted-foreground py-3 text-center">No categories yet.</p>
                            ) : (
                                <ul className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                                    {categoriesData?.map(category => (
                                        <li key={category.id} className="group flex items-center justify-between text-sm bg-muted/40 hover:bg-muted/60 p-2.5 rounded-lg transition-colors">
                                            <span className="text-xs font-medium truncate">{category.name}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                                onClick={() => deleteCategoryMutation.mutate(category.id)}
                                                disabled={deleteCategoryMutation.isPending}
                                            >
                                                <Icon name="delete" className="h-3 w-3" />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Datasets Gallery */}
            <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Icon name="image" className="h-4 w-4 text-blue-500" />
                                Uploaded Datasets
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {plansData?.length || 0} floor plan{(plansData?.length || 0) !== 1 ? 's' : ''} in the library
                            </CardDescription>
                        </div>
                        {(plansData?.length || 0) > 0 && (
                            <Badge variant="secondary" className="text-xs font-medium">
                                {plansData?.length} item{(plansData?.length || 0) !== 1 ? 's' : ''}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {plansLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Icon name="progress_activity" className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : !plansData || plansData.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed border-border/60">
                            <div className="h-14 w-14 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                <Icon name="image" className="h-7 w-7 text-muted-foreground/30" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No floor plans uploaded yet</p>
                            <p className="text-xs text-muted-foreground/70 mt-1">Create a category and upload an image above to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {plansData.map(plan => (
                                <div key={plan.id} className="group rounded-xl border border-border/60 overflow-hidden bg-card hover:shadow-md hover:border-border transition-all duration-300">
                                    <div 
                                        className="aspect-[4/3] relative bg-muted/30 overflow-hidden cursor-zoom-in"
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            if(plan.image) setPreviewImage(plan.image);
                                        }}
                                    >
                                        {plan.image ? (
                                            <img 
                                                src={plan.image} 
                                                alt={plan.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <Icon name="image" className="h-8 w-8 opacity-20" />
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                        
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <div className="text-white flex flex-col items-center gap-1.5 translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                                                <Icon name="maximize2" className="h-5 w-5" />
                                                <span className="text-[10px] font-medium drop-shadow">Right-click to enlarge</span>
                                            </div>
                                        </div>
                                        
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-background/85 backdrop-blur-sm text-foreground hover:bg-background/90 shadow-sm border border-border/50 text-[10px] font-medium">
                                                {plan.category_name}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="p-3.5">
                                        <h4 className="font-semibold text-sm line-clamp-1 mb-0.5" title={plan.title}>{plan.title}</h4>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug mb-3">
                                            {plan.description || "No description provided."}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-2.5 border-t border-border/40">
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {new Date(plan.created_at).toLocaleDateString()}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
                                                onClick={() => deletePlanMutation.mutate(plan.id)}
                                                disabled={deletePlanMutation.isPending}
                                            >
                                                <Icon name="delete" className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Preview Dialog */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-5xl w-full p-1 bg-transparent border-0 shadow-none overflow-hidden [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 [&>button]:hover:bg-black/80">
                    <div className="relative w-full h-[85vh] flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
                        {previewImage && (
                            <img 
                                src={previewImage} 
                                alt="Floor Plan Preview" 
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
