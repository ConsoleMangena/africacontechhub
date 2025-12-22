import { useBuilderConnections, useAllContractors } from '../hooks/use-builder-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Mail, Phone, User, Briefcase, DollarSign, CheckCircle2, Clock, XCircle, FileText, TrendingUp, Eye, Grid3x3, List, Star, CheckCircle } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ContractorProfileDialog } from './contractor-profile-dialog'
import { cn } from '@/lib/utils'

export function ContractorsView() {
    const { data: connectionsData, isLoading: connectionsLoading, error: connectionsError } = useBuilderConnections()
    const { data: allContractorsData, isLoading: allContractorsLoading, error: allContractorsError } = useAllContractors()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedContractor, setSelectedContractor] = useState<any>(null)
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Use connected contractors if available, otherwise use all contractors
    const hasConnections = connectionsData && connectionsData.contractors && connectionsData.contractors.length > 0
    const contractors = hasConnections 
        ? (connectionsData?.contractors || [])
        : (allContractorsData?.contractors || [])
    
    const isLoading = hasConnections ? connectionsLoading : allContractorsLoading
    const error = hasConnections ? connectionsError : allContractorsError

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Contractors</CardTitle>
                    <CardDescription>Loading contractors...</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Contractors</CardTitle>
                    <CardDescription>Failed to load contractors. Please try again later.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    // Filter contractors based on search query
    const filteredContractors = contractors.filter((contractor) => {
        const query = searchQuery.toLowerCase()
        return (
            contractor.company_name.toLowerCase().includes(query) ||
            contractor.user.first_name.toLowerCase().includes(query) ||
            contractor.user.last_name.toLowerCase().includes(query) ||
            contractor.user.email.toLowerCase().includes(query) ||
            contractor.license_number.toLowerCase().includes(query) ||
            contractor.projects.some((project) => project.toLowerCase().includes(query))
        )
    })

    const handleViewProfile = (contractor: any) => {
        setSelectedContractor(contractor)
        setIsProfileDialogOpen(true)
    }

    if (contractors.length === 0 && !isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Contractors</h3>
                    <p className="text-sm text-gray-600">
                        No contractors available in the system. Please contact an administrator.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Contractors</h3>
                    <p className="text-sm text-gray-600">
                        {hasConnections 
                            ? 'View and manage contractors who have submitted bids on your projects'
                            : 'Browse all available contractors in the system'
                        }
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {contractors.length} {contractors.length === 1 ? 'Contractor' : 'Contractors'}
                </Badge>
            </div>

            {/* Search and View Toggle */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search contractors by name, company, email, or project..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center border rounded-md p-1 bg-background">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "h-8 px-3",
                            viewMode === 'grid' && "bg-primary text-primary-foreground"
                        )}
                        aria-label="Grid view"
                    >
                        <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "h-8 px-3",
                            viewMode === 'list' && "bg-primary text-primary-foreground"
                        )}
                        aria-label="List view"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Results Count */}
            {searchQuery && (
                <div className="text-sm text-gray-600">
                    Showing {filteredContractors.length} of {contractors.length} contractors
                </div>
            )}

            {/* Contractors List */}
            {filteredContractors.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-gray-600">No contractors match your search criteria</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredContractors.map((contractor) => (
                        <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                            <CardTitle className="text-lg">{contractor.company_name}</CardTitle>
                                        </div>
                                        <CardDescription className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span>
                                                {contractor.user.first_name} {contractor.user.last_name}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    {contractor.average_rating && (
                                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                                            <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                                            {contractor.average_rating}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Contact Information */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="h-3 w-3" />
                                        <span className="truncate">{contractor.user.email}</span>
                                    </div>
                                    {contractor.user.phone_number && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="h-3 w-3" />
                                            <span>{contractor.user.phone_number}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t">
                                        <div className="text-gray-700 mb-1">
                                            <span className="font-medium">License:</span> {contractor.license_number}
                                        </div>
                                    </div>
                                </div>

                                {/* Rating and Completed Projects */}
                                <div className="pt-2 border-t space-y-3">
                                    {contractor.average_rating && (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                <span className="text-sm font-semibold">{contractor.average_rating}</span>
                                                <span className="text-xs text-gray-600">
                                                    ({contractor.ratings_count} {contractor.ratings_count === 1 ? 'rating' : 'ratings'})
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <span className="text-gray-700">
                                            <span className="font-medium">{contractor.completed_projects_count}</span> completed {contractor.completed_projects_count === 1 ? 'project' : 'projects'}
                                        </span>
                                    </div>
                                </div>

                                {/* Projects */}
                                {contractor.projects.length > 0 && (
                                    <div className="pt-2 border-t">
                                        <div className="text-xs text-gray-700 mb-2 font-medium">Projects ({contractor.projects.length}):</div>
                                        <div className="flex flex-wrap gap-1">
                                            {contractor.projects.map((project, index) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {project}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Created Date */}
                                {contractor.created_at && (
                                    <div className="pt-2 border-t text-xs text-gray-600">
                                        <span className="font-medium">Joined:</span> {format(new Date(contractor.created_at), 'MMM dd, yyyy')}
                                    </div>
                                )}

                                {/* View Profile Button */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4"
                                    onClick={() => handleViewProfile(contractor)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredContractors.map((contractor) => (
                        <Card key={contractor.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-6">
                                    {/* Left Section - Main Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <Briefcase className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <CardTitle className="text-lg">{contractor.company_name}</CardTitle>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        {contractor.bids_count} {contractor.bids_count === 1 ? 'Bid' : 'Bids'}
                                                    </Badge>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <User className="h-4 w-4" />
                                                        <span>{contractor.user.first_name} {contractor.user.last_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="h-4 w-4" />
                                                        <span className="truncate">{contractor.user.email}</span>
                                                    </div>
                                                    {contractor.user.phone_number && (
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <Phone className="h-4 w-4" />
                                                            <span>{contractor.user.phone_number}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <FileText className="h-4 w-4" />
                                                        <span>License: {contractor.license_number}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section - Rating & Completed Projects */}
                                    <div className="hidden lg:flex flex-col gap-4 min-w-[200px]">
                                        {contractor.average_rating && (
                                            <div className="space-y-2">
                                                <div className="text-xs font-medium text-muted-foreground">Rating</div>
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                    <div>
                                                        <div className="text-lg font-semibold">{contractor.average_rating}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {contractor.ratings_count} {contractor.ratings_count === 1 ? 'rating' : 'ratings'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2 pt-2 border-t">
                                            <div className="text-xs font-medium text-muted-foreground">Completed Projects</div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <div className="text-lg font-semibold">{contractor.completed_projects_count}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Projects & Actions */}
                                    <div className="flex flex-col gap-4 min-w-[200px]">
                                        {contractor.projects.length > 0 && (
                                            <div>
                                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                                    Projects ({contractor.projects.length})
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {contractor.projects.slice(0, 3).map((project, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {project}
                                                        </Badge>
                                                    ))}
                                                    {contractor.projects.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{contractor.projects.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {contractor.created_at && (
                                            <div className="text-xs text-muted-foreground">
                                                Joined: {format(new Date(contractor.created_at), 'MMM dd, yyyy')}
                                            </div>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewProfile(contractor)}
                                            className="w-full"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Profile
                                        </Button>
                                    </div>
                                </div>

                                {/* Mobile Statistics - Shown on smaller screens */}
                                <div className="lg:hidden mt-4 pt-4 border-t">
                                    <div className="space-y-3">
                                        {contractor.average_rating && (
                                            <div>
                                                <div className="text-xs font-medium text-muted-foreground mb-2">Rating</div>
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-semibold">{contractor.average_rating}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({contractor.ratings_count} {contractor.ratings_count === 1 ? 'rating' : 'ratings'})
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between text-sm pt-2 border-t">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                Completed Projects:
                                            </span>
                                            <span className="font-semibold">{contractor.completed_projects_count}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Contractor Profile Dialog */}
            {selectedContractor && (
                <ContractorProfileDialog
                    open={isProfileDialogOpen}
                    onOpenChange={setIsProfileDialogOpen}
                    contractor={selectedContractor}
                />
            )}
        </div>
    )
}

