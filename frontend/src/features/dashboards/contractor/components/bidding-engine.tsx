import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function BiddingEngine() {
    return (
        <div className='grid gap-4'>
            <Card>
                <CardHeader>
                    <CardTitle>P4P Bidding Calculator</CardTitle>
                    <CardDescription>Calculate safe, profitable bids with automated Net Margin and Overhead analysis</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label htmlFor='labor'>Direct Labor Cost ($)</Label>
                            <Input id='labor' type='number' placeholder='0.00' />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='materials'>Materials Cost ($)</Label>
                            <Input id='materials' type='number' placeholder='0.00' />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='equipment'>Equipment Cost ($)</Label>
                            <Input id='equipment' type='number' placeholder='0.00' />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='subcontractors'>Subcontractors ($)</Label>
                            <Input id='subcontractors' type='number' placeholder='0.00' />
                        </div>
                    </div>
                    <div className='border-t pt-4'>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='overhead'>Overhead %</Label>
                                <Input id='overhead' type='number' placeholder='15' defaultValue='15' />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='margin'>Target Net Margin %</Label>
                                <Input id='margin' type='number' placeholder='20' defaultValue='20' />
                            </div>
                        </div>
                    </div>
                    <Button className='w-full'>Calculate Bid Amount</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Bid Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>Direct Costs:</span>
                            <span className='font-medium'>$0.00</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>Overhead (15%):</span>
                            <span className='font-medium'>$0.00</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-sm text-muted-foreground'>Net Margin (20%):</span>
                            <span className='font-medium'>$0.00</span>
                        </div>
                        <div className='border-t pt-3 flex justify-between items-center'>
                            <span className='text-lg font-bold'>Recommended Bid:</span>
                            <span className='text-2xl font-bold text-primary'>$0.00</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
