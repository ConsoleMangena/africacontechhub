import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/material-icon';

// Realistic EVM (Earned Value Management) data over 12 weeks
const evmData = [
  { period: 'W1', PV: 15000, EV: 12000, AC: 14000 },
  { period: 'W2', PV: 35000, EV: 32000, AC: 36000 },
  { period: 'W3', PV: 60000, EV: 65000, AC: 62000 },
  { period: 'W4', PV: 90000, EV: 88000, AC: 95000 },
  { period: 'W5', PV: 125000, EV: 120000, AC: 130000 },
  { period: 'W6', PV: 165000, EV: 170000, AC: 160000 }, // Spike in EV (ahead)
  { period: 'W7', PV: 210000, EV: 200000, AC: 215000 },
  { period: 'W8', PV: 260000, EV: 245000, AC: 275000 }, // Slipping (behind, over)
  { period: 'W9', PV: 315000, EV: undefined, AC: undefined },
  { period: 'W10', PV: 375000, EV: undefined, AC: undefined },
  { period: 'W11', PV: 420000, EV: undefined, AC: undefined },
  { period: 'W12', PV: 450000, EV: undefined, AC: undefined },
];

const formatCurrency = (value: number) => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pv = payload.find((p: any) => p.dataKey === 'PV')?.value;
    const ev = payload.find((p: any) => p.dataKey === 'EV')?.value;
    const ac = payload.find((p: any) => p.dataKey === 'AC')?.value;

    const cv = ev !== undefined && ac !== undefined ? ev - ac : null;
    const sv = ev !== undefined && pv !== undefined ? ev - pv : null;
    const cpi = ev !== undefined && ac !== undefined && ac !== 0 ? (ev / ac).toFixed(2) : null;
    const spi = ev !== undefined && pv !== undefined && pv !== 0 ? (ev / pv).toFixed(2) : null;

    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-xl z-50 min-w-[200px]">
        <div className="text-slate-500 font-bold uppercase tracking-widest text-[9px] mb-2 border-b border-slate-100 pb-1 flex justify-between">
          <span>Period {label}</span>
          <span className="text-slate-400">Live Tick</span>
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-500 font-bold">● PV (Planned)</span>
            <span className="text-slate-900 font-mono font-bold">{pv ? `$${pv.toLocaleString()}` : '—'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-emerald-500 font-bold">● EV (Earned)</span>
            <span className="text-slate-900 font-mono font-bold">{ev ? `$${ev.toLocaleString()}` : '—'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-rose-500 font-bold">● AC (Actual)</span>
            <span className="text-slate-900 font-mono font-bold">{ac ? `$${ac.toLocaleString()}` : '—'}</span>
          </div>
        </div>
        
        {cv !== null && sv !== null && (
          <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
             <div className="bg-slate-50 border border-slate-100 p-1.5 rounded flex flex-col">
                 <span className="text-[8px] text-slate-500 uppercase font-bold text-center">CPI</span>
                 <span className={`text-[11px] font-mono font-bold text-center ${Number(cpi) >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {cpi}
                 </span>
             </div>
             <div className="bg-slate-50 border border-slate-100 p-1.5 rounded flex flex-col">
                 <span className="text-[8px] text-slate-500 uppercase font-bold text-center">SPI</span>
                 <span className={`text-[11px] font-mono font-bold text-center ${Number(spi) >= 1 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {spi}
                 </span>
             </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export function BudgetRealityChart() {
  return (
    <Card className="bg-white border-slate-200 shadow-sm rounded-xl overflow-hidden relative">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-blue-50 blur-[100px] pointer-events-none" />
      
      <CardContent className="p-0">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon name="candlestick_chart" className="text-emerald-500" />
              Budget vs Reality (EVM)
            </h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">
              Forex Terminal View • Real-time Cost & Schedule Tracking
            </p>
          </div>
          
          {/* Legend/Ticker style */}
          <div className="flex gap-4 sm:gap-6 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                <span className="text-[10px] font-bold text-slate-700">PV <span className="text-slate-400 ml-1">Planned</span></span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                <span className="text-[10px] font-bold text-slate-700">EV <span className="text-slate-400 ml-1">Earned</span></span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                <span className="text-[10px] font-bold text-slate-700">AC <span className="text-slate-400 ml-1">Actual Cost</span></span>
             </div>
          </div>
        </div>

        <div className="h-[350px] w-full p-4 pl-0 sm:pr-6 pt-6 relative z-10 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evmData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              {/* Distinct Forex-style grid - light dotted */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} horizontal={true} opacity={0.8} />
              
              <XAxis 
                dataKey="period" 
                stroke="#64748b" 
                fontSize={10} 
                fontFamily="monospace"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                dy={10}
              />
              
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                fontFamily="monospace"
                tickFormatter={formatCurrency}
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} 
              />
              
              {/* Planned Value (PV) - The Baseline */}
              <Line 
                type="monotone" 
                dataKey="PV" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
                name="Planned Value"
              />
              
              {/* Earned Value (EV) - Project Progress Value */}
              <Line 
                type="monotone" 
                dataKey="EV" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ r: 2, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                name="Earned Value"
              />
              
              {/* Actual Cost (AC) - Real Burn */}
              <Line 
                type="monotone" 
                dataKey="AC" 
                stroke="#f43f5e" 
                strokeWidth={2}
                dot={{ r: 2, fill: "#f43f5e", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#f43f5e", stroke: "#ffffff", strokeWidth: 2 }}
                name="Actual Cost"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
