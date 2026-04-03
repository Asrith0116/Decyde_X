import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, TrendingUp, Zap, Users, Globe, ShieldCheck,
  ChevronRight, RefreshCw, Target, Activity, Layers, CheckCircle2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const TOOLTIP_STYLE = {
  contentStyle: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, fontSize: 11, fontFamily: 'JetBrains Mono, monospace' },
  labelStyle: { color: '#e0e0e0', fontWeight: 600 },
}

/* ── Phase card ──────────────────────────────────────────────── */
function PhaseCard({ phase, index, isActive, onClick }) {
  const pct = Math.round((phase.amount / phase.totalBudget) * 100)
  const colors = ['#00ea64', '#3b82f6', '#f59e0b', '#ff6b2b', '#a855f7']
  const color = colors[index % colors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="rounded-2xl border p-5 cursor-pointer transition-all space-y-4"
      style={{
        borderColor: isActive ? color + '60' : '#252525',
        background: isActive ? color + '08' : '#1c1c1c',
      }}
    >
      {/* Phase header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm flex-shrink-0"
            style={{ background: color + '18', color, border: `1.5px solid ${color}30` }}>
            {index + 1}
          </div>
          <div>
            <div className="font-head font-semibold text-sm text-ink">{phase.name}</div>
            <div className="text-[10px] text-muted">{phase.timeline}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono font-bold text-base" style={{ color }}>${phase.amount.toLocaleString()}</div>
          <div className="text-[9px] text-muted">{pct}% of budget</div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: isActive ? `${pct}%` : `${pct * 0.6}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>

      {/* Goal */}
      <p className="text-xs text-muted leading-relaxed">{phase.goal}</p>

      {/* Expand indicator */}
      <div className="flex items-center gap-1.5 text-[10px]" style={{ color }}>
        <ChevronRight className={`w-3 h-3 transition-transform ${isActive ? 'rotate-90' : ''}`} />
        {isActive ? 'Collapse details' : 'View breakdown'}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t space-y-4" style={{ borderColor: color + '25' }}>
              {/* Allocation breakdown */}
              {phase.allocations && (
                <div className="space-y-2">
                  <div className="label">Budget Allocation Breakdown</div>
                  {phase.allocations.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="text-xs text-muted w-32 flex-shrink-0">{a.category}</div>
                      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(a.amount / phase.amount) * 100}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className="h-full rounded-full"
                          style={{ background: color, opacity: 0.7 + i * 0.05 }}
                        />
                      </div>
                      <div className="font-mono text-xs text-ink w-20 text-right">${a.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Milestones */}
              {phase.milestones && (
                <div className="space-y-2">
                  <div className="label">Key Milestones</div>
                  {phase.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
                      <p className="text-xs text-muted leading-relaxed">{m}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Success metric */}
              {phase.successMetric && (
                <div className="rounded-xl p-3" style={{ background: color + '0a', border: `1px solid ${color}20` }}>
                  <div className="text-[10px] font-semibold mb-1" style={{ color }}>Success Metric</div>
                  <p className="text-xs text-ink/80">{phase.successMetric}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function ResourceConstraints({ venture }) {
  const [activePhase, setActivePhase] = useState(0)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)

  const capital = venture?.credits || 0
  const startingCapital = venture?.startingCredits || 50000
  const burnRate = venture?.burnRate || 2500
  const spent = startingCapital - capital
  const spentPct = Math.min(100, Math.round((spent / startingCapital) * 100))
  const runsLeft = burnRate > 0 ? (capital / burnRate).toFixed(1) : '∞'

  const generatePlan = async () => {
    setLoading(true); setPlan(null)
    try {
      const r = await fetch('/api/resource-plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: venture?.ventureId })
      })
      if (!r.ok) throw new Error()
      const data = await r.json()
      setPlan(data)
      setActivePhase(0)
    } catch {
      // Local Roadmap Fallback
      setPlan({
        executiveSummary: "Strategic growth and sustainability roadmap.",
        phases: [
          { name: "Phase 1: Foundation", timeline: "Weeks 1-4", amount: Math.round(capital * 0.15), goal: "Stabilize core operations", milestones: ["Core team hiring", "Initial R&D"], successMetric: "Baseline growth" },
          { name: "Phase 2: Validation", timeline: "Weeks 5-12", amount: Math.round(capital * 0.20), goal: "User acquisition drive", milestones: ["Beta launch", "Community feedback loop"], successMetric: "10% W-o-W growth" },
          { name: "Phase 3: Optimization", timeline: "Months 4-6", amount: Math.round(capital * 0.30), goal: "Scale infrastructure", milestones: ["Infrastructure audit", "Supply chain hardening"], successMetric: "Margin improvement" },
          { name: "Phase 4: Scaling", timeline: "Months 7-12", amount: Math.round(capital * 0.25), goal: "Market entry expansion", milestones: ["Second city launch", "Marketing blitz"], successMetric: "Revenue scale" },
          { name: "Phase 5: Exit Prep", timeline: "Year 2", amount: Math.round(capital * 0.10), goal: "Series A readiness", milestones: ["Equity audit", "Board expansion"], successMetric: "Series A term sheet" }
        ],
        successProjection: { marketReadiness: 68, fundingProbability: 55, breakEven: "Month 12" }
      })
      setActivePhase(0)
    } finally { setLoading(false) }
  }

  const chartData = useMemo(() => {
    if (!plan?.phases) return []
    return plan.phases.map(p => ({ name: p.name.split(' ').slice(0, 2).join(' '), amount: p.amount }))
  }, [plan])

  const COLORS = ['#00ea64', '#3b82f6', '#f59e0b', '#ff6b2b', '#a855f7']

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-ember/10 border border-ember/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-ember" />
          </div>
          <div>
            <h2 className="font-head font-bold text-2xl text-ink">Resource Constraints</h2>
            <p className="text-sm text-muted">Strategic capital allocation plan to convert your startup into success</p>
          </div>
        </div>
      </div>

      {/* Capital overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Available Capital', value: `$${capital.toLocaleString()}`, color: capital < 10000 ? '#ef4444' : '#00ea64', icon: DollarSign },
          { label: 'Starting Capital', value: `$${startingCapital.toLocaleString()}`, color: '#3b82f6', icon: Target },
          { label: 'Capital Used', value: `${spentPct}%`, color: '#f59e0b', icon: Activity },
          { label: 'Runway Remaining', value: `${runsLeft} wks`, color: '#ff6b2b', icon: Zap },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card rounded-xl p-4 space-y-2 border border-border">
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span className="label text-[10px]">{label}</span>
            </div>
            <div className="font-head font-bold text-2xl" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Capital health bar */}
      <div className="card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="label">Capital Health</div>
          <div className="text-xs font-mono font-bold text-ember">${burnRate.toLocaleString()}/week burn rate</div>
        </div>
        <div className="h-3 bg-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: `${100 - spentPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: capital < 10000 ? '#ef4444' : capital < startingCapital * 0.3 ? '#f59e0b' : '#00ea64' }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted font-mono">
          <span>$0</span>
          <span className="text-ink font-semibold">${capital.toLocaleString()} remaining</span>
          <span>${startingCapital.toLocaleString()}</span>
        </div>
      </div>

      {/* Generate plan button */}
      <div className="card rounded-2xl p-5 space-y-3">
        <div className="label">AI Strategic Allocation Plan</div>
        <p className="text-xs text-muted leading-relaxed">
          Generate a detailed phase-by-phase plan on how to deploy your{' '}
          <span className="text-ink font-semibold">${capital.toLocaleString()}</span> available capital
          across key startup milestones to maximize success probability.
        </p>
        <div className="flex gap-3">
          <button
            onClick={generatePlan}
            disabled={loading || !venture?.ventureId}
            className="btn-primary flex items-center gap-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Generating Plan...</>
              : <><TrendingUp className="w-4 h-4" />Generate Success Roadmap</>
            }
          </button>
          {plan && (
            <button onClick={generatePlan} disabled={loading} className="btn-ghost text-xs text-muted flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="w-10 h-10 border-2 border-ember border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Building your strategic allocation plan...</p>
        </div>
      )}

      {/* Plan results */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5"
          >
            {/* Summary banner */}
            {plan.executiveSummary && (
              <div className="rounded-2xl p-5 border border-ember/20" style={{ background: '#ff6b2b08' }}>
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-ember mb-1 font-mono">STRATEGIC SUMMARY</div>
                    <p className="text-sm text-ink/90 leading-relaxed">{plan.executiveSummary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Budget overview chart */}
            {chartData.length > 0 && (
              <div className="card rounded-2xl p-5 space-y-4">
                <div className="label flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-info" />
                  Budget Allocation Overview
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b6b6b" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                      <YAxis stroke="#6b6b6b" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono"
                        tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={v => [`$${v.toLocaleString()}`, 'Budget']} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Phase cards */}
            <div className="space-y-3">
              <div className="label">Phase-by-Phase Roadmap</div>
              {plan.phases?.map((phase, i) => (
                <PhaseCard
                  key={i}
                  phase={{ ...phase, totalBudget: capital }}
                  index={i}
                  isActive={activePhase === i}
                  onClick={() => setActivePhase(prev => prev === i ? -1 : i)}
                />
              ))}
            </div>

            {/* Final projection */}
            {plan.successProjection && (
              <div className="card rounded-2xl p-5 space-y-3">
                <div className="label flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-neon" />
                  Success Projection
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Market Readiness', value: plan.successProjection.marketReadiness, color: '#00ea64' },
                    { label: 'Funding Probability', value: plan.successProjection.fundingProbability, color: '#3b82f6' },
                    { label: 'Break-even Timeline', value: plan.successProjection.breakEven, color: '#f59e0b', isText: true },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl p-4 bg-elevated border border-border space-y-2">
                      <div className="label text-[10px]">{m.label}</div>
                      <div className="font-head font-bold text-2xl" style={{ color: m.color }}>
                        {m.isText ? m.value : `${m.value}%`}
                      </div>
                      {!m.isText && (
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${m.value}%` }}
                            transition={{ duration: 0.8 }} className="h-full rounded-full"
                            style={{ background: m.color }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!plan && !loading && (
        <div className="flex flex-col items-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-ember/10 border border-ember/20 flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-ember/30" />
          </div>
          <p className="text-sm text-muted max-w-sm leading-relaxed">
            Generate your strategic capital plan to see a detailed phased roadmap on deploying your ${capital.toLocaleString()} to maximize startup success.
          </p>
        </div>
      )}
    </div>
  )
}
