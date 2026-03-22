import { Icon } from '@/components/ui/material-icon'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { KnowledgeBase } from './components/knowledge-base'

export function AdminKnowledgeBase() {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Icon name="menu_book" className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-display tracking-tight text-foreground">
                        AI Knowledge Base
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Upload and manage training documents for the AI assistant.
                    </p>
                </div>
            </div>

            <Card className="border-border/60 bg-card shadow-sm min-h-[500px]">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                        <div className="h-6 w-6 rounded-md bg-purple-50 flex items-center justify-center">
                            <Icon name="description" className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        Document Management
                    </CardTitle>
                    <CardDescription className="text-xs">Manage your vector database embeddings.</CardDescription>
                </CardHeader>
                <CardContent>
                    <KnowledgeBase />
                </CardContent>
            </Card>
        </div>
    )
}
