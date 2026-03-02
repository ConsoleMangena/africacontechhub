import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { builderApi } from '@/services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Image as ImageIcon, Loader2, Maximize2 } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export function BuilderFloorPlans() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    // Fetches
    const { data: categoriesData } = useQuery({
        queryKey: ['floor-plan-categories'],
        queryFn: async () => {
            const res = await builderApi.getFloorPlanCategories()
            return res.data.results
        }
    })

    const { data: plansData, isLoading: plansLoading } = useQuery({
        queryKey: ['floor-plans', { category: selectedCategory !== 'all' ? selectedCategory : undefined, search: searchQuery }],
        queryFn: async () => {
            const params: any = {}
            // Send query params if they're active
            if (selectedCategory !== 'all') params.category = selectedCategory
            if (searchQuery.trim()) params.search = searchQuery

            const res = await builderApi.getFloorPlans(params)
            return res.data.results
        }
    })

    // Fallback UI Filtering just in case the backend DB doesn't support complex querying yet
    // This allows real-time fuzzy filtering on the frontend without thrashing the API for every keystroke
    const filteredPlans = plansData?.filter(plan => {
        const matchesCategory = selectedCategory === 'all' || plan.category.toString() === selectedCategory;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery.trim() || 
            plan.title.toLowerCase().includes(searchLower) || 
            (plan.description && plan.description.toLowerCase().includes(searchLower));
        
        return matchesCategory && matchesSearch;
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Floor Plan Library</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Discover 2D structural datasets to inspire your next architectural project.
                    </p>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search open floor plans, modern layouts..."
                        className="pl-9 w-full bg-background/50 border-input/60 shadow-sm transition-all focus-within:bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-[250px]">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="bg-background/50 border-input/60 shadow-sm">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categoriesData?.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Library Grid Phase */}
            {plansLoading ? (
                 <div className="flex items-center justify-center py-20">
                     <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-medium">Loading architectural plans...</span>
                     </div>
                 </div>
            ) : filteredPlans.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed border-border/60">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <h4 className="text-base font-medium">No Floor Plans Found</h4>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                        Try adjusting your search criteria or changing the category filter.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlans.map(plan => (
                        <Card key={plan.id} className="overflow-hidden group flex flex-col shadow-sm border-border/60 hover:shadow-md hover:border-border/80 transition-all duration-300">
                            <div 
                                className="aspect-[4/3] relative bg-muted/50 overflow-hidden cursor-zoom-in"
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
                                        <ImageIcon className="h-8 w-8 opacity-20" />
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <div className="text-white flex flex-col items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Maximize2 className="h-6 w-6" />
                                        <span className="text-xs font-medium drop-shadow-md">Right-click to enlarge</span>
                                    </div>
                                </div>

                                <div className="absolute top-3 right-3">
                                    <Badge className="bg-background/90 backdrop-blur-md text-foreground hover:bg-background/90 shadow-sm border border-border/50 text-xs font-medium">
                                        {plan.category_name}
                                    </Badge>
                                </div>
                            </div>
                            <CardContent className="p-5 flex-1 flex flex-col pt-4">
                                <h4 className="font-semibold text-base line-clamp-1 mb-1.5" title={plan.title}>{plan.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-4 leading-relaxed tracking-tight">{plan.description || "No specific details provided for this blueprint layout."}</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <span className="text-[10px] font-semibold text-primary">{plan.uploaded_by_name ? plan.uploaded_by_name.charAt(0).toUpperCase() : 'A'}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {plan.uploaded_by_name || 'Admin'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase text-muted-foreground/80 font-semibold tracking-wider">
                                        {new Date(plan.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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
