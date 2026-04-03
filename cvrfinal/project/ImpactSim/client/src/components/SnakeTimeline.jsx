import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, Minus,
  Lightbulb, AlertTriangle, DollarSign, Star, Target, X,
  ChevronRight, ChevronLeft, BarChart2, Users, Activity, Shield
} from 'lucide-react'

/* ── Color helpers ──────────────────────────────────────────────── */
function nodeColor(step, isCurrent) {
  if (!step) {
    if (isCurrent) return { border: '#ff6b2b', bg: '#ff6b2b05', text: '#ff6b2b', glow: '0 0 10px #ff6b2b20', badge: 'current' }
    return { border: '#333', bg: '#1c1c1c', text: '#555', glow: 'none', badge: null }
  }
  const matched  = (step.userChoice || '').toLowerCase() === (step.expertPreferred || '').toLowerCase()
  const positive = (step.impacts?.impactScore || 0) > 0 || (step.impacts?.communityTrust || 0) > 0
  if (matched)  return { border: '#00ea64', bg: '#00ea6418', text: '#00ea64', glow: '0 0 14px #00ea6440', badge: 'green' }
  if (positive) return { border: '#ff6b2b', bg: '#ff6b2b15', text: '#ff6b2b', glow: '0 0 14px #ff6b2b30', badge: 'orange' }
  return              { border: '#ef4444', bg: '#ef444415', text: '#ef4444', glow: '0 0 14px #ef444430', badge: 'red' }
}

/* ── Delta tag ──────────────────────────────────────────────────── */
function DeltaTag({ value, prefix = '$', suffix = '', size = 'base' }) {
  if (value === undefined || value === null) return null
  const pos  = value > 0
  const zero = value === 0
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <span className={`inline-flex items-center gap-1 font-mono px-2.5 py-1 rounded-full font-semibold ${textSize}
      ${pos ? 'bg-neon/15 text-neon' : zero ? 'bg-elevated text-muted' : 'bg-danger/15 text-danger'}`}>
      {pos ? <TrendingUp className="w-3.5 h-3.5"/> : zero ? <Minus className="w-3.5 h-3.5"/> : <TrendingDown className="w-3.5 h-3.5"/>}
      {pos ? '+' : ''}{zero ? '—' : `${prefix}${prefix === '$' ? Math.abs(value).toLocaleString() : Math.abs(value)}${suffix}`}
    </span>
  )
}

/* ── Value Change Card ──────────────────────────────────────────── */
function ValueChangeCard({ label, before, after, prefix = '', suffix = '', icon: Icon, color }) {
  const delta = (after ?? 0) - (before ?? 0)
  const isDollar = prefix === '$'
  const fmt = (v) => isDollar ? `$${(v || 0).toLocaleString()}` : `${v || 0}${suffix}`

  return (
    <div className="rounded-xl bg-elevated border border-border p-4 space-y-3">
      <div className="flex items-center gap-2 label">
        {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
        {label}
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted">Before</span>
          <span className="font-mono text-xs text-muted">{fmt(before)}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full rounded-full opacity-30" style={{ width: `${Math.min((before || 0) / (isDollar ? 100000 : 100) * 100, 100)}%`, background: color }} />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold" style={{ color }}>After</span>
          <span className="font-mono text-xs font-bold" style={{ color }}>{fmt(after)}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((after || 0) / (isDollar ? 100000 : 100) * 100, 100)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
        <div className="flex justify-center pt-1">
          <DeltaTag value={delta} prefix={isDollar ? '$' : ''} suffix={suffix} size="sm" />
        </div>
      </div>
    </div>
  )
}

/* ── Single node button ─────────────────────────────────────────── */
function Node({ step, index, active, onClick, isCurrent }) {
  const c = nodeColor(step, isCurrent)
  return (
    <div className="flex flex-col items-center gap-1.5 relative" style={{ width: 64 }}>
      {isCurrent && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-[8px] font-bold text-ember uppercase tracking-tighter bg-ember/10 px-1 rounded">Current</span>
        </div>
      )}
      <motion.button
        whileHover={{ scale: (step || isCurrent) ? 1.12 : 1 }}
        whileTap={{ scale: (step || isCurrent) ? 0.93 : 1 }}
        onClick={() => (step || isCurrent) && onClick(index)}
        className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold font-mono text-sm transition-all"
        style={{
          border: `2px solid ${c.border}`,
          background: c.bg,
          color: c.text,
          boxShadow: active ? c.glow : isCurrent ? '0 0 10px #ff6b2b15' : 'none',
          cursor: (step || isCurrent) ? 'pointer' : 'default',
        }}
        title={step ? `Week ${index + 1}: ${step.scenarioTitle || ''} — click to expand` : isCurrent ? `Week ${index + 1} (In Progress) — click to view` : `Week ${index + 1} (not yet played)`}
      >
        {index + 1}
        {(active || isCurrent) && (
          <span className={`absolute inset-0 rounded-full animate-pulse opacity-20`}
            style={{ background: c.border }} />
        )}
      </motion.button>

      {step && (
        <div className="w-8 h-1 rounded-full overflow-hidden bg-elevated">
          <motion.div
            className="h-full rounded-full"
            style={{ background: c.border }}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: index * 0.07, duration: 0.45 }}
          />
        </div>
      )}

      {step && (
        <span className="text-[9px] font-mono text-center leading-tight px-1 truncate w-full"
          style={{ color: c.text }}>
          {(step.userChoice || '').split(' ').slice(0, 2).join(' ')}
        </span>
      )}
    </div>
  )
}

/* ── Connector arrows ───────────────────────────────────────────── */
function HConnector({ color, active, dir = 'right' }) {
  return (
    <div className="flex items-center flex-1 px-1 mt-[-18px]">
      {dir === 'left' && (
         <ChevronLeft className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`} 
         style={{ color: color || '#333' }} />
      )}
      <div className={`flex-1 h-[2px] transition-all duration-500 ${active ? 'opacity-100 shadow-[0_0_8px_rgba(255,107,43,0.3)]' : 'opacity-20'}`} 
        style={{ background: color || '#333' }} />
      {dir === 'right' && (
        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-20'}`} 
        style={{ color: color || '#333' }} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ══════════════════════════════════════════════════════════════════ */
export default function SnakeTimeline({ history = [], journeyTimeline = [] }) {
  const [active, setActive] = useState(null)
  const toggle = (i) => setActive(prev => prev === i ? null : i)

  // Pad to 10 slots
  const slots = Array.from({ length: 10 }, (_, i) => history[i] || null)

  // Snake: row 0 weeks 1–5 (left→right), row 1 weeks 6–10 (right→left, aligned under row 0)
  const row0 = slots.slice(0, 5)
  // Row 1 indices reversed visually so 10 is on left, 6 is on right (under 5)
  const row1Indices = [9, 8, 7, 6, 5]

  const activeStep    = active !== null ? history[active] : null
  const activeJourney = active !== null ? (journeyTimeline[active] || null) : null
  const aC            = activeStep ? nodeColor(activeStep) : null

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap">
        <span className="label">10-Week Journey:</span>
        <span className="flex items-center gap-1.5 text-xs text-neon"><span className="w-2.5 h-2.5 rounded-full bg-neon inline-block"/>Expert Match</span>
        <span className="flex items-center gap-1.5 text-xs text-ember"><span className="w-2.5 h-2.5 rounded-full bg-ember inline-block"/>Partially Right</span>
        <span className="flex items-center gap-1.5 text-xs text-danger"><span className="w-2.5 h-2.5 rounded-full bg-danger inline-block"/>Off-Track</span>
        <span className="flex items-center gap-1.5 text-xs text-muted"><span className="w-2.5 h-2.5 rounded-full border border-muted inline-block"/>Not Played</span>
        <span className="text-xs text-muted ml-auto italic">Click a number to see full details</span>
      </div>

      {/* ── Snake grid ── */}
      <div className="space-y-4 select-none px-4 py-8 rounded-2xl bg-surface/50 border border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
        
        {/* Row 0: weeks 1–5 */}
        <div className="flex items-start justify-between gap-1 relative z-10 px-4">
          {row0.map((step, j) => {
            const isCurrent = j === history.length
            return (
              <React.Fragment key={j}>
                <Node step={step} index={j} active={active === j} onClick={toggle} isCurrent={isCurrent} />
                {j < 4 && (() => {
                  const nextIsCurrent = (j + 1) === history.length
                  const activeConn = !!(step && (row0[j + 1] || nextIsCurrent))
                  const color = step ? nodeColor(step).border : '#333'
                  return <HConnector color={color} active={activeConn} dir="right" />
                })()}
              </React.Fragment>
            )
          })}
        </div>

        {/* ── Bridge (Week 5 to Week 6) ── */}
        <div className="flex justify-end pr-[44px] relative z-0 h-4 -my-2">
            <div 
              className={`w-[2px] transition-all duration-700 ${history.length >= 5 ? 'h-full opacity-100' : 'h-0 opacity-20'}`}
              style={{ background: (history[4] || history[5]) ? nodeColor(history[4] || history[5]).border : '#333' }}
            />
        </div>

        {/* Row 1: weeks 6–10 (Reversed visually: 10, 9, 8, 7, 6) */}
        <div className="flex items-start justify-between gap-1 relative z-10 px-4">
          {row1Indices.map((realIndex, j) => {
            const step = slots[realIndex]
            const isCurrent = realIndex === history.length
            return (
              <React.Fragment key={realIndex}>
                <Node step={step} index={realIndex} active={active === realIndex} onClick={toggle} isCurrent={isCurrent} />
                {j < 4 && (
                  (() => {
                    // Visually: Pos j  <-- Connector <-- Pos j+1
                    // Pos j is realIndex (e.g. 10), Pos j+1 is nextRealIndex (e.g. 9)
                    // Flow is 9 -> 10, arrow points left.
                    const nextRealIndex = row1Indices[j + 1]
                    const nextStep = slots[nextRealIndex]
                    const nextIsCurrent = nextRealIndex === history.length
                    const activeConn = !!(nextStep && (step || isCurrent))
                    const color = nextStep ? nodeColor(nextStep).border : '#333'
                    return <HConnector color={color} active={activeConn} dir="left" />
                  })()
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      <AnimatePresence mode="wait">
        {(activeStep || (active !== null && active === history.length)) && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div
              className="rounded-2xl border p-6 space-y-7"
              style={{
                borderColor: activeStep ? aC.border : '#ff6b2b',
                background: `linear-gradient(135deg, ${activeStep ? aC.bg : '#ff6b2b08'}, #13131380)`,
              }}
            >
              {/* ── Panel header ── */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="label">Week {(activeStep?.week || (active !== null ? active + 1 : 1))} of 10</span>
                    {activeStep ? (
                       <span className={`chip text-xs ${
                        aC?.badge === 'green' ? 'chip-green' : aC?.badge === 'orange' ? 'chip-orange' : 'chip-red'
                      }`}>
                        {aC?.badge === 'green' ? '✓ Expert Match' : aC?.badge === 'orange' ? '↗ Partially Right' : '✗ Off-Track'}
                      </span>
                    ) : (
                      <span className="chip chip-orange text-xs animate-pulse">⚡ Active Simulation</span>
                    )}
                  </div>
                  <h3 className="font-head font-semibold text-lg text-ink">
                    {activeStep?.scenarioTitle || `Week ${active + 1}: Strategic Intake`}
                  </h3>
                  <div className="text-sm text-muted leading-relaxed">
                    {activeStep?.description || (
                       <div className="flex flex-col gap-2">
                         <p>The simulation engine is currently processing your strategic inputs for this period.</p>
                         <p className="font-mono text-[11px] text-ember">READY_FOR_DECISION // STATUS_ACTIVE</p>
                       </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-elevated transition-all flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {activeStep ? (
                <>
                  {/* ── Section 1: Decision comparison (3 cols) ── */}
                  <div>
                    <div className="label mb-3">Decision Comparison</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Your decision */}
                      <div className="rounded-xl bg-elevated border border-border p-4 space-y-3">
                        <div className="flex items-center gap-2 label">
                          <Target className="w-3.5 h-3.5" />
                          Your Decision
                        </div>
                        <p className="text-sm text-ink font-medium leading-relaxed">
                          {activeStep.userChoice || 'Custom strategy applied'}
                        </p>
                        {activeStep.impacts && (
                          <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
                            {(activeStep.impacts.credits || 0) !== 0 && (
                              <DeltaTag value={activeStep.impacts.credits} prefix="$" size="sm" />
                            )}
                            {(activeStep.impacts.impactScore || 0) !== 0 && (
                              <span className={`chip text-xs ${activeStep.impacts.impactScore > 0 ? 'chip-green' : 'chip-red'}`}>
                                Impact {activeStep.impacts.impactScore > 0 ? '+' : ''}{activeStep.impacts.impactScore}%
                              </span>
                            )}
                            {(activeStep.impacts.communityTrust || 0) !== 0 && (
                              <span className={`chip text-xs ${activeStep.impacts.communityTrust > 0 ? 'chip-green' : 'chip-red'}`}>
                                Trust {activeStep.impacts.communityTrust > 0 ? '+' : ''}{activeStep.impacts.communityTrust}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expert move */}
                      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: '#00ea6430', background: '#00ea6408' }}>
                        <div className="flex items-center gap-2 label text-neon">
                          <Star className="w-3.5 h-3.5 text-neon" />
                          Expert Would Do
                        </div>
                        <p className="text-sm text-neon/90 font-medium leading-relaxed">
                          {activeStep.expertPreferred || 'Seek the most data-driven and sustainable option.'}
                        </p>
                        {activeStep.expertReasoning && (
                          <p className="text-xs text-muted leading-relaxed italic border-l-2 border-neon/20 pl-3">
                            "{activeStep.expertReasoning}"
                          </p>
                        )}
                      </div>

                      {/* Capital impact */}
                      <div className="rounded-xl bg-elevated border border-border p-4 space-y-3">
                        <div className="flex items-center gap-2 label">
                          <DollarSign className="w-3.5 h-3.5" />
                          Capital Impact
                        </div>
                        <DeltaTag value={activeStep.impacts?.credits} prefix="$" />
                        <p className="text-xs text-muted leading-relaxed">
                          {activeStep.capitalReason
                            || (activeJourney?.capitalReason)
                            || ((activeStep.impacts?.credits || 0) >= 0
                              ? 'This decision generated returns through efficient capital allocation.'
                              : 'This decision consumed capital — review if the outcome justified the spend.')
                          }
                        </p>
                        {activeStep.schemesAvailable?.length > 0 && (
                          <div className="text-[10px] text-muted border-t border-border pt-2">
                            💡 Schemes available: {activeStep.schemesAvailable.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Section 2: Value Changes (before → after) ── */}
                  {(activeStep.before || activeStep.after) && (
                    <div>
                      <div className="label mb-3 flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5" />
                        Value Changes at Week {activeStep.week || (active !== null ? active + 1 : 1)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <ValueChangeCard
                          label="Capital"
                          before={activeStep.before?.credits}
                          after={activeStep.after?.credits}
                          prefix="$"
                          icon={DollarSign}
                          color="#00ea64"
                        />
                        <ValueChangeCard
                          label="Impact Score"
                          before={activeStep.before?.impactScore}
                          after={activeStep.after?.impactScore}
                          suffix="%"
                          icon={Activity}
                          color="#3b82f6"
                        />
                        <ValueChangeCard
                          label="Community Trust"
                          before={activeStep.before?.communityTrust}
                          after={activeStep.after?.communityTrust}
                          suffix="%"
                          icon={Users}
                          color="#f59e0b"
                        />
                        <ValueChangeCard
                          label="Risk %"
                          before={Math.round(activeStep.before?.riskPct || 0)}
                          after={Math.round(activeStep.after?.riskPct || 0)}
                          suffix="%"
                          icon={Shield}
                          color="#ef4444"
                        />
                      </div>
                    </div>
                  )}

                  {/* ── Section 3: Tips and critique ── */}
                  {(activeStep?.improvisationTips?.length > 0 || (activeStep && activeJourney?.critique)) && (
                    <div>
                      <div className="label mb-3">Expert Suggestions & Improvements</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeStep?.improvisationTips?.map((tip, i) => (
                          <div key={i} className="flex gap-3 p-4 rounded-xl bg-neon/5 border border-neon/15">
                            <Lightbulb className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-ink leading-relaxed">{tip}</p>
                          </div>
                        ))}
                        {activeStep && activeJourney?.critique && aC?.badge !== 'green' && (
                          <div className="flex gap-3 p-4 rounded-xl bg-ember/5 border border-ember/15">
                            <AlertTriangle className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-ember/90 leading-relaxed">{activeJourney.critique}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Fallback if no tips ── */}
                  {(!activeStep?.improvisationTips?.length && !activeJourney?.critique) && (
                    <div className="flex gap-3 p-4 rounded-xl bg-elevated border border-border">
                      <Lightbulb className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted leading-relaxed">
                        {aC?.badge === 'green'
                          ? 'Great choice — you aligned with the expert strategy. Keep building on this momentum.'
                          : 'Consider aligning more closely with data-backed options. Experts prioritize measurable impact over speed in early-stage social ventures.'
                        }
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 border border-dashed border-border rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-ember/10 flex items-center justify-center animate-pulse">
                     <Activity className="w-6 h-6 text-ember" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-ink">Intelligence Collection in Progress</p>
                    <p className="text-xs text-muted mt-1 max-w-sm px-6">
                      Our strategic engine is currently analyzing market variables for this week. 
                      Decision data will be accessible once the simulation cycle completes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
