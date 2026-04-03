import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Stat in header bar ─────────────────────────────────────── */
export function StatHeader({ label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label">{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.2 }}
          className={`font-head font-semibold text-base tabular-nums ${color}`}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

/* ── Sidebar nav item with minimized tooltip ──────────────────── */
export function NavItem({ icon, label, active, onClick, disabled, minimized }) {
  const [showTip, setShowTip] = useState(false)

  return (
    <div className="relative" onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center gap-3.5 transition-all duration-200 relative group
          ${minimized ? 'justify-center px-0 py-3.5' : 'px-4 py-3.5'}
          ${disabled ? 'opacity-25 pointer-events-none' : ''}
          ${active
            ? 'text-neon bg-neon/15 rounded-xl shadow-sm'
            : 'text-muted hover:text-ink hover:bg-elevated rounded-xl'
          }`}
      >
        {active && (
          <motion.span
            layoutId="activeNav"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neon rounded-r-lg"
          />
        )}
        <span className={`flex-shrink-0 transition-transform group-hover:scale-110 ${minimized ? '' : 'ml-0.5'}`}>
          {React.cloneElement(icon, { className: "w-5 h-5 flex-shrink-0" })}
        </span>
        {!minimized && (
          <span className="text-sm font-semibold tracking-tight">{label}</span>
        )}
      </button>

      {/* Tooltip when minimized */}
      {minimized && showTip && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none"
        >
          <div className="bg-elevated border border-border rounded-xl px-4 py-2 text-sm text-ink whitespace-nowrap shadow-2xl font-bold border-l-neon border-l-2">
            {label}
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ── Venture health pillar ────────────────────────────────────── */
export function PillarItem({ label, value, active }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
      active ? 'border-neon/20 bg-neon/5' : 'border-border bg-surface'
    }`}>
      <span className="label">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-semibold ${active ? 'text-neon' : 'text-muted'}`}>{value}</span>
        {active && <span className="w-1.5 h-1.5 rounded-full bg-neon" />}
      </div>
    </div>
  )
}

/* ── SVG Metric Ring ──────────────────────────────────────────── */
export function MetricRing({ value, max = 100, size = 72, color = '#00ea64', label, sublabel }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(Math.max(value / max, 0), 1)
  const dash = circ * pct
  const gap  = circ - dash

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#252525" strokeWidth={6} />
          <motion.circle
            cx={size/2} cy={size/2} r={r}
            fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-xs text-ink">{value}</span>
        </div>
      </div>
      <span className="label text-center leading-tight">{label}</span>
      {sublabel && <span className="text-[9px] text-faint text-center">{sublabel}</span>}
    </div>
  )
}

/* ── SWOT Panel (colored sections) ──────────────────────────── */
export function SWOTPanel({ swot }) {
  if (!swot) return null
  const sections = [
    { key: 'strengths',    label: 'Strengths',    cls: 'swot-strength',    icon: '↑', color: 'text-neon' },
    { key: 'weaknesses',   label: 'Weaknesses',   cls: 'swot-weakness',    icon: '↓', color: 'text-danger' },
    { key: 'opportunities',label: 'Opportunities',cls: 'swot-opportunity', icon: '→', color: 'text-ember' },
    { key: 'threats',      label: 'Threats',      cls: 'swot-threat',      icon: '⚠', color: 'text-warning' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sections.map(({ key, label, cls, icon, color }) => (
        <div key={key} className={`rounded-xl p-4 space-y-2 ${cls}`}>
          <div className={`flex items-center gap-2 label ${color}`}>
            <span>{icon}</span>
            <span>{label}</span>
          </div>
          <ul className="space-y-1">
            {(swot[key] || []).map((item, i) => (
              <li key={i} className="text-xs text-ink/80 flex gap-2 items-start">
                <span className="mt-1 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
