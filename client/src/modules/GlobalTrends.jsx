import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts'
import { Globe, TrendingUp, TrendingDown, DollarSign, Target, BarChart2, PieChart as PieIcon, Zap, Users, Activity } from 'lucide-react'

/* ── Color palette ─────────────────────────────────────────── */
const C = {
  neon:    '#00ea64',
  ember:   '#ff6b2b',
  info:    '#3b82f6',
  warning: '#f59e0b',
  danger:  '#ef4444',
  purple:  '#a855f7',
  pink:    '#ec4899',
  muted:   '#6b6b6b',
  border:  '#252525',
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle:   { color: '#e0e0e0', fontWeight: 600 },
  itemStyle:    { color: '#a0a0a0' },
}

/* ── Sector-specific global trend data ────────────────────── */
const SECTOR_DATA = {
  edtech: {
    label: 'EdTech',
    color: C.info,
    globalMarketSize: [
      { year: '2021', value: 89, label: 'Pre-COVID baseline' },
      { year: '2022', value: 163, label: 'COVID surge' },
      { year: '2023', value: 227, label: 'Hybrid adoption' },
      { year: '2024', value: 254, label: 'Stabilization' },
      { year: '2025', value: 285, label: 'AI integration' },
      { year: '2026', value: 342, label: 'Current' },
      { year: '2027 (proj)', value: 404, label: 'Projected', projected: true },
      { year: '2028 (proj)', value: 472, label: 'Projected', projected: true },
      { year: '2029 (proj)', value: 551, label: 'Projected', projected: true },
    ],
    fundingShare: [
      { name: 'Private VC', value: 52, color: C.info },
      { name: 'Govt Grants', value: 18, color: C.neon },
      { name: 'NGO/Philanthropy', value: 14, color: C.ember },
      { name: 'Corporate CSR', value: 10, color: C.warning },
      { name: 'Crowdfunding', value: 6, color: C.purple },
    ],
    regionShare: [
      { region: 'Asia Pacific', share: 38, growth: '+24%' },
      { region: 'North America', share: 29, growth: '+11%' },
      { region: 'Europe', share: 18, growth: '+15%' },
      { region: 'Latin America', share: 9, growth: '+31%' },
      { region: 'Africa', share: 6, growth: '+44%' },
    ],
    trendMetrics: [
      { label: 'CAGR (2026–30)', value: '13.4%', color: C.neon, up: true },
      { label: 'AI EdTech Share', value: '28%', color: C.info, up: true },
      { label: 'Mobile-First Users', value: '67%', color: C.warning, up: true },
      { label: 'Dropout Rate (MOOCs)', value: '92%', color: C.danger, up: false },
    ],
    keyDrivers: [
      { driver: 'AI Personalization', impact: 88 },
      { driver: 'Gamification', impact: 72 },
      { driver: 'Govt Digital Push', impact: 65 },
      { driver: 'Upskilling Demand', impact: 91 },
      { driver: 'Rural Connectivity', impact: 54 },
    ],
    insight: 'EdTech is forecasted to reach $551B by 2029. AI-powered learning and government digital education mandates are primary tailwinds. India alone has 580M internet users making Asia-Pacific the fastest growing region.',
  },
  healthtech: {
    label: 'HealthTech',
    color: C.danger,
    globalMarketSize: [
      { year: '2021', value: 145, label: 'Pre-pandemic' },
      { year: '2022', value: 197, label: 'Pandemic surge' },
      { year: '2023', value: 248, label: 'Telehealth boom' },
      { year: '2024', value: 280, label: 'Normalization' },
      { year: '2025', value: 319, label: 'AI diagnostics' },
      { year: '2026', value: 371, label: 'Current' },
      { year: '2027 (proj)', value: 432, label: 'Projected', projected: true },
      { year: '2028 (proj)', value: 503, label: 'Projected', projected: true },
      { year: '2029 (proj)', value: 584, label: 'Projected', projected: true },
    ],
    fundingShare: [
      { name: 'Private VC', value: 45, color: C.danger },
      { name: 'Govt Healthcare', value: 25, color: C.neon },
      { name: 'Philanthropy (WHO/Gates)', value: 16, color: C.warning },
      { name: 'Hospital Systems', value: 9, color: C.info },
      { name: 'Insurance', value: 5, color: C.purple },
    ],
    regionShare: [
      { region: 'North America', share: 42, growth: '+16%' },
      { region: 'Europe', share: 24, growth: '+18%' },
      { region: 'Asia Pacific', share: 21, growth: '+32%' },
      { region: 'Middle East', share: 8, growth: '+28%' },
      { region: 'Africa', share: 5, growth: '+51%' },
    ],
    trendMetrics: [
      { label: 'CAGR (2026–30)', value: '15.8%', color: C.neon, up: true },
      { label: 'AI Diagnostics Share', value: '34%', color: C.info, up: true },
      { label: 'Telehealth Adoption', value: '76%', color: C.warning, up: true },
      { label: 'Data Breach Risk', value: 'High', color: C.danger, up: false },
    ],
    keyDrivers: [
      { driver: 'AI Diagnostics', impact: 92 },
      { driver: 'Wearables & IoT', impact: 78 },
      { driver: 'Aging Population', impact: 85 },
      { driver: 'Mental Health Apps', impact: 67 },
      { driver: 'Universal Healthcare Push', impact: 71 },
    ],
    insight: 'HealthTech is accelerating toward $584B by 2029. AI diagnostics, telemedicine, and wearables are reshaping primary care globally. Regulatory clarity remains a challenge but India\'s ABDM digital health infrastructure is creating a blueprint.',
  },
  climatetech: {
    label: 'ClimateTech',
    color: C.neon,
    globalMarketSize: [
      { year: '2021', value: 265, label: 'Paris commitments' },
      { year: '2022', value: 290, label: 'Green recovery push' },
      { year: '2023', value: 347, label: 'COP26 momentum' },
      { year: '2024', value: 410, label: 'ESG surge' },
      { year: '2025', value: 489, label: 'Net zero pledges' },
      { year: '2026', value: 586, label: 'Current' },
      { year: '2027 (proj)', value: 698, label: 'Projected', projected: true },
      { year: '2028 (proj)', value: 831, label: 'Projected', projected: true },
      { year: '2029 (proj)', value: 989, label: 'Projected', projected: true },
    ],
    fundingShare: [
      { name: 'Private VC/PE', value: 38, color: C.neon },
      { name: 'Govt Green Funds', value: 28, color: C.info },
      { name: 'Development Banks', value: 18, color: C.warning },
      { name: 'Carbon Market', value: 10, color: C.ember },
      { name: 'Philanthropy', value: 6, color: C.purple },
    ],
    regionShare: [
      { region: 'Europe', share: 35, growth: '+22%' },
      { region: 'North America', share: 28, growth: '+19%' },
      { region: 'Asia Pacific', share: 24, growth: '+41%' },
      { region: 'Middle East', share: 8, growth: '+55%' },
      { region: 'Africa', share: 5, growth: '+38%' },
    ],
    trendMetrics: [
      { label: 'CAGR (2026–30)', value: '19.2%', color: C.neon, up: true },
      { label: 'Carbon Market Size', value: '$909B', color: C.info, up: true },
      { label: 'EV Adoption Rate', value: '32%', color: C.warning, up: true },
      { label: 'Greenwashing Risk', value: 'High', color: C.danger, up: false },
    ],
    keyDrivers: [
      { driver: 'Net Zero Mandates', impact: 95 },
      { driver: 'Carbon Credits', impact: 81 },
      { driver: 'Solar & Wind Scale', impact: 88 },
      { driver: 'Climate Finance Push', impact: 76 },
      { driver: 'Consumer ESG Demand', impact: 69 },
    ],
    insight: 'ClimateTech is the fastest-growing startup sector globally, projected to reach nearly $1T by 2029. Net-zero mandates, carbon markets, and accelerating renewable deployment are creating massive tailwinds for early-stage ventures.',
  },
  fintech: {
    label: 'FinTech',
    color: C.warning,
    globalMarketSize: [
      { year: '2021', value: 179, label: 'Pre-COVID baseline' },
      { year: '2022', value: 210, label: 'Digital payments surge' },
      { year: '2023', value: 264, label: 'DeFi & crypto wave' },
      { year: '2024', value: 312, label: 'BNPL expansion' },
      { year: '2025', value: 374, label: 'Embedded finance' },
      { year: '2026', value: 447, label: 'Current' },
      { year: '2027 (proj)', value: 524, label: 'Projected', projected: true },
      { year: '2028 (proj)', value: 614, label: 'Projected', projected: true },
      { year: '2029 (proj)', value: 718, label: 'Projected', projected: true },
    ],
    fundingShare: [
      { name: 'Private VC', value: 56, color: C.warning },
      { name: 'Bank Partnerships', value: 22, color: C.info },
      { name: 'Govt Sandbox Programs', value: 11, color: C.neon },
      { name: 'Strategic Investors', value: 8, color: C.ember },
      { name: 'Crowdfunding', value: 3, color: C.purple },
    ],
    regionShare: [
      { region: 'Asia Pacific', share: 40, growth: '+29%' },
      { region: 'North America', share: 28, growth: '+12%' },
      { region: 'Europe', share: 19, growth: '+21%' },
      { region: 'Africa', share: 8, growth: '+64%' },
      { region: 'Latin America', share: 5, growth: '+37%' },
    ],
    trendMetrics: [
      { label: 'CAGR (2026–30)', value: '12.6%', color: C.neon, up: true },
      { label: 'UPI Transactions/Day', value: '500M+', color: C.info, up: true },
      { label: 'CBDC Pilots Active', value: '130+', color: C.warning, up: true },
      { label: 'Fraud Losses (annual)', value: '$485B', color: C.danger, up: false },
    ],
    keyDrivers: [
      { driver: 'UPI/Instant Payments', impact: 94 },
      { driver: 'BNPL Adoption', impact: 73 },
      { driver: 'Open Banking APIs', impact: 80 },
      { driver: 'Credit Access Gap', impact: 87 },
      { driver: 'CBDC Development', impact: 61 },
    ],
    insight: 'FinTech is disrupting traditional banking from payments to credit. India leads globally with 500M+ daily UPI transactions. Africa is the fastest-growing region with 64% YoY growth driven by mobile-first banking. Open banking and embedded finance are the next frontiers.',
  },
  agritech: {
    label: 'AgriTech',
    color: '#84cc16',
    globalMarketSize: [
      { year: '2021', value: 18, label: 'Early adoption' },
      { year: '2022', value: 22, label: 'Supply chain disruption' },
      { year: '2023', value: 28, label: 'Precision farming' },
      { year: '2024', value: 36, label: 'Climate urgency' },
      { year: '2025', value: 47, label: 'Drone & IoT scale' },
      { year: '2026', value: 61, label: 'Current' },
      { year: '2027 (proj)', value: 80, label: 'Projected', projected: true },
      { year: '2028 (proj)', value: 103, label: 'Projected', projected: true },
      { year: '2029 (proj)', value: 131, label: 'Projected', projected: true },
    ],
    fundingShare: [
      { name: 'Govt Agri Schemes', value: 35, color: '#84cc16' },
      { name: 'Private VC', value: 32, color: C.info },
      { name: 'Development Banks', value: 18, color: C.warning },
      { name: 'NGO/Philanthropy', value: 10, color: C.ember },
      { name: 'FPO Investments', value: 5, color: C.purple },
    ],
    regionShare: [
      { region: 'Asia Pacific', share: 45, growth: '+38%' },
      { region: 'North America', share: 24, growth: '+18%' },
      { region: 'Europe', share: 16, growth: '+22%' },
      { region: 'Africa', share: 10, growth: '+57%' },
      { region: 'Latin America', share: 5, growth: '+41%' },
    ],
    trendMetrics: [
      { label: 'CAGR (2026–30)', value: '21.1%', color: C.neon, up: true },
      { label: 'Drone Agri Coverage', value: '12M ha', color: C.info, up: true },
      { label: 'Precision Farm Adoption', value: '18%', color: C.warning, up: true },
      { label: 'Food Loss (post-harvest)', value: '30-40%', color: C.danger, up: false },
    ],
    keyDrivers: [
      { driver: 'Precision Farming', impact: 86 },
      { driver: 'Agri Drone Delivery', impact: 74 },
      { driver: 'FPO Digital Access', impact: 79 },
      { driver: 'Climate Resilience', impact: 91 },
      { driver: 'Cold Chain Tech', impact: 68 },
    ],
    insight: 'AgriTech is entering a transformational phase, with drones, IoT sensors, and AI-driven crop advisory reshaping smallholder farming. India\'s 140M farmers represent the world\'s largest addressable market for agricultural intelligence platforms.',
  },
  'social impact': {
    label: 'Social Impact',
    color: C.purple,
    globalMarketSize: [
      { year: '2021', value: 715, label: 'SDG baseline' },
      { year: '2022', value: 832, label: 'COVID response' },
      { year: '2023', value: 948, label: 'ESG integration' },
      { year: '2024', value: 1102, label: 'Impact investing' },
      { year: '2025', value: 1284, label: 'Blended finance' },
      { year: '2026', value: 1506, label: 'Current' },
      { year: '2027 (proj)', value: 1754, label: 'Projected', projected: true },
      { year: '2028 (proj)', value: 2041, label: 'Projected', projected: true },
      { year: '2029 (proj)', value: 2371, label: 'Projected', projected: true },
    ],
    fundingShare: [
      { name: 'Impact Investors', value: 34, color: C.purple },
      { name: 'Govt/DFI', value: 28, color: C.neon },
      { name: 'Philanthropy (BMGF etc)', value: 20, color: C.warning },
      { name: 'Corporate CSR', value: 12, color: C.info },
      { name: 'Crowdfunding', value: 6, color: C.ember },
    ],
    regionShare: [
      { region: 'Asia Pacific', share: 32, growth: '+28%' },
      { region: 'North America', share: 27, growth: '+14%' },
      { region: 'Europe', share: 22, growth: '+19%' },
      { region: 'Africa', share: 12, growth: '+42%' },
      { region: 'Latin America', share: 7, growth: '+33%' },
    ],
    trendMetrics: [
      { label: 'Impact Investing AUM', value: '$1.16T', color: C.neon, up: true },
      { label: 'SDG Financing Gap', value: '$4.2T/yr', color: C.danger, up: false },
      { label: 'Social Enterprises', value: '10M+', color: C.info, up: true },
      { label: 'Measurement Gap', value: 'Critical', color: C.warning, up: false },
    ],
    keyDrivers: [
      { driver: 'ESG Mandates', impact: 88 },
      { driver: 'SDG Alignment', impact: 81 },
      { driver: 'Blended Finance', impact: 74 },
      { driver: 'Impact Measurement', impact: 69 },
      { driver: 'Corporate Accountability', impact: 77 },
    ],
    insight: 'The global impact economy is converging with mainstream finance. Impact AUM has crossed $1.16T, driven by ESG mandates and SDG financing urgency. Social ventures that can demonstrate measurable outcomes are accessing capital at unprecedented scale.',
  },
}

/* ── Helper: get sector data ────────────────────────────────── */
function getSectorData(track) {
  const key = (track || '').toLowerCase()
  if (SECTOR_DATA[key]) return SECTOR_DATA[key]
  // Fuzzy match
  for (const k of Object.keys(SECTOR_DATA)) {
    if (key.includes(k) || k.includes(key)) return SECTOR_DATA[k]
  }
  return SECTOR_DATA['social impact'] // fallback
}

/* ── Custom chart tooltip ────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: '#e0e0e0', fontWeight: 600, fontFamily: 'JetBrains Mono', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || '#a0a0a0', fontFamily: 'JetBrains Mono', fontSize: 11, margin: '2px 0' }}>
          {p.name}: <strong>${p.value}B</strong>
          {p.payload?.label ? <span style={{ color: '#555', marginLeft: 8 }}>— {p.payload.label}</span> : null}
        </p>
      ))}
    </div>
  )
}

/* ── Metric card ─────────────────────────────────────────────── */
function MetricCard({ label, value, color, up }) {
  return (
    <div className="card rounded-xl p-4 space-y-2 border border-border">
      <div className="label text-xs">{label}</div>
      <div className="flex items-center gap-2">
        <span className="font-head font-bold text-xl" style={{ color }}>{value}</span>
        {up !== undefined && (
          up ? <TrendingUp className="w-4 h-4 text-neon" /> : <TrendingDown className="w-4 h-4 text-danger" />
        )}
      </div>
    </div>
  )
}

/* ── Pie label ───────────────────────────────────────────────── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return (
    <text x={x} y={y} fill="#e0e0e0" textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontFamily="JetBrains Mono" fontWeight={600}>
      {value}%
    </text>
  )
}

/* ── Tab button ──────────────────────────────────────────────── */
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
        active ? 'bg-neon/10 text-neon border border-neon/20' : 'text-muted hover:text-ink hover:bg-elevated border border-transparent'
      }`}
    >
      {children}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function GlobalTrends({ venture }) {
  const [tab, setTab] = useState('market')
  const sd = useMemo(() => getSectorData(venture?.track), [venture?.track])

  const historicalData = sd.globalMarketSize.filter(d => !d.projected)
  const projectedData  = sd.globalMarketSize.filter(d => d.projected)
  const allData        = sd.globalMarketSize

  const currentVal  = historicalData[historicalData.length - 1]?.value
  const projFinal   = projectedData[projectedData.length - 1]?.value
  const growthPct   = currentVal && projFinal ? (((projFinal - currentVal) / currentVal) * 100).toFixed(0) : 0

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center">
            <Globe className="w-6 h-6 text-neon" />
          </div>
          <div>
            <h2 className="font-head font-bold text-2xl text-ink">Global Trends</h2>
            <p className="text-sm text-muted">
              {sd.label} sector · Historical data, current benchmarks & future projections
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-elevated border border-border">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: sd.color }} />
          <span className="text-xs font-mono font-bold text-ink">{sd.label}</span>
          <span className="text-xs text-muted">Tracking sector for your venture</span>
        </div>
      </div>

      {/* Key insight banner */}
      <div className="rounded-2xl p-5 border" style={{ borderColor: sd.color + '30', background: sd.color + '08' }}>
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: sd.color }} />
          <div>
            <div className="text-xs font-semibold font-mono mb-1" style={{ color: sd.color }}>SECTOR INTELLIGENCE</div>
            <p className="text-sm text-ink/90 leading-relaxed">{sd.insight}</p>
          </div>
        </div>
      </div>

      {/* Quick metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sd.trendMetrics.map(m => (
          <MetricCard key={m.label} label={m.label} value={m.value} color={m.color} up={m.up} />
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        <TabBtn active={tab === 'market'} onClick={() => setTab('market')}>
          Market Size & Projections
        </TabBtn>
        <TabBtn active={tab === 'funding'} onClick={() => setTab('funding')}>
          Funding Landscape
        </TabBtn>
        <TabBtn active={tab === 'region'} onClick={() => setTab('region')}>
          Regional Analysis
        </TabBtn>
        <TabBtn active={tab === 'drivers'} onClick={() => setTab('drivers')}>
          Growth Drivers
        </TabBtn>
      </div>

      {/* ── Tab: market size ─────────────────────────────────── */}
      {tab === 'market' && (
        <motion.div
          key="market"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Main trend chart */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-head font-semibold text-base text-ink">{sd.label} Global Market Size</div>
                <div className="text-xs text-muted mt-0.5">Historical (2021–2026) + Future Projections (2027–2029) · Billions USD</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded" style={{ background: sd.color }} />
                  <span className="text-xs text-muted">Historical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: sd.color }} />
                  <span className="text-xs text-muted">Projected</span>
                </div>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={allData} margin={{ left: -10, right: 10 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={sd.color} stopOpacity={0.3} />
                      <stop offset="80%" stopColor={sd.color} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={sd.color} stopOpacity={0.15} />
                      <stop offset="80%" stopColor={sd.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="year" stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono"
                    tickFormatter={v => `$${v}B`} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine x="2026" stroke={C.muted} strokeDasharray="4 2" label={{ value: 'NOW', fill: C.muted, fontSize: 9, fontFamily: 'JetBrains Mono' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sd.color}
                    fill="url(#trendGrad)"
                    strokeWidth={2.5}
                    dot={(props) => {
                      const isProj = props.payload?.projected
                      return (
                        <circle
                          key={props.index}
                          cx={props.cx} cy={props.cy} r={isProj ? 3 : 5}
                          fill={isProj ? '#1a1a1a' : sd.color}
                          stroke={sd.color}
                          strokeWidth={isProj ? 2 : 0}
                          strokeDasharray={isProj ? '3 2' : '0'}
                        />
                      )
                    }}
                    strokeDasharray={(d) => d?.projected ? '5 4' : '0'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Growth callout */}
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-6 flex-wrap">
              <div>
                <div className="label">Current Market (2026)</div>
                <div className="font-head font-bold text-2xl text-ink">${currentVal}B</div>
              </div>
              <div>
                <div className="label">Projected Market (2029)</div>
                <div className="font-head font-bold text-2xl" style={{ color: sd.color }}>${projFinal}B</div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: sd.color + '12', border: `1px solid ${sd.color}25` }}>
                <TrendingUp className="w-4 h-4" style={{ color: sd.color }} />
                <span className="font-mono font-bold text-lg" style={{ color: sd.color }}>+{growthPct}%</span>
                <span className="text-xs text-muted">total growth by 2029</span>
              </div>
            </div>
          </div>

          {/* Historical vs Projected bar comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card rounded-2xl p-6">
              <div className="font-head font-semibold text-sm text-ink mb-1">Historical Growth</div>
              <div className="text-xs text-muted mb-4">2021 → 2026 actual market data</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="year" stroke={C.muted} fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                    <YAxis stroke={C.muted} fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono"
                      tickFormatter={v => `$${v}B`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v}B`, 'Market Size']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={sd.color} fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card rounded-2xl p-6">
              <div className="font-head font-semibold text-sm text-ink mb-1">Future Projections</div>
              <div className="text-xs text-muted mb-4">2027 → 2029 analyst consensus projections</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectedData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="year" stroke={C.muted} fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                    <YAxis stroke={C.muted} fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono"
                      tickFormatter={v => `$${v}B`} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v}B`, 'Projected Size']} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={sd.color} fillOpacity={0.4}
                      stroke={sd.color} strokeWidth={1.5} strokeDasharray="4 2" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tab: funding landscape ───────────────────────────── */}
      {tab === 'funding' && (
        <motion.div
          key="funding"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funding pie */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieIcon className="w-4 h-4 text-warning" />
                <div>
                  <div className="font-head font-semibold text-sm text-ink">Funding Source Breakdown</div>
                  <div className="text-xs text-muted">Who's backing {sd.label} globally</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-56 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sd.fundingShare} cx="50%" cy="50%"
                        innerRadius={40} outerRadius={80}
                        dataKey="value" labelLine={false} label={PieLabel}>
                        {sd.fundingShare.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 pr-1 min-w-0">
                  {sd.fundingShare.map((d, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                      <div className="min-w-0">
                        <div className="text-xs text-ink font-medium truncate">{d.name}</div>
                        <div className="text-xs font-mono font-bold" style={{ color: d.color }}>{d.value}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NGO vs Private vs Govt stacked */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4 text-info" />
                <div>
                  <div className="font-head font-semibold text-sm text-ink">Funding Channel Comparison</div>
                  <div className="text-xs text-muted">% split across source types</div>
                </div>
              </div>
              <div className="space-y-4 mt-2">
                {[
                  { label: 'Private / VC', value: sd.fundingShare[0].value, color: sd.fundingShare[0].color },
                  { label: 'Government / DFI', value: sd.fundingShare[1]?.value || 0, color: sd.fundingShare[1]?.color || C.neon },
                  { label: 'NGO / Philanthropy', value: sd.fundingShare[2]?.value || 0, color: sd.fundingShare[2]?.color || C.ember },
                  { label: 'Corporate / Other', value: (sd.fundingShare[3]?.value || 0) + (sd.fundingShare[4]?.value || 0), color: C.muted },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-muted font-mono">{item.label}</span>
                      <span className="text-xs font-bold font-mono" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="h-2 bg-elevated rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 rounded-xl bg-elevated border border-border">
                <p className="text-xs text-muted leading-relaxed">
                  💡 <strong className="text-ink">Insight:</strong> Blended finance (combining govt + private + NGO capital) is the fastest-growing approach for {sd.label} ventures, reducing individual funding risk.
                </p>
              </div>
            </div>
          </div>

          {/* SDG alignment banner */}
          <div className="card rounded-2xl p-5">
            <div className="label mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              SDG Alignment for {sd.label}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { sdg: 'SDG 4', label: 'Quality Education', relevant: ['edtech', 'social impact'].some(s => sd.label.toLowerCase().includes(s)) },
                { sdg: 'SDG 3', label: 'Good Health', relevant: ['healthtech', 'social impact'].some(s => sd.label.toLowerCase().includes(s)) },
                { sdg: 'SDG 13', label: 'Climate Action', relevant: ['climatetech', 'agritech'].some(s => sd.label.toLowerCase().includes(s)) },
                { sdg: 'SDG 8', label: 'Decent Work & Growth', relevant: true },
              ].map(s => (
                <div key={s.sdg} className={`rounded-xl p-3 text-center border ${s.relevant ? 'border-neon/20 bg-neon/5' : 'border-border bg-elevated opacity-40'}`}>
                  <div className="font-mono font-bold text-xs text-neon mb-1">{s.sdg}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                  {s.relevant && <div className="mt-1.5 w-2 h-2 rounded-full bg-neon mx-auto" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tab: regional analysis ───────────────────────────── */}
      {tab === 'region' && (
        <motion.div
          key="region"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Region bar chart */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-info" />
                <div>
                  <div className="font-head font-semibold text-sm text-ink">Market Share by Region</div>
                  <div className="text-xs text-muted">% of global {sd.label} market</div>
                </div>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sd.regionShare} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                    <XAxis type="number" stroke={C.muted} fontSize={9} tickLine={false} axisLine={false}
                      fontFamily="JetBrains Mono" tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="region" stroke={C.muted} fontSize={9} tickLine={false}
                      axisLine={false} fontFamily="JetBrains Mono" width={90} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Market Share']} />
                    <Bar dataKey="share" radius={[0, 4, 4, 0]} fill={sd.color} fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Region growth rates */}
            <div className="card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-neon" />
                <div>
                  <div className="font-head font-semibold text-sm text-ink">YoY Growth Rates</div>
                  <div className="text-xs text-muted">Regional growth velocity (2025–2026)</div>
                </div>
              </div>
              <div className="space-y-4">
                {sd.regionShare.map((r, i) => {
                  const growth = parseInt(r.growth)
                  const isHigh = growth > 30
                  return (
                    <div key={i} className="flex items-center gap-4">
                      <div className="text-xs text-muted font-mono w-28 flex-shrink-0">{r.region}</div>
                      <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(growth, 70)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: isHigh ? C.neon : sd.color }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold w-12 text-right"
                        style={{ color: isHigh ? C.neon : C.muted }}>{r.growth}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-elevated border border-border">
                <p className="text-xs text-muted leading-relaxed">
                  🌍 Emerging markets (Africa, Latin America) show disproportionate growth due to late-adoption curves and mobile-first demographics.
                </p>
              </div>
            </div>
          </div>

          {/* Your venture's geography context */}
          {venture?.geography && (
            <div className="card rounded-2xl p-5 border border-neon/15" style={{ background: '#00ea640a' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-neon" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-neon mb-1 font-mono">YOUR VENTURE GEOGRAPHY</div>
                  <div className="font-head font-semibold text-base text-ink mb-1">{venture.geography}</div>
                  <p className="text-xs text-muted leading-relaxed">
                    Based on your venture's geography and the {sd.label} regional trends above, assess how your local market aligns with global growth patterns. Regions with high growth rates signal strong tailwinds but also increased competition.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: growth drivers ──────────────────────────────── */}
      {tab === 'drivers' && (
        <motion.div
          key="drivers"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-4 h-4 text-neon" />
              <div>
                <div className="font-head font-semibold text-sm text-ink">Top Growth Drivers — {sd.label}</div>
                <div className="text-xs text-muted">Impact score out of 100 (industry consensus)</div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sd.keyDrivers} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="driver" stroke={C.muted} fontSize={9} tickLine={false} axisLine={false}
                    fontFamily="JetBrains Mono" interval={0} tick={{ fill: C.muted }} />
                  <YAxis stroke={C.muted} fontSize={9} tickLine={false} axisLine={false}
                    fontFamily="JetBrains Mono" domain={[0, 100]} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${v}/100`, 'Impact Score']} />
                  <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                    {sd.keyDrivers.map((d, i) => (
                      <Cell key={i} fill={d.impact >= 85 ? C.neon : d.impact >= 70 ? sd.color : C.muted} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Driver detail cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
              {sd.keyDrivers.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-elevated border border-border">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm"
                      style={{
                        background: d.impact >= 85 ? C.neon + '20' : sd.color + '15',
                        color: d.impact >= 85 ? C.neon : sd.color,
                        border: `2px solid ${d.impact >= 85 ? C.neon : sd.color}30`
                      }}>
                      {d.impact}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-ink">{d.driver}</div>
                    <div className="text-[10px] text-muted">
                      {d.impact >= 85 ? '🔥 Critical driver' : d.impact >= 70 ? '📈 Strong driver' : '📊 Moderate driver'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global comparison vs your venture */}
          {venture && (
            <div className="card rounded-2xl p-6">
              <div className="label mb-4 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Your Venture vs Global {sd.label} Benchmarks
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Impact Score',
                    yours: venture.impactScore || 0,
                    global: 58,
                    color: C.neon,
                    unit: '%',
                  },
                  {
                    label: 'Community Trust',
                    yours: venture.communityTrust || 50,
                    global: 62,
                    color: C.warning,
                    unit: '%',
                  },
                  {
                    label: 'Capital Health',
                    yours: Math.round(((venture.credits || 0) / (venture.startingCredits || 50000)) * 100),
                    global: 72,
                    color: C.ember,
                    unit: '% of start',
                  },
                ].map(m => (
                  <div key={m.label} className="space-y-3 p-4 rounded-xl bg-elevated border border-border">
                    <div className="label">{m.label}</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted">Your Venture</span>
                          <span className="text-xs font-mono font-bold" style={{ color: m.color }}>{m.yours}{m.unit}</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${m.yours}%` }}
                            transition={{ duration: 0.8 }} className="h-full rounded-full"
                            style={{ background: m.color }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-[10px] text-muted">Global Avg</span>
                          <span className="text-xs font-mono text-muted">{m.global}{m.unit}</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <div className="h-full rounded-full opacity-30" style={{ width: `${m.global}%`, background: m.color }} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 pt-1">
                        {m.yours >= m.global
                          ? <><TrendingUp className="w-3 h-3 text-neon" /><span className="text-[10px] text-neon">Above global avg</span></>
                          : <><TrendingDown className="w-3 h-3 text-danger" /><span className="text-[10px] text-danger">Below global avg</span></>
                        }
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
