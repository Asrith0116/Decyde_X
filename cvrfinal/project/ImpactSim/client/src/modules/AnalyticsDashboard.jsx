import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'
import { Activity, TrendingUp, Target, DollarSign, Users, Zap, BarChart2, PieChart as PieIcon } from 'lucide-react'
import { MetricRing } from '../components/UI'

/* ── Color palette ─────────────────────────────────────────── */
const C = {
  neon:    '#00ea64',
  ember:   '#ff6b2b',
  info:    '#3b82f6',
  warning: '#f59e0b',
  danger:  '#ef4444',
  muted:   '#6b6b6b',
  border:  '#252525',
  card:    '#1c1c1c',
}

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle:   { color: '#e0e0e0', fontWeight: 600 },
  itemStyle:    { color: '#a0a0a0' },
}

/* ── Section header ─────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title, sub, iconColor = 'text-neon' }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-9 h-9 rounded-xl bg-elevated border border-border flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div>
        <div className="font-head font-semibold text-base text-ink">{title}</div>
        {sub && <div className="text-xs text-muted">{sub}</div>}
      </div>
    </div>
  )
}

/* ── Custom pie label ───────────────────────────────────────── */
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return (
    <text x={x} y={y} fill="#e0e0e0" textAnchor="middle" dominantBaseline="central"
      fontSize={10} fontFamily="JetBrains Mono, monospace" fontWeight={600}>
      {value}%
    </text>
  )
}

/* ── No-data placeholder ────────────────────────────────────── */
function NoData({ message = 'Play Mission Control to populate charts' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center opacity-50">
      <BarChart2 className="w-10 h-10 text-muted" />
      <p className="text-sm text-muted leading-relaxed max-w-xs">{message}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function AnalyticsDashboard({ venture }) {
  const history = venture?.history || []
  const hasData = history.length > 0
  const weeksPlayed = Math.min(10, venture?.week || history.length || 0)

  /* ── Derive chart data ────────────────────────────────────── */
  const trajectoryData = useMemo(() => {
    if (!hasData) return []
    let impact = 0, trust = 50, capital = venture.startingCredits || 50000
    return history.map((h, i) => {
      impact  = Math.max(0, Math.min(100, impact  + (h.impacts?.impactScore    || 0)))
      trust   = Math.max(0, Math.min(100, trust   + (h.impacts?.communityTrust || 0)))
      capital = Math.max(0, capital + (h.impacts?.credits || 0) - (venture.burnRate || 2500))
      return {
        week:    `W${i + 1}`,
        Impact:  Math.round(impact),
        Trust:   Math.round(trust),
        Capital: Math.round(capital / 1000),   // in $K
      }
    })
  }, [history, venture])

  const capitalDeltaData = useMemo(() => history.map((h, i) => ({
    week:  `W${i + 1}`,
    delta: h.impacts?.credits || 0,
    fill:  (h.impacts?.credits || 0) >= 0 ? C.neon : C.danger,
  })), [history])

  const alignmentPieData = useMemo(() => {
    if (!hasData) return []
    let matched = 0, partial = 0, offtrack = 0
    history.forEach(h => {
      const isMatch   = (h.userChoice || '').toLowerCase() === (h.expertPreferred || '').toLowerCase()
      const isPositive = (h.impacts?.impactScore || 0) > 0 || (h.impacts?.communityTrust || 0) > 0
      if (isMatch)       matched++
      else if (isPositive) partial++
      else               offtrack++
    })
    const t = history.length
    return [
      { name: 'Expert Match',  value: Math.round((matched  / t) * 100), color: C.neon },
      { name: 'Partially Right', value: Math.round((partial  / t) * 100), color: C.ember },
      { name: 'Off-Track',     value: Math.round((offtrack / t) * 100), color: C.danger },
    ].filter(d => d.value > 0)
  }, [history])

  const capitalBreakdownPie = useMemo(() => {
    if (!hasData) return []
    let gained = 0, burned = 0, lost = 0
    history.forEach(h => {
      const d = h.impacts?.credits || 0
      if (d > 0) gained += d
      if (d < 0) lost    += Math.abs(d)
      burned += (venture.burnRate || 2500)
    })
    const total = gained + lost + burned || 1
    return [
      { name: 'Revenue/Grants',  value: Math.round((gained / total) * 100), color: C.neon },
      { name: 'Decision Costs',  value: Math.round((lost   / total) * 100), color: C.danger },
      { name: 'Burn Rate',       value: Math.round((burned / total) * 100), color: C.ember },
    ].filter(d => d.value > 0)
  }, [history, venture])

  const radarData = useMemo(() => {
    const avg = (key) => hasData
      ? history.reduce((s, h) => s + Math.abs(h.impacts?.[key] || 0), 0) / history.length
      : 0
    return [
      { metric: 'Impact',   value: Math.round(venture?.impactScore      || 0), max: 100 },
      { metric: 'Trust',    value: Math.round(venture?.communityTrust   || 50), max: 100 },
      { metric: 'Capital',  value: Math.min(100, Math.round(((venture?.credits || 0) / (venture?.startingCredits || 50000)) * 100)), max: 100 },
      { metric: 'XP',       value: Math.min(100, Math.round(((venture?.xp || 0) / 500) * 100)), max: 100 },
      { metric: 'Decisions',value: history.length * 10, max: 100 },
    ]
  }, [history, venture])

  /* ── Stats summary ────────────────────────────────────────── */
  const expertMatches  = history.filter(h =>
    (h.userChoice || '').toLowerCase() === (h.expertPreferred || '').toLowerCase()
  ).length
  const totalCapitalGain = history.reduce((s, h) => s + (h.impacts?.credits || 0), 0)
  const alignPct = hasData ? Math.round((expertMatches / history.length) * 100) : 0

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-neon" />
          </div>
          <div>
            <h2 className="font-head font-semibold text-xl text-ink">Analytics</h2>
            <p className="text-sm text-muted">Real-time simulation performance dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span className="text-xs text-neon font-mono">
            {hasData ? `${weeksPlayed}/10 weeks played` : 'No data yet'}
          </span>
        </div>
      </div>

      {/* ── Metric rings row ─────────────────────────────────── */}
      <div className="card rounded-2xl p-6">
        <div className="label mb-5">Performance Overview</div>
        <div className="flex flex-wrap items-center justify-around gap-6">
          <MetricRing value={venture?.impactScore || 0}  color={C.neon}    label="Market Impact"    sublabel="%" />
          <MetricRing value={venture?.communityTrust || 50} color={C.warning} label="Community Trust" sublabel="%" />
          <MetricRing value={alignPct}              color={C.info}    label="Expert Alignment" sublabel="% match" />
          <MetricRing value={Math.min(100, Math.round(((venture?.credits || 0) / (venture?.startingCredits || 50000)) * 100))}
                      color={C.ember} label="Capital Health"  sublabel="% of start" />
          <MetricRing value={weeksPlayed * 10}   color={C.neon}    label="Simulation"       sublabel={`${weeksPlayed}/10`} size={72} />
        </div>
      </div>

      {/* ── Trajectory line chart ──────────────────────────── */}
      <div className="card rounded-2xl p-6">
        <SectionHeader icon={TrendingUp} title="Trajectory Analysis" sub="Impact, Trust & Capital over 10 weeks" />
        {hasData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ left: -10 }}>
                <defs>
                  {[['impact', C.neon], ['trust', C.warning], ['capital', C.ember]].map(([k, col]) => (
                    <linearGradient key={k} id={`g_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={col} stopOpacity={0.25} />
                      <stop offset="90%" stopColor={col} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="week" stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                <YAxis stroke={C.muted} fontSize={10} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                <Tooltip {...TOOLTIP_STYLE}
                  formatter={(v, name) => [name === 'Capital' ? `$${v}K` : `${v}%`, name]} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono', paddingTop: 8 }} />
                <Area type="monotone" dataKey="Impact"  stroke={C.neon}    fill={`url(#g_impact)`}  strokeWidth={2.5} dot={{ r: 4, fill: C.neon,    strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Trust"   stroke={C.warning} fill={`url(#g_trust)`}   strokeWidth={2.5} dot={{ r: 4, fill: C.warning, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="Capital" stroke={C.ember}   fill={`url(#g_capital)`} strokeWidth={2}   dot={{ r: 3, fill: C.ember,   strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <NoData />}
      </div>

      {/* ── Bar chart + Alignment pie ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly capital delta */}
        <div className="card rounded-2xl p-6">
          <SectionHeader icon={DollarSign} title="Weekly Capital Δ" sub="Revenue/loss per decision" iconColor="text-ember" />
          {hasData ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={capitalDeltaData} margin={{ left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="week" stroke={C.muted} fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                  <YAxis stroke={C.muted} fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono"
                    tickFormatter={v => v >= 0 ? `+$${(v/1000).toFixed(0)}K` : `-$${(Math.abs(v)/1000).toFixed(0)}K`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v >= 0 ? '+' : ''}$${v.toLocaleString()}`, 'Capital Δ']} />
                  <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 4" />
                  <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
                    {capitalDeltaData.map((d, i) => (
                      <Cell key={i} fill={d.fill} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <NoData message="Make decisions in Mission Control to see capital flow" />}
        </div>

        {/* Alignment pie */}
        <div className="card rounded-2xl p-6">
          <SectionHeader icon={Target} title="Decision Alignment" sub="How close you were to expert choices" iconColor="text-info" />
          {hasData && alignmentPieData.length ? (
            <div className="flex items-center gap-6">
              <div className="h-52 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={alignmentPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={78}
                      dataKey="value" labelLine={false} label={PieLabel}>
                      {alignmentPieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [`${v}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 pr-2">
                {alignmentPieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <div>
                      <div className="text-xs text-ink font-medium">{d.name}</div>
                      <div className="text-xs font-mono font-bold" style={{ color: d.color }}>{d.value}%</div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted">Expert matches</div>
                  <div className="font-mono text-base font-bold text-neon">{expertMatches}/{history.length}</div>
                </div>
              </div>
            </div>
          ) : <NoData />}
        </div>
      </div>

      {/* ── Capital breakdown pie + Radar ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capital breakdown */}
        <div className="card rounded-2xl p-6">
          <SectionHeader icon={PieIcon} title="Capital Breakdown" sub="Where your money went" iconColor="text-warning" />
          {hasData ? (
            <div className="flex items-center gap-6">
              <div className="h-52 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={capitalBreakdownPie} cx="50%" cy="50%" outerRadius={80}
                      dataKey="value" labelLine={false} label={PieLabel}>
                      {capitalBreakdownPie.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
                    </Pie>
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v, name) => [`${v}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 pr-2">
                {capitalBreakdownPie.map((d, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <div>
                      <div className="text-xs text-ink font-medium">{d.name}</div>
                      <div className="text-xs font-mono font-bold" style={{ color: d.color }}>{d.value}%</div>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted">Net capital flow</div>
                  <div className={`font-mono text-base font-bold ${totalCapitalGain >= 0 ? 'text-neon' : 'text-danger'}`}>
                    {totalCapitalGain >= 0 ? '+' : ''}${totalCapitalGain.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ) : <NoData message="Financial data appears after your first decision" />}
        </div>

        {/* Venture health radar */}
        <div className="card rounded-2xl p-6">
          <SectionHeader icon={Activity} title="Venture Health Radar" sub="Multi-dimensional performance" iconColor="text-neon" />
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={C.border} />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: C.muted, fontFamily: 'JetBrains Mono' }} />
                <Radar name="Score" dataKey="value" stroke={C.neon}
                  fill={C.neon} fillOpacity={0.15} strokeWidth={2}
                  dot={{ r: 4, fill: C.neon, strokeWidth: 0 }} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v}`, 'Score']} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Summary stat chips ─────────────────────────────── */}
      <div className="card rounded-2xl p-5">
        <div className="label mb-4">Session Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Weeks Played',      value: `${weeksPlayed}/10`,                             color: 'text-ink' },
            { label: 'Expert Alignment',  value: `${alignPct}%`,                                  color: alignPct > 60 ? 'text-neon' : 'text-danger' },
            { label: 'Net Capital Flow',  value: `${totalCapitalGain >= 0 ? '+' : ''}$${(totalCapitalGain/1000).toFixed(1)}K`, color: totalCapitalGain >= 0 ? 'text-neon' : 'text-danger' },
            { label: 'XP Earned',         value: `${venture?.xp || 0} pts`,                       color: 'text-ember' },
          ].map(({ label, value, color }) => (
            <div key={label} className="space-y-1.5 p-4 rounded-xl bg-elevated border border-border">
              <div className="label">{label}</div>
              <div className={`font-head font-semibold text-2xl ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
