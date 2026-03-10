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
            <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Icon name="book_open" className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold font-display tracking-tight text-foreground">
                        AI Knowledge Base
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Upload and manage training documents for the AI assistant.
                    </p>
                </div>
            </div>

            <Card className="border-border/60 bg-card min-h-[500px]">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold font-display flex items-center gap-2 text-foreground">
                        <Icon name="book_open" className="h-4 w-4 text-purple-600" />
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
