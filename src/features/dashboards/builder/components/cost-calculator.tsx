import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Calculator, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CostItem {
    id: string
    name: string
    category: string
    quantity: number
    unit: string
    unitPrice: number
}

interface CostCalculatorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectBudget: number
}

const CATEGORIES = [
    'Foundation & Sitework',
    'Walls & Structure',
    'Roofing',
    'Electrical',
    'Plumbing',
    'Finishes',
    'Other'
]

const UNITS = [
    'pcs',
    'm²',
    'm³',
    'm',
    'kg',
    'bags',
    'boxes',
    'tons'
]

export function CostCalculator({ open, onOpenChange, projectBudget }: CostCalculatorProps) {
    const [items, setItems] = useState<CostItem[]>([])
    const [newItem, setNewItem] = useState<Partial<CostItem>>({
        name: '',
        category: CATEGORIES[0],
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0
    })

    const addItem = () => {
        if (!newItem.name || !newItem.unitPrice || !newItem.quantity) {
            return
        }

        const item: CostItem = {
            id: Date.now().toString(),
            name: newItem.name,
            category: newItem.category || CATEGORIES[0],
            quantity: newItem.quantity || 1,
            unit: newItem.unit || 'pcs',
            unitPrice: newItem.unitPrice || 0
        }

        setItems([...items, item])
        setNewItem({
            name: '',
            category: newItem.category,
            quantity: 1,
            unit: newItem.unit,
            unitPrice: 0
        })
    }

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id))
    }

    const calculateItemTotal = (item: CostItem) => {
        return item.quantity * item.unitPrice
    }

    const calculateCategoryTotal = (category: string) => {
        return items
            .filter(item => item.category === category)
            .reduce((sum, item) => sum + calculateItemTotal(item), 0)
    }

    const grandTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
    const variance = projectBudget - grandTotal
    const variancePercent = projectBudget > 0 ? (variance / projectBudget) * 100 : 0
    const isOverBudget = variance < 0

    const categoriesWithItems = CATEGORIES.filter(cat =>
        items.some(item => item.category === cat)
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto z-[9999] bg-white">
                <DialogHeader className="pb-4 border-b border-gray-200">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Calculator className="h-5 w-5 text-green-600" />
                        </div>
                        Cost Calculator (ROM)
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 mt-2">
                        Estimate your project costs with detailed material breakdown
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Budget Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-md bg-blue-100">
                                        <Calculator className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Project Budget</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">${projectBudget.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-md bg-purple-100">
                                        <Calculator className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Estimated Cost</p>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">${grandTotal.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card className={`border-l-4 hover:shadow-md transition-shadow ${isOverBudget ? 'border-l-red-500' : 'border-l-green-500'}`}>
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-1.5 rounded-md ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}>
                                        {isOverBudget ? (
                                            <TrendingUp className="h-4 w-4 text-red-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-green-600" />
                                        )}
                                    </div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Variance</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                        ${Math.abs(variance).toLocaleString()}
                                    </p>
                                </div>
                                <p className={`text-xs font-medium mt-1 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                                    {isOverBudget ? 'Over' : 'Under'} by {Math.abs(variancePercent).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add New Item */}
                    <div className="p-5 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white space-y-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-green-100">
                                <Plus className="h-4 w-4 text-green-600" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">Add Cost Item</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="col-span-1 md:col-span-6">
                                <Label htmlFor="item-name" className="text-xs font-medium text-gray-700 mb-1.5 block">Item Name</Label>
                                <Input
                                    id="item-name"
                                    placeholder="e.g., Cement"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="h-10 text-sm"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-6">
                                <Label htmlFor="category" className="text-xs font-medium text-gray-700 mb-1.5 block">Category</Label>
                                <Select
                                    value={newItem.category}
                                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                                >
                                    <SelectTrigger id="category" className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <Label htmlFor="quantity" className="text-xs font-medium text-gray-700 mb-1.5 block">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                                    className="h-10 text-sm"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <Label htmlFor="unit" className="text-xs font-medium text-gray-700 mb-1.5 block">Unit</Label>
                                <Select
                                    value={newItem.unit}
                                    onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                                >
                                    <SelectTrigger id="unit" className="h-10 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        {UNITS.map(unit => (
                                            <SelectItem key={unit} value={unit} className="text-sm">{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <Label htmlFor="unit-price" className="text-xs font-medium text-gray-700 mb-1.5 block">Unit Price ($)</Label>
                                <Input
                                    id="unit-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.unitPrice}
                                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                                    className="h-10 text-sm"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <Button 
                                    onClick={addItem} 
                                    className="w-full h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm" 
                                    disabled={!newItem.name}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Items List by Category */}
                    {items.length > 0 ? (
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-green-100">
                                    <Calculator className="h-4 w-4 text-green-600" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900">Cost Breakdown</h3>
                            </div>
                            {categoriesWithItems.map(category => (
                                <div key={category} className="space-y-3">
                                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-lg border border-gray-200">
                                        <Badge variant="outline" className="text-xs font-semibold bg-white border-gray-300 text-gray-700 px-3 py-1">
                                            {category}
                                        </Badge>
                                        <span className="font-bold text-base text-gray-900">
                                            ${calculateCategoryTotal(category).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Item</th>
                                                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Qty</th>
                                                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Price</th>
                                                    <th className="text-right p-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Total</th>
                                                    <th className="w-[50px]"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items
                                                    .filter(item => item.category === category)
                                                    .map((item, index) => (
                                                        <tr key={item.id} className={`border-b border-gray-100 last:border-0 hover:bg-green-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                                            <td className="p-3 font-medium text-gray-900">{item.name}</td>
                                                            <td className="p-3 text-right text-gray-600">
                                                                {item.quantity} {item.unit}
                                                            </td>
                                                            <td className="p-3 text-right text-gray-600">
                                                                ${item.unitPrice.toLocaleString()}
                                                            </td>
                                                            <td className="p-3 text-right font-semibold text-gray-900">
                                                                ${calculateItemTotal(item).toLocaleString()}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            <div className="h-px bg-gray-200"></div>
                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200">
                                <span className="text-lg font-bold text-gray-900">Grand Total</span>
                                <span className="text-2xl font-bold text-green-700">${grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                            <div className="p-3 rounded-full bg-gray-100 w-fit mx-auto mb-4">
                                <Calculator className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-600 mb-1">No items added yet</p>
                            <p className="text-xs text-gray-500">Start by adding cost items above</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
