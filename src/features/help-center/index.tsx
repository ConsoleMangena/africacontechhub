import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { helpCenterApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
    Search, 
    HelpCircle, 
    Rocket, 
    Construction, 
    CreditCard, 
    Users, 
    Settings,
    ChevronRight,
    BookOpen,
    Star,
    MessageCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const iconMap: Record<string, any> = {
    Rocket,
    Construction,
    CreditCard,
    Users,
    Settings,
    HelpCircle,
}

export function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedArticle, setSelectedArticle] = useState<any | null>(null)
    const [expandedFAQs, setExpandedFAQs] = useState<Set<number>>(new Set())

    const { data: categoriesData, isLoading } = useQuery({
        queryKey: ['help-center-categories'],
        queryFn: async () => {
            const response = await helpCenterApi.getCategories()
            return response.data
        },
    })

    const { data: featuredArticles } = useQuery({
        queryKey: ['help-center-featured'],
        queryFn: async () => {
            const response = await helpCenterApi.getArticles({ featured: true })
            return response.data
        },
    })

    const { data: faqsData } = useQuery({
        queryKey: ['help-center-faqs', selectedCategory],
        queryFn: async () => {
            const response = await helpCenterApi.getFAQs(
                selectedCategory ? { category: selectedCategory } : undefined
            )
            return response.data
        },
    })

    const faqs = faqsData?.faqs || []

    // Filter FAQs based on search
    const filteredFAQs = faqs.filter(faq => {
        if (!searchQuery) return true
        const query = searchQuery.toLowerCase()
        return faq.question.toLowerCase().includes(query) || 
               faq.answer.toLowerCase().includes(query)
    })

    const toggleFAQ = (faqId: number) => {
        setExpandedFAQs(prev => {
            const newSet = new Set(prev)
            if (newSet.has(faqId)) {
                newSet.delete(faqId)
            } else {
                newSet.add(faqId)
            }
            return newSet
        })
    }

    const categories = categoriesData?.categories || []
    const featured = featuredArticles?.articles || []

    // Filter articles based on search and category
    const filteredCategories = categories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article => {
            const matchesSearch = !searchQuery || 
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.content.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = !selectedCategory || cat.slug === selectedCategory
            return matchesSearch && matchesCategory
        })
    })).filter(cat => cat.articles.length > 0 || !searchQuery)

    return (
        <div className="space-y-6 w-full p-6 md:p-8 min-h-screen bg-gray-50">
            {/* Header */}
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
                    <p className="text-gray-600 mt-2">Find answers to common questions and learn how to use DzeNhare SQB</p>
                </div>

                {/* Search */}
                <div className="relative max-w-2xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        placeholder="Search for help articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
            </div>

            {/* Featured Articles */}
            {featured.length > 0 && !searchQuery && !selectedCategory && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-semibold text-gray-900">Featured Articles</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featured.map((article) => {
                            const Icon = iconMap[article.category_name] || BookOpen
                            return (
                                <Card 
                                    key={article.id} 
                                    className="hover:shadow-lg transition-shadow cursor-pointer border-gray-200"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="p-2 rounded-lg bg-green-100">
                                                <Icon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Featured</Badge>
                                        </div>
                                        <CardTitle className="text-lg mt-4">{article.title}</CardTitle>
                                        {article.excerpt && (
                                            <CardDescription className="text-gray-600 mt-2">
                                                {article.excerpt}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-between text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedArticle(article)
                                            }}
                                        >
                                            Read more
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* FAQs Section */}
            {(!searchQuery || filteredFAQs.length > 0) && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No FAQs found matching your search.</p>
                        </div>
                    ) : (
                        <Card className="border-gray-200">
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    {filteredFAQs.map((faq) => {
                                        const isExpanded = expandedFAQs.has(faq.id)
                                        return (
                                            <Collapsible
                                                key={faq.id}
                                                open={isExpanded}
                                                onOpenChange={() => toggleFAQ(faq.id)}
                                            >
                                                <CollapsibleTrigger className="w-full">
                                                    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                                                        <h3 className="font-medium text-gray-900 text-left pr-4">
                                                            {faq.question}
                                                        </h3>
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                        )}
                                                    </div>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <div className="px-4 pb-4 pt-2 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </CollapsibleContent>
                                            </Collapsible>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Categories */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {selectedCategory 
                            ? categories.find(c => c.slug === selectedCategory)?.name || 'Category'
                            : 'Browse by Category'
                        }
                    </h2>
                    {selectedCategory && (
                        <Button 
                            variant="outline" 
                            onClick={() => setSelectedCategory(null)}
                            className="text-gray-600"
                        >
                            Clear filter
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-12 text-gray-600">Loading help center...</div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No articles found matching your search.</p>
                    </div>
                ) : (
                    filteredCategories.map((category) => {
                        const Icon = iconMap[category.icon || ''] || HelpCircle
                        return (
                            <div key={category.id} className="space-y-4">
                                <Card className="border-gray-200">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-green-100">
                                                <Icon className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{category.name}</CardTitle>
                                                {category.description && (
                                                    <CardDescription className="text-gray-600 mt-1">
                                                        {category.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {category.articles.map((article) => (
                                                <div
                                                    key={article.id}
                                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100"
                                                    onClick={() => setSelectedArticle(article)}
                                                >
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">{article.title}</h3>
                                                        {article.excerpt && (
                                                            <p className="text-sm text-gray-600 mt-1">{article.excerpt}</p>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Article Detail Dialog */}
            <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    {selectedArticle && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-gray-700">
                                        {selectedArticle.category_name}
                                    </Badge>
                                    {selectedArticle.is_featured && (
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
                                {selectedArticle.excerpt && (
                                    <DialogDescription className="text-gray-600 mt-2">
                                        {selectedArticle.excerpt}
                                    </DialogDescription>
                                )}
                            </DialogHeader>
                            <div className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {selectedArticle.content.split('\n').map((line: string, idx: number) => {
                                    if (line.startsWith('# ')) {
                                        return <h1 key={idx} className="text-2xl font-bold mt-6 mb-4 text-gray-900">{line.substring(2)}</h1>
                                    }
                                    if (line.startsWith('## ')) {
                                        return <h2 key={idx} className="text-xl font-semibold mt-5 mb-3 text-gray-900">{line.substring(3)}</h2>
                                    }
                                    if (line.startsWith('### ')) {
                                        return <h3 key={idx} className="text-lg font-semibold mt-4 mb-2 text-gray-900">{line.substring(4)}</h3>
                                    }
                                    if (line.startsWith('- ')) {
                                        return <li key={idx} className="ml-4 list-disc">{line.substring(2)}</li>
                                    }
                                    if (line.trim() === '') {
                                        return <br key={idx} />
                                    }
                                    return <p key={idx} className="mb-3">{line}</p>
                                })}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}

