import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
    Building2, 
    Mail, 
    Phone, 
    User, 
    Briefcase, 
    DollarSign, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    FileText,
    TrendingUp,
    Calendar,
    Star,
    CheckCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface ContractorProfileDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    contractor: {
        id: number
        company_name: string
        license_number: string
        created_at?: string
        updated_at?: string
        user: {
            id: number
            email: string
            first_name: string
            last_name: string
            phone_number: string | null
        }
        average_rating?: number | null
        ratings_count: number
        completed_projects_count: number
        projects: string[]
    } | null
}

export function ContractorProfileDialog({ open, onOpenChange, contractor }: ContractorProfileDialogProps) {
    if (!contractor) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Contractor Profile</DialogTitle>
                    <DialogDescription>
                        View detailed information about {contractor.company_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-blue-600" />
                                <CardTitle>{contractor.company_name}</CardTitle>
                            </div>
                            <CardDescription>Company Details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">License Number</div>
                                    <div className="font-medium">{contractor.license_number}</div>
                                </div>
                                {contractor.created_at && (
                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Member Since</div>
                                        <div className="font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(contractor.created_at), 'MMM dd, yyyy')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Contact Person</div>
                                    <div className="font-medium">
                                        {contractor.user.first_name} {contractor.user.last_name}
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-sm text-muted-foreground">Email</div>
                                    <div className="font-medium">{contractor.user.email}</div>
                                </div>
                            </div>
                            {contractor.user.phone_number && (
                                <>
                                    <Separator />
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <div className="text-sm text-muted-foreground">Phone</div>
                                            <div className="font-medium">{contractor.user.phone_number}</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Rating & Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rating & Performance</CardTitle>
                            <CardDescription>Client ratings and project completion metrics</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {contractor.average_rating ? (
                                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                                            <div className="text-3xl font-bold text-yellow-600">{contractor.average_rating}</div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {contractor.ratings_count} {contractor.ratings_count === 1 ? 'rating' : 'ratings'}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                                        <div className="text-sm text-muted-foreground">No ratings yet</div>
                                    </div>
                                )}
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                        <div className="text-3xl font-bold text-green-600">{contractor.completed_projects_count}</div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Completed {contractor.completed_projects_count === 1 ? 'project' : 'projects'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Projects */}
                    {contractor.projects.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Projects</CardTitle>
                                <CardDescription>Projects this contractor has worked on</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {contractor.projects.map((project, index) => (
                                        <Badge key={index} variant="outline">
                                            {project}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {contractor.projects.length === 0 && (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">This contractor hasn't worked on any projects yet</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

