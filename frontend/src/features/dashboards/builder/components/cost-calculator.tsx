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
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto z-[9999] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Calculator className="h-4 w-4" />
                        Cost Calculator (ROM)
                    </DialogTitle>
                    <DialogDescription>
                        Estimate your project costs with detailed material breakdown
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Budget Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <p className="text-xs text-muted-foreground mb-1">Project Budget</p>
                                <p className="text-xl font-bold">${projectBudget.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
                                <p className="text-xl font-bold">${grandTotal.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 flex flex-col justify-between h-full">
                                <p className="text-xs text-muted-foreground mb-1">Variance</p>
                                <div className="flex items-center gap-2">
                                    <p className={`text-xl font-bold ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                                        ${Math.abs(variance).toLocaleString()}
                                    </p>
                                    {isOverBudget ? (
                                        <TrendingUp className="h-4 w-4 text-destructive" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4 text-green-600" />
                                    )}
                                </div>
                                <p className={`text-xs ${isOverBudget ? 'text-destructive' : 'text-green-600'}`}>
                                    {isOverBudget ? 'Over' : 'Under'} by {Math.abs(variancePercent).toFixed(1)}%
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add New Item */}
                    <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                        <h3 className="text-sm font-semibold">Add Cost Item</h3>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="col-span-1 md:col-span-6">
                                <Label htmlFor="item-name" className="text-xs mb-1.5 block">Item Name</Label>
                                <Input
                                    id="item-name"
                                    placeholder="e.g., Cement"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-6">
                                <Label htmlFor="category" className="text-xs mb-1.5 block">Category</Label>
                                <Select
                                    value={newItem.category}
                                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                                >
                                    <SelectTrigger id="category" className="h-9 text-sm">
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
                                <Label htmlFor="quantity" className="text-xs mb-1.5 block">Quantity</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-3">
                                <Label htmlFor="unit" className="text-xs mb-1.5 block">Unit</Label>
                                <Select
                                    value={newItem.unit}
                                    onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                                >
                                    <SelectTrigger id="unit" className="h-9 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="z-[10000]">
                                        {UNITS.map(unit => (
                                            <SelectItem key={unit} value={unit} className="text-sm">{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1 md:col-span-4">
                                <Label htmlFor="unit-price" className="text-xs mb-1.5 block">Unit Price ($)</Label>
                                <Input
                                    id="unit-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newItem.unitPrice}
                                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                                    className="h-9 text-sm"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <Button onClick={addItem} className="w-full h-9" size="icon" disabled={!newItem.name}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Items List by Category */}
                    {items.length > 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Cost Breakdown</h3>
                            {categoriesWithItems.map(category => (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between bg-muted/50 p-2 rounded-md">
                                        <Badge variant="outline" className="text-xs font-normal">
                                            {category}
                                        </Badge>
                                        <span className="font-semibold text-sm">
                                            ${calculateCategoryTotal(category).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="border rounded-md">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/30 text-xs text-muted-foreground">
                                                <tr>
                                                    <th className="text-left p-2 font-medium">Item</th>
                                                    <th className="text-right p-2 font-medium">Qty</th>
                                                    <th className="text-right p-2 font-medium">Price</th>
                                                    <th className="text-right p-2 font-medium">Total</th>
                                                    <th className="w-[40px]"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items
                                                    .filter(item => item.category === category)
                                                    .map(item => (
                                                        <tr key={item.id} className="border-t last:border-0 hover:bg-muted/10">
                                                            <td className="p-2">{item.name}</td>
                                                            <td className="p-2 text-right text-muted-foreground">
                                                                {item.quantity} {item.unit}
                                                            </td>
                                                            <td className="p-2 text-right text-muted-foreground">
                                                                ${item.unitPrice.toLocaleString()}
                                                            </td>
                                                            <td className="p-2 text-right font-medium">
                                                                ${calculateItemTotal(item).toLocaleString()}
                                                            </td>
                                                            <td className="p-2 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                            <Separator />
                            <div className="flex justify-between items-center text-base font-bold pt-2">
                                <span>Grand Total</span>
                                <span>${grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            <Calculator className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">No items added yet</p>
                            <p className="text-xs opacity-70">Start by adding cost items above</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
