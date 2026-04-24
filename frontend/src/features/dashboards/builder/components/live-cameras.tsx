import { Icon } from '@/components/ui/material-icon'
import { useState } from 'react'
import { SiteCamera } from '@/types/api'
import { builderApi } from '@/services/api'

interface LiveCamerasProps {
    cameras?: SiteCamera[];
    projectId: number;
    onDataChange?: () => void;
}

export function LiveCameras({ cameras, projectId, onDataChange }: LiveCamerasProps) {
    const cameraFeeds = cameras || []
    const [selectedCamera, setSelectedCamera] = useState<SiteCamera | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ name: '', stream_url: '' })

    const activeCount = cameraFeeds.filter(f => f.active).length

    const handleSubmit = async () => {
        if (!form.name) return
        setSaving(true)
        try {
            await builderApi.createSiteCamera({ project: projectId as any, name: form.name, stream_url: form.stream_url || undefined, active: true, recording: false })
            setForm({ name: '', stream_url: '' })
            setShowForm(false)
            onDataChange?.()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    return (
        <>
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-slate-900 text-base font-bold font-display flex items-center gap-2">
                        <Icon name="video" size={18} className="text-red-500" />
                        Live Cameras
                    </h2>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            {activeCount} Active
                        </span>
                        <button onClick={() => setShowForm(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Icon name="add" size={14} /> Add Camera
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="p-4 border-b border-slate-100 bg-blue-50/30 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">Register Camera</span>
                            <button onClick={() => setShowForm(false)} className="p-0.5 hover:bg-slate-200 rounded"><Icon name="close" size={14} className="text-slate-400" /></button>
                        </div>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Camera name (e.g. Main Entrance)" className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <input value={form.stream_url} onChange={e => setForm({...form, stream_url: e.target.value})} placeholder="Stream URL (optional)" className="w-full text-xs border border-slate-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                        <button onClick={handleSubmit} disabled={saving || !form.name} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold py-1.5 rounded-md transition-colors">
                            {saving ? 'Saving...' : 'Register Camera'}
                        </button>
                    </div>
                )}

                {cameraFeeds.length === 0 && !showForm ? (
                    <div className="p-6 flex items-center justify-center">
                        <p className="text-sm text-slate-400">No cameras configured for this project.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                        {cameraFeeds.map((feed) => (
                            <div
                                key={feed.id}
                                className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${feed.active ? 'border-slate-200 hover:border-blue-400' : 'border-slate-100 opacity-60'}`}
                                onClick={() => setSelectedCamera(feed)}
                            >
                                <div className={`aspect-[4/3] ${feed.active ? 'bg-slate-100' : 'bg-slate-50'} flex items-center justify-center relative`}>
                                    {feed.active ? (
                                        <>
                                            <Icon name="camera" size={32} className="text-slate-300" />
                                            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                                LIVE
                                            </div>
                                            {feed.recording && (
                                                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                                                    REC
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Icon name="camera" size={32} className="text-slate-400" />
                                    )}
                                </div>
                                <div className="p-3 bg-white border-t border-slate-100">
                                    <p className="text-sm font-semibold text-slate-800 truncate">{feed.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{feed.active ? 'Streaming' : 'Offline'}</p>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Icon name="maximize" size={24} className="text-white drop-shadow-lg scale-90 group-hover:scale-100 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {selectedCamera && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl max-w-4xl w-full flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 bg-slate-900 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-white">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    <span className="font-bold text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">{selectedCamera.name}</span>
                                </div>
                                <span className="hidden sm:inline text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Live Feed</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hidden sm:block"><Icon name="download" size={18} /></button>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hidden sm:block"><Icon name="maximize" size={18} /></button>
                                <button onClick={() => setSelectedCamera(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hover:text-red-400 ml-1"><Icon name="close" size={20} /></button>
                            </div>
                        </div>
                        <div className="aspect-video bg-slate-950 flex items-center justify-center relative w-full">
                            <Icon name="camera" size={64} className="text-slate-800 absolute" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
                        </div>
                        <div className="p-4 bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shrink-0 border-t border-slate-200">
                            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 w-full sm:w-auto">
                                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"><Icon name="play" size={16} /> Play</button>
                                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"><Icon name="pause" size={16} /> Pause</button>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
                                <button className="text-xs font-medium text-blue-600 hover:underline">View History</button>
                                <button className="text-xs font-medium text-blue-600 hover:underline">Download Clip</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
