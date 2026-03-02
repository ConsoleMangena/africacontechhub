import { ClipboardList } from 'lucide-react';

// ─── Component ──────────────────────────────────────────────────────────────────

export default function BOQMeasurements() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Bill of Quantities</h2>
                    <p className="text-sm text-muted-foreground">
                        Use the <strong>AI chat</strong> to generate BOQ analyses — attach a floor plan or blueprint and type <code>/analyse</code>.
                    </p>
                </div>
            </div>
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                    BOQ data is now generated on-demand via the AI Architecture Assistant.
                    Click the <strong>AI chat button</strong> (bottom-right), attach your drawing, and run <code>/analyse</code>.
                </p>
            </div>
        </div>
    );
}
