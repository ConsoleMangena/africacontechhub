import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminApi } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/material-icon'
import { Button } from '@/components/ui/button'
import JSZip from 'jszip'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#a855f7']

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function getSvgElement(containerId: string) {
  const el = document.getElementById(containerId)
  if (!el) return null
  return el.querySelector('svg')
}

function getSvgBlobFromContainer(containerId: string) {
  const svg = getSvgElement(containerId)
  if (!svg) return null
  const clone = svg.cloneNode(true) as SVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const xml = new XMLSerializer().serializeToString(clone)
  return new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
}

function downloadSvgFromContainer(containerId: string, filename: string) {
  const blob = getSvgBlobFromContainer(containerId)
  if (!blob) return false
  downloadBlob(filename, blob)
  return true
}

async function getPngBlobFromContainer(containerId: string, scale = 2) {
  const svg = getSvgElement(containerId)
  if (!svg) return null

  const clone = svg.cloneNode(true) as SVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const bbox = svg.getBoundingClientRect()
  const width = Math.max(1, Math.round(bbox.width))
  const height = Math.max(1, Math.round(bbox.height))
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))

  const xml = new XMLSerializer().serializeToString(clone)
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`

  const img = new Image()
  img.decoding = 'async'

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('Failed to load SVG into image'))
    img.src = svgDataUrl
  })

  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0, width, height)

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  return blob
}

export function AdminDashboardAnalytics() {
  const [isExportingZip, setIsExportingZip] = useState(false)
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => (await adminApi.getMetrics()).data,
    staleTime: 30_000,
  })

  const monthlyVolume = useMemo(() => {
    const rows = metrics?.monthly_volume ?? []
    return rows.map((item: any) => {
      const [year, month] = (item.month || '').split('-')
      const label = year && month
        ? new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'short' })
        : item.month
      return {
        month: label,
        signups: item.signups ?? 0,
        projects: item.projects ?? 0,
        ai_messages: item.ai_messages ?? 0,
      }
    })
  }, [metrics])

  const distribution = useMemo(() => {
    const rows = metrics?.user_distribution ?? []
    return rows.map((item: any) => ({
      name: item.role,
      value: item.count,
    }))
  }, [metrics])

  const aiMessagesTrend = useMemo(() => {
    return monthlyVolume.map((row: any) => ({
      month: row.month,
      messages: row.ai_messages,
    }))
  }, [monthlyVolume])

  const comparisonData = useMemo(() => {
    const totalSignups = monthlyVolume.reduce((acc: number, row: any) => acc + row.signups, 0)
    const totalProjects = monthlyVolume.reduce((acc: number, row: any) => acc + row.projects, 0)
    const totalAi = monthlyVolume.reduce((acc: number, row: any) => acc + row.ai_messages, 0)
    return [
      { metric: 'Signups', value: totalSignups },
      { metric: 'Projects', value: totalProjects },
      { metric: 'AI Messages', value: totalAi },
    ]
  }, [monthlyVolume])

  const overview = metrics?.system_overview ?? {}
  const totalUsers = metrics?.total_users ?? 0
  const activeProjects = metrics?.active_projects ?? 0
  const activeSuppliers = metrics?.active_suppliers ?? 0
  const totalVolume = metrics?.total_volume ?? 0


  const exportSections = useMemo(
    () => [
      {
        title: 'Comparison Totals',
        columns: ['Metric', 'Value'],
        rows: comparisonData.map((item) => [item.metric, item.value]),
      },
      {
        title: 'User Distribution',
        columns: ['Role', 'Users'],
        rows: distribution.map((item) => [item.name, item.value]),
      },
      {
        title: 'AI Messages Trend',
        columns: ['Month', 'Messages'],
        rows: aiMessagesTrend.map((item) => [item.month, item.messages]),
      },
    ],
    [comparisonData, distribution, aiMessagesTrend]
  )

  const downloadCsv = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
    const lines: string[] = [
      escapeCsv('Dashboard Analytics Export'),
      `${escapeCsv('Generated At')},${escapeCsv(new Date().toLocaleString())}`,
      '',
    ]

    exportSections.forEach((section, index) => {
      lines.push(escapeCsv(section.title))
      lines.push(section.columns.map(escapeCsv).join(','))
      section.rows.forEach((row) => lines.push(row.map(escapeCsv).join(',')))
      if (index < exportSections.length - 1) lines.push('')
    })

    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dashboard-analytics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const escapePdfText = (text: string) =>
    text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')

  const downloadPdf = () => {
    const lines: Array<{ text: string; size: number; font: 'F1' | 'F2' }> = [
      { text: 'Dashboard Analytics Report', size: 16, font: 'F2' },
      { text: `Generated At: ${new Date().toLocaleString()}`, size: 10, font: 'F1' },
      { text: ' ', size: 8, font: 'F1' },
    ]

    exportSections.forEach((section) => {
      lines.push({ text: section.title, size: 12, font: 'F2' })
      lines.push({ text: `${section.columns[0]} | ${section.columns[1]}`, size: 10, font: 'F2' })
      section.rows.forEach((row) => {
        lines.push({ text: `${String(row[0])} | ${String(row[1])}`, size: 10, font: 'F1' })
      })
      lines.push({ text: ' ', size: 8, font: 'F1' })
    })

    const pages: string[] = []
    let currentPage = ''
    let y = 800
    const pageBottom = 50

    lines.forEach((line) => {
      const lineStep = line.size + 6
      if (y - lineStep < pageBottom) {
        pages.push(currentPage)
        currentPage = ''
        y = 800
      }
      currentPage += `BT /${line.font} ${line.size} Tf 50 ${y} Td (${escapePdfText(line.text)}) Tj ET\n`
      y -= lineStep
    })
    pages.push(currentPage)

    const objects: string[] = []
    objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj')

    const pageStartObj = 3
    const contentStartObj = pageStartObj + pages.length
    const kids = pages.map((_, i) => `${pageStartObj + i} 0 R`).join(' ')
    objects.push(`2 0 obj << /Type /Pages /Kids [${kids}] /Count ${pages.length} >> endobj`)

    pages.forEach((_, i) => {
      const pageObj = pageStartObj + i
      const contentObj = contentStartObj + i
      objects.push(
        `${pageObj} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${contentStartObj + pages.length} 0 R /F2 ${contentStartObj + pages.length + 1} 0 R >> >> /Contents ${contentObj} 0 R >> endobj`
      )
    })

    pages.forEach((content, i) => {
      const contentObj = contentStartObj + i
      objects.push(`${contentObj} 0 obj << /Length ${content.length} >> stream\n${content}endstream endobj`)
    })

    const regularFontObj = contentStartObj + pages.length
    const boldFontObj = regularFontObj + 1
    objects.push(`${regularFontObj} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`)
    objects.push(`${boldFontObj} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`)

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = [0]
    objects.forEach((obj) => {
      offsets.push(pdf.length)
      pdf += `${obj}\n`
    })
    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n`
    pdf += '0000000000 65535 f \n'
    for (let i = 1; i < offsets.length; i += 1) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

    const blob = new Blob([pdf], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dashboard-analytics.pdf'
    a.click()
    URL.revokeObjectURL(url)
  }

  const buildCsvBlob = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
    const lines: string[] = [
      escapeCsv('Dashboard Analytics Export'),
      `${escapeCsv('Generated At')},${escapeCsv(new Date().toLocaleString())}`,
      '',
    ]

    exportSections.forEach((section, index) => {
      lines.push(escapeCsv(section.title))
      lines.push(section.columns.map(escapeCsv).join(','))
      section.rows.forEach((row) => lines.push(row.map(escapeCsv).join(',')))
      if (index < exportSections.length - 1) lines.push('')
    })

    return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  }

  const buildPdfBlob = () => {
    const escapePdfText = (text: string) =>
      text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')

    const lines: Array<{ text: string; size: number; font: 'F1' | 'F2' }> = [
      { text: 'Dashboard Analytics Report', size: 16, font: 'F2' },
      { text: `Generated At: ${new Date().toLocaleString()}`, size: 10, font: 'F1' },
      { text: ' ', size: 8, font: 'F1' },
    ]

    exportSections.forEach((section) => {
      lines.push({ text: section.title, size: 12, font: 'F2' })
      lines.push({ text: `${section.columns[0]} | ${section.columns[1]}`, size: 10, font: 'F2' })
      section.rows.forEach((row) => {
        lines.push({ text: `${String(row[0])} | ${String(row[1])}`, size: 10, font: 'F1' })
      })
      lines.push({ text: ' ', size: 8, font: 'F1' })
    })

    const pages: string[] = []
    let currentPage = ''
    let y = 800
    const pageBottom = 50

    lines.forEach((line) => {
      const lineStep = line.size + 6
      if (y - lineStep < pageBottom) {
        pages.push(currentPage)
        currentPage = ''
        y = 800
      }
      currentPage += `BT /${line.font} ${line.size} Tf 50 ${y} Td (${escapePdfText(line.text)}) Tj ET\n`
      y -= lineStep
    })
    pages.push(currentPage)

    const objects: string[] = []
    objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj')

    const pageStartObj = 3
    const contentStartObj = pageStartObj + pages.length
    const kids = pages.map((_, i) => `${pageStartObj + i} 0 R`).join(' ')
    objects.push(`2 0 obj << /Type /Pages /Kids [${kids}] /Count ${pages.length} >> endobj`)

    pages.forEach((_, i) => {
      const pageObj = pageStartObj + i
      const contentObj = contentStartObj + i
      objects.push(
        `${pageObj} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${contentStartObj + pages.length} 0 R /F2 ${contentStartObj + pages.length + 1} 0 R >> >> /Contents ${contentObj} 0 R >> endobj`
      )
    })

    pages.forEach((content, i) => {
      const contentObj = contentStartObj + i
      objects.push(`${contentObj} 0 obj << /Length ${content.length} >> stream\n${content}endstream endobj`)
    })

    const regularFontObj = contentStartObj + pages.length
    const boldFontObj = regularFontObj + 1
    objects.push(`${regularFontObj} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`)
    objects.push(`${boldFontObj} 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`)

    let pdf = '%PDF-1.4\n'
    const offsets: number[] = [0]
    objects.forEach((obj) => {
      offsets.push(pdf.length)
      pdf += `${obj}\n`
    })
    const xrefStart = pdf.length
    pdf += `xref\n0 ${objects.length + 1}\n`
    pdf += '0000000000 65535 f \n'
    for (let i = 1; i < offsets.length; i += 1) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

    return new Blob([pdf], { type: 'application/pdf' })
  }

  const downloadMasterJson = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      raw_metrics: metrics ?? null,
      datasets: {
        monthly_volume: monthlyVolume,
        comparison_totals: comparisonData,
        user_distribution: distribution,
        ai_messages_trend: aiMessagesTrend,
      },
    }
    downloadBlob('dashboard-analytics.master.json', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  }

  const downloadAllChartsSvg = () => {
    downloadSvgFromContainer('chart-comparison', 'bar-comparison.totals.svg')
    downloadSvgFromContainer('chart-growth', 'growth-trends.svg')
    downloadSvgFromContainer('chart-distribution', 'user-distribution.svg')
    downloadSvgFromContainer('chart-ai-messages', 'ai-messages-trend.svg')
  }

  const downloadMasterZip = async () => {
    setIsExportingZip(true)
    try {
      const zip = new JSZip()
      const ts = new Date().toISOString().replaceAll(':', '-')
      const root = zip.folder(`dashboard-analytics-export_${ts}`) ?? zip

      // Master datasets
      const masterPayload = {
        generated_at: new Date().toISOString(),
        raw_metrics: metrics ?? null,
        datasets: {
          monthly_volume: monthlyVolume,
          comparison_totals: comparisonData,
          user_distribution: distribution,
          ai_messages_trend: aiMessagesTrend,
        },
      }
      root.file('master-data.json', JSON.stringify(masterPayload, null, 2))
      root.file('dashboard-analytics.csv', buildCsvBlob())
      root.file('dashboard-analytics.pdf', buildPdfBlob())

      // Charts folder
      const charts = root.folder('charts') ?? root

      // Recharts SVG + PNG
      const recharts = [
        { id: 'chart-comparison', base: 'bar-comparison.totals' },
        { id: 'chart-growth', base: 'growth-trends' },
        { id: 'chart-distribution', base: 'user-distribution' },
        { id: 'chart-ai-messages', base: 'ai-messages-trend' },
      ]

      for (const c of recharts) {
        const svgBlob = getSvgBlobFromContainer(c.id)
        if (svgBlob) charts.file(`${c.base}.svg`, svgBlob)

        const pngBlob = await getPngBlobFromContainer(c.id, 2)
        if (pngBlob) charts.file(`${c.base}.png`, pngBlob)
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(`dashboard-analytics-export_${ts}.zip`, zipBlob)
    } finally {
      setIsExportingZip(false)
    }
  }

  const formatVolume = (v: number) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`
    return `$${v.toFixed(0)}`
  }

  const kpiTiles = [
    { label: 'Total Users', value: totalUsers, icon: 'group', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Projects', value: activeProjects, icon: 'business', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Suppliers', value: activeSuppliers, icon: 'local_shipping', color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Volume', value: formatVolume(totalVolume), icon: 'payments', color: 'bg-purple-50 text-purple-600' },
    { label: 'New Users (30d)', value: overview.new_users_30d ?? 0, icon: 'person_add', color: 'bg-sky-50 text-sky-600' },
    { label: 'Pending Requests', value: overview.pending_requests ?? 0, icon: 'pending_actions', color: 'bg-orange-50 text-orange-600' },
    { label: 'Total Projects', value: overview.total_projects ?? 0, icon: 'folder', color: 'bg-slate-100 text-slate-600' },
    { label: 'Avg Budget', value: formatVolume(overview.avg_project_budget ?? 0), icon: 'account_balance', color: 'bg-teal-50 text-teal-600' },
  ]

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={downloadMasterZip} disabled={isExportingZip}>
            <Icon name="folder_zip" size={12} className="mr-1" />
            {isExportingZip ? 'ZIP...' : 'ZIP'}
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={downloadAllChartsSvg}>
            <Icon name="image" size={12} className="mr-1" />
            SVG
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={downloadMasterJson}>
            <Icon name="data_object" size={12} className="mr-1" />
            JSON
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={downloadCsv}>
            <Icon name="download" size={12} className="mr-1" />
            CSV
          </Button>
          <Button size="sm" className="h-7 text-[11px]" onClick={downloadPdf}>
            <Icon name="picture_as_pdf" size={12} className="mr-1" />
            PDF
          </Button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {kpiTiles.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-border/50 bg-card p-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <div className={`h-6 w-6 rounded-md flex items-center justify-center ${kpi.color}`}>
                <Icon name={kpi.icon} className="h-3.5 w-3.5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">{kpi.label}</span>
            </div>
            <p className="text-lg font-extrabold tracking-tight text-foreground tabular-nums">{isLoading ? '–' : kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Row 1: Bar Comparison + Growth Trends */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xs font-bold">Activity Totals (6 months)</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => downloadSvgFromContainer('chart-comparison', 'bar-comparison.totals.svg')}>
              <Icon name="download" size={12} className="mr-1" />SVG
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div id="chart-comparison">
              <ResponsiveContainer width="100%" height={180}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="metric" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xs font-bold">Growth Trends (Signups & Projects)</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => downloadSvgFromContainer('chart-growth', 'growth-trends.svg')}>
              <Icon name="download" size={12} className="mr-1" />SVG
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <div className="h-[180px] flex items-center justify-center">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div id="chart-growth">
                <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyVolume}>
                  <defs>
                    <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="projects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="signups" stroke="#6366f1" fill="url(#signups)" strokeWidth={2} />
                  <Area type="monotone" dataKey="projects" stroke="#10b981" fill="url(#projects)" strokeWidth={2} />
                </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: User Distribution + AI Messages Trend */}
      <div className="grid gap-3 lg:grid-cols-5">
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xs font-bold">User Distribution</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => downloadSvgFromContainer('chart-distribution', 'user-distribution.svg')}>
              <Icon name="download" size={12} className="mr-1" />SVG
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <div className="h-[180px] flex items-center justify-center">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div id="chart-distribution" className="flex items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {distribution.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {!isLoading && distribution.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {distribution.map((d: any, i: number) => (
                  <span key={d.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50">
          <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-xs font-bold">AI Messages (Monthly)</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => downloadSvgFromContainer('chart-ai-messages', 'ai-messages-trend.svg')}>
              <Icon name="download" size={12} className="mr-1" />SVG
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <div className="h-[180px] flex items-center justify-center">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div id="chart-ai-messages">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={aiMessagesTrend}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="messages"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
