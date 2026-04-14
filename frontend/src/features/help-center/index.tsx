import { Icon } from '@/components/ui/material-icon'
import { Loading } from '@/components/ui/loading'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { helpCenterApi } from '@/services/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'

// Map category icons to Material icon names
const iconMap: Record<string, string> = {
    Rocket: 'rocket',
    Construction: 'construction',
    CreditCard: 'credit_card',
    Users: 'group',
    Settings: 'settings',
    HelpCircle: 'help',
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
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className="space-y-6 w-full p-3 sm:p-4 md:p-8 min-h-screen bg-slate-50">
            {/* Page Header Command Center Style */}
            <div className="rounded-2xl bg-white p-5 sm:p-6 md:p-8 text-slate-900 relative shadow-sm border border-slate-200 overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-100/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                                <Icon name="help" size={24} className="text-slate-700" />
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 font-display">Command Center Support</h1>
                        </div>
                        <p className="text-sm font-medium text-slate-500 ml-13">
                            Knowledge base, FAQs, and priority support for Aspirational Builders.
                        </p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <Icon name="search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                    placeholder="Search the knowledge base..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-sm font-medium border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-slate-400 shadow-none"
                />
            </div>

            {/* Featured Articles */}
            {featured.length > 0 && !searchQuery && !selectedCategory && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="star" size={20} className="text-amber-500" />
                        <h2 className="text-lg font-black tracking-tight text-slate-900 font-display">Featured Articles</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featured.map((article) => {
                            const iconName = iconMap[article.category_name] || 'menu_book'
                            return (
                                <Card 
                                    key={article.id} 
                                    className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden hover:border-slate-300 transition-colors cursor-pointer group flex flex-col"
                                    onClick={() => setSelectedArticle(article)}
                                >
                                    <CardHeader className="flex-1 pb-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="h-10 w-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg">
                                                <Icon name={iconName} size={20} className="text-slate-700" />
                                            </div>
                                            <Badge className="bg-slate-900 text-white border-slate-900 text-[10px] uppercase font-bold tracking-wider rounded-lg px-2 shrink-0 shadow-none">Featured</Badge>
                                        </div>
                                        <CardTitle className="text-base font-bold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors">{article.title}</CardTitle>
                                        {article.excerpt && (
                                            <CardDescription className="text-xs text-slate-500 mt-2 line-clamp-2">
                                                {article.excerpt}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <div className="px-6 pb-6 pt-0 mt-auto">
                                        <Button 
                                            variant="outline" 
                                            className="w-full h-9 rounded-xl border-slate-200 bg-white group-hover:bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-700 transition-all shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedArticle(article)
                                            }}
                                        >
                                            Read more
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* FAQs Section */}
            {(!searchQuery || filteredFAQs.length > 0) && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Icon name="chat" size={20} className="text-slate-600" />
                        <h2 className="text-lg font-black tracking-tight text-slate-900 font-display">Frequently Asked Questions</h2>
                    </div>
                    {filteredFAQs.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <Icon name="help_outline" size={48} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-sm font-medium text-slate-900">No FAQs found.</p>
                            <p className="text-xs text-slate-500">Try adjusting your search query.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                            {filteredFAQs.map((faq) => {
                                const isExpanded = expandedFAQs.has(faq.id)
                                return (
                                    <Collapsible
                                        key={faq.id}
                                        open={isExpanded}
                                        onOpenChange={() => toggleFAQ(faq.id)}
                                        className="group"
                                    >
                                        <CollapsibleTrigger className="w-full">
                                            <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left">
                                                <h3 className="font-bold text-sm sm:text-base text-slate-900 pr-4">
                                                    {faq.question}
                                                </h3>
                                                <div className="shrink-0 h-8 w-8 rounded-full bg-slate-50 group-hover:bg-white border border-slate-200 flex items-center justify-center transition-all">
                                                    <Icon name={isExpanded ? "remove" : "add"} size={16} className="text-slate-600" />
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="px-5 pb-5 pt-0 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Categories */}
            <div className="space-y-6">
                <div className="flex items-center justify-between mt-4">
                    <h2 className="text-lg font-black tracking-tight text-slate-900 font-display">
                        {selectedCategory 
                            ? categories.find(c => c.slug === selectedCategory)?.name || 'Category'
                            : 'Browse by Category'
                        }
                    </h2>
                    {selectedCategory && (
                        <Button 
                            variant="outline" 
                            onClick={() => setSelectedCategory(null)}
                            className="h-8 rounded-lg px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 border-slate-200 hover:bg-slate-50 transition-all"
                        >
                            <Icon name="close" size={14} className="mr-1.5" />
                            Clear filter
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <Loading fullPage text="Finding answers..." />
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                        <Icon name="help_outline" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No articles found matching your search.</p>
                    </div>
                ) : (
                    filteredCategories.map((category) => {
                        const iconName = iconMap[category.icon || ''] || 'help'
                        return (
                            <div key={category.id} className="space-y-4">
                                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100 bg-slate-50/50 p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <Icon name={iconName} size={20} className="text-slate-700" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-bold text-slate-900">{category.name}</CardTitle>
                                                {category.description && (
                                                    <CardDescription className="text-xs font-medium mt-0.5">
                                                        {category.description}
                                                    </CardDescription>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <div className="p-0 divide-y divide-slate-100">
                                        {category.articles.map((article) => (
                                            <div
                                                key={article.id}
                                                className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                                                onClick={() => setSelectedArticle(article)}
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors truncate">{article.title}</h3>
                                                    {article.excerpt && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{article.excerpt}</p>
                                                    )}
                                                </div>
                                                <div className="shrink-0 h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center transition-all group-hover:bg-white">
                                                    <Icon name="arrow_forward" size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Article Detail Dialog */}
            <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
                    {selectedArticle && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-4">
                                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                        {selectedArticle.category_name}
                                    </Badge>
                                    {selectedArticle.is_featured && (
                                        <Badge className="bg-slate-900 text-white border-slate-900 text-[10px] uppercase font-bold tracking-wider rounded-lg px-2 shrink-0 shadow-none">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                                <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">{selectedArticle.title}</DialogTitle>
                                {selectedArticle.excerpt && (
                                    <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
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
            </Main>
        </>
    )
}

