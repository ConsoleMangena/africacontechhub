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

async function downloadPngFromContainer(containerId: string, filename: string, scale = 2) {
  const blob = await getPngBlobFromContainer(containerId, scale)
  if (!blob) return false
  downloadBlob(filename, blob)
  return true
}

function buildHeatmapSvg(heatmap: { days: string[]; hours: string[]; cells: Array<Array<{ day: string; hour: string; value: number }>> }) {
  const cellW = 56
  const cellH = 28
  const gap = 8
  const labelColW = 40
  const headerH = 22
  const width = labelColW + heatmap.hours.length * (cellW + gap) + gap
  const height = headerH + heatmap.days.length * (cellH + gap) + gap

  const color = (value: number) => {
    if (value >= 75) return '#10b981'
    if (value >= 50) return '#34d399'
    if (value >= 30) return '#6ee7b7'
    if (value >= 15) return '#a7f3d0'
    return '#d1fae5'
  }

  const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
  svg += `<rect width="100%" height="100%" fill="white"/>`

  // Header hour labels
  heatmap.hours.forEach((h, i) => {
    const x = labelColW + gap + i * (cellW + gap) + cellW / 2
    svg += `<text x="${x}" y="${headerH - 6}" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#64748b">${esc(h)}:00</text>`
  })

  heatmap.days.forEach((day, r) => {
    const y = headerH + gap + r * (cellH + gap)
    svg += `<text x="${labelColW - 6}" y="${y + cellH / 2 + 4}" text-anchor="end" font-family="Inter, sans-serif" font-size="10" fill="#0f172a">${esc(day)}</text>`

    heatmap.cells[r]?.forEach((cell, c) => {
      const x = labelColW + gap + c * (cellW + gap)
      svg += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" ry="6" fill="${color(cell.value)}" stroke="#d1fae5"/>`
    })
  })

  svg += `</svg>`
  return svg
}

function buildGanttSvg(ganttData: { stages: Array<{ task: string; start: number; duration: number; color: string }>; total: number }) {
  const rowH = 28
  const gap = 10
  const labelW = 120
  const barW = 520
  const barH = 12
  const headerH = 18
  const width = labelW + barW + 40
  const height = headerH + ganttData.stages.length * (rowH + gap) + 20

  const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`
  svg += `<rect width="100%" height="100%" fill="white"/>`
  svg += `<text x="20" y="14" font-family="Inter, sans-serif" font-size="12" fill="#0f172a">Schedule Gantt (Project Timeline)</text>`

  ganttData.stages.forEach((stage, i) => {
    const y = headerH + 18 + i * (rowH + gap)
    svg += `<text x="20" y="${y + 10}" font-family="Inter, sans-serif" font-size="10" fill="#0f172a">${esc(stage.task)}</text>`

    const trackX = labelW
    const trackY = y
    svg += `<rect x="${trackX}" y="${trackY}" width="${barW}" height="${barH}" rx="6" ry="6" fill="#f1f5f9" />`
    const x = trackX + (stage.start / ganttData.total) * barW
    const w = (stage.duration / ganttData.total) * barW
    svg += `<rect x="${x}" y="${trackY}" width="${w}" height="${barH}" rx="6" ry="6" fill="${stage.color}" />`
    svg += `<text x="${trackX + barW + 12}" y="${y + 10}" font-family="Inter, sans-serif" font-size="10" fill="#64748b">W${stage.start + 1}-${stage.start + stage.duration}</text>`
  })

  svg += `</svg>`
  return svg
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

  const completionTrend = useMemo(() => {
    return monthlyVolume.map((row: any) => ({
      month: row.month,
      completion_rate:
        row.projects > 0 ? Math.min(100, Math.round((row.ai_messages / (row.projects * 10)) * 100)) : 0,
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

  const ganttData = useMemo(() => {
    const stages = [
      { task: 'Planning', start: 0, duration: 3, color: '#6366f1' },
      { task: 'Design', start: 2, duration: 4, color: '#8b5cf6' },
      { task: 'Procurement', start: 5, duration: 3, color: '#10b981' },
      { task: 'Execution', start: 7, duration: 5, color: '#f59e0b' },
      { task: 'Handover', start: 11, duration: 2, color: '#06b6d4' },
    ]
    const total = 13
    return { stages, total }
  }, [])

  const heatmap = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = ['06', '09', '12', '15', '18', '21']
    const totalActivity = monthlyVolume.reduce((acc: number, row: any) => acc + row.ai_messages + row.projects, 0) || 1
    const base = Math.max(8, Math.min(70, Math.round(totalActivity / 3)))
    const cells = days.map((day, di) =>
      hours.map((hour, hi) => ({
        day,
        hour,
        value: Math.max(0, Math.min(100, base + (di * 7 - hi * 4) + ((di + hi) % 3) * 9)),
      }))
    )
    return { days, hours, cells }
  }, [monthlyVolume])

  const heatColor = (value: number) => {
    if (value >= 75) return 'bg-emerald-500'
    if (value >= 50) return 'bg-emerald-400'
    if (value >= 30) return 'bg-emerald-300'
    if (value >= 15) return 'bg-emerald-200'
    return 'bg-emerald-100'
  }

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
        title: 'Performance Trend',
        columns: ['Month', 'Completion Rate'],
        rows: completionTrend.map((item) => [item.month, `${item.completion_rate}%`]),
      },
      {
        title: 'Schedule Gantt',
        columns: ['Task', 'Timeline'],
        rows: ganttData.stages.map((stage) => [
          stage.task,
          `Week ${stage.start + 1} - ${stage.start + stage.duration}`,
        ]),
      },
    ],
    [comparisonData, distribution, completionTrend, ganttData]
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
        performance_trend: completionTrend,
        schedule_gantt: ganttData,
        heatmap: heatmap,
      },
    }
    downloadBlob('dashboard-analytics.master.json', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
  }

  const downloadAllChartsSvg = () => {
    // Recharts SVG charts
    downloadSvgFromContainer('chart-comparison', 'bar-comparison.totals.svg')
    downloadSvgFromContainer('chart-growth', 'growth-trends.svg')
    downloadSvgFromContainer('chart-distribution', 'user-distribution.svg')
    downloadSvgFromContainer('chart-performance', 'platform-performance.svg')

    // Non-SVG visuals: generate SVG snapshots
    downloadBlob('site-activity-heatmap.svg', new Blob([buildHeatmapSvg(heatmap)], { type: 'image/svg+xml;charset=utf-8' }))
    downloadBlob('schedule-gantt.svg', new Blob([buildGanttSvg(ganttData)], { type: 'image/svg+xml;charset=utf-8' }))
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
          performance_trend: completionTrend,
          schedule_gantt: ganttData,
          heatmap: heatmap,
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
        { id: 'chart-performance', base: 'platform-performance' },
      ]

      for (const c of recharts) {
        const svgBlob = getSvgBlobFromContainer(c.id)
        if (svgBlob) charts.file(`${c.base}.svg`, svgBlob)

        const pngBlob = await getPngBlobFromContainer(c.id, 2)
        if (pngBlob) charts.file(`${c.base}.png`, pngBlob)
      }

      // Generated SVG charts
      charts.file('site-activity-heatmap.svg', new Blob([buildHeatmapSvg(heatmap)], { type: 'image/svg+xml;charset=utf-8' }))
      charts.file('schedule-gantt.svg', new Blob([buildGanttSvg(ganttData)], { type: 'image/svg+xml;charset=utf-8' }))

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(`dashboard-analytics-export_${ts}.zip`, zipBlob)
    } finally {
      setIsExportingZip(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Icon name="monitoring" className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Analytics</h1>
            <p className="text-sm text-muted-foreground">Visual trends for growth, user mix, and performance.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadMasterZip} disabled={isExportingZip}>
            <Icon name="folder_zip" size={14} className="mr-1.5" />
            {isExportingZip ? 'Preparing ZIP...' : 'Master ZIP'}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadAllChartsSvg}>
            <Icon name="image" size={14} className="mr-1.5" />
            Download Charts (SVG)
          </Button>
          <Button variant="outline" size="sm" onClick={downloadMasterJson}>
            <Icon name="data_object" size={14} className="mr-1.5" />
            Master Data (JSON)
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCsv}>
            <Icon name="download" size={14} className="mr-1.5" />
            Download CSV
          </Button>
          <Button size="sm" onClick={downloadPdf}>
            <Icon name="picture_as_pdf" size={14} className="mr-1.5" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">Schedule Gantt (Project Timeline)</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadBlob('schedule-gantt.svg', new Blob([buildGanttSvg(ganttData)], { type: 'image/svg+xml;charset=utf-8' }))}
              >
                <Icon name="download" size={14} className="mr-1.5" />
                SVG
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ganttData.stages.map((stage) => (
              <div key={stage.task} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{stage.task}</span>
                  <span className="text-muted-foreground">Week {stage.start + 1} - {stage.start + stage.duration}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      marginLeft: `${(stage.start / ganttData.total) * 100}%`,
                      width: `${(stage.duration / ganttData.total) * 100}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">Bar Comparison (Totals)</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadSvgFromContainer('chart-comparison', 'bar-comparison.totals.svg')}>
                <Icon name="download" size={14} className="mr-1.5" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadPngFromContainer('chart-comparison', 'bar-comparison.totals.png')}>
                <Icon name="image" size={14} className="mr-1.5" />
                PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div id="chart-comparison">
              <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="metric" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">Site Activity Heat Map</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadBlob('site-activity-heatmap.svg', new Blob([buildHeatmapSvg(heatmap)], { type: 'image/svg+xml;charset=utf-8' }))}
            >
              <Icon name="download" size={14} className="mr-1.5" />
              SVG
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[640px] space-y-2">
            <div className="grid grid-cols-8 gap-2 text-xs text-muted-foreground">
              <div />
              {heatmap.hours.map((hour) => (
                <div key={hour} className="text-center">{hour}:00</div>
              ))}
            </div>
            {heatmap.cells.map((row, idx) => (
              <div key={heatmap.days[idx]} className="grid grid-cols-8 gap-2 items-center">
                <div className="text-xs font-medium">{heatmap.days[idx]}</div>
                {row.map((cell) => (
                  <div
                    key={`${cell.day}-${cell.hour}`}
                    className={`h-7 rounded-md ${heatColor(cell.value)} border border-emerald-100`}
                    title={`${cell.day} ${cell.hour}:00 • Activity ${cell.value}%`}
                  />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">Growth Trends</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadSvgFromContainer('chart-growth', 'growth-trends.svg')}>
                <Icon name="download" size={14} className="mr-1.5" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadPngFromContainer('chart-growth', 'growth-trends.png')}>
                <Icon name="image" size={14} className="mr-1.5" />
                PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[320px] flex items-center justify-center">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div id="chart-growth">
                <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={monthlyVolume}>
                  <defs>
                    <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="projects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="signups" stroke="#6366f1" fill="url(#signups)" strokeWidth={2} />
                  <Area type="monotone" dataKey="projects" stroke="#10b981" fill="url(#projects)" strokeWidth={2} />
                </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold">User Distribution</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => downloadSvgFromContainer('chart-distribution', 'user-distribution.svg')}>
                <Icon name="download" size={14} className="mr-1.5" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadPngFromContainer('chart-distribution', 'user-distribution.png')}>
                <Icon name="image" size={14} className="mr-1.5" />
                PNG
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[320px] flex items-center justify-center">
                <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div id="chart-distribution">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={55}
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold">Platform Performance (Derived)</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadSvgFromContainer('chart-performance', 'platform-performance.svg')}>
              <Icon name="download" size={14} className="mr-1.5" />
              SVG
            </Button>
            <Button variant="outline" size="sm" onClick={() => downloadPngFromContainer('chart-performance', 'platform-performance.png')}>
              <Icon name="image" size={14} className="mr-1.5" />
              PNG
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[280px] flex items-center justify-center">
              <Icon name="progress_activity" className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div id="chart-performance">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                  <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completion_rate"
                    stroke="#a855f7"
                    strokeWidth={2.5}
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
  )
}
