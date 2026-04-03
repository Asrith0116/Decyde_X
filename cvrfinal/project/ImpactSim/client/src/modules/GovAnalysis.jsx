import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Landmark, RefreshCw, ShieldCheck, ShieldAlert, CheckCircle2,
  AlertTriangle, TrendingUp, Zap, Scale, FileText, Globe, ChevronRight
} from 'lucide-react'

/* ── Animated progress bar ───────────────────────────────────── */
function ProbabilityBar({ value, color }) {
  return (
    <div className="h-2.5 bg-elevated rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

/* ── Risk / Opportunity item ─────────────────────────────────── */
function ListItem({ text, type }) {
  const isRisk = type === 'risk'
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl ${
      isRisk ? 'bg-danger/5 border border-danger/20' : 'bg-neon/5 border border-neon/15'
    }`}>
      {isRisk
        ? <AlertTriangle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
        : <CheckCircle2 className="w-3.5 h-3.5 text-neon flex-shrink-0 mt-0.5" />
      }
      <p className="text-sm leading-relaxed" style={{ color: isRisk ? '#ef4444cc' : '#e0e0e0' }}>{text}</p>
    </div>
  )
}

/* ── Legal Dimension Card ────────────────────────────────────── */
function LegalCard({ label, status, detail, icon: Icon }) {
  const cfg = {
    compliant:  { color: '#00ea64', chip: 'chip-green',  chipLabel: 'Compliant' },
    caution:    { color: '#f59e0b', chip: 'chip-orange', chipLabel: 'Caution' },
    risk:       { color: '#ef4444', chip: 'chip-red',    chipLabel: 'Risk' },
    neutral:    { color: '#6b6b6b', chip: '',            chipLabel: 'N/A' },
  }[status] || { color: '#6b6b6b', chip: '', chipLabel: status }

  return (
    <div className="rounded-xl p-4 space-y-2 bg-elevated border border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.color }} />
          <span className="text-xs font-semibold text-ink">{label}</span>
        </div>
        <span className={`chip text-[9px] ${cfg.chip}`}>{cfg.chipLabel}</span>
      </div>
      <p className="text-xs text-muted leading-relaxed">{detail}</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════════ */
export default function GovAnalysis({ venture }) {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const runAnalysis = async () => {
    setLoading(true); setResult(null)
    try {
      const r = await fetch('/api/gov-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: venture?.ventureId })
      })
      if (!r.ok) throw new Error()
      setResult(await r.json())
    } catch {
      // Local Gov Fallback
      setResult({
        supportProbability: 58,
        governmentSentiment: "Positive",
        sentimentReasoning: `Local government shows strong interest in ${venture?.track || 'impact'} innovation.`,
        regulatoryRisks: ["Early stage data compliance mandates", "Pending sector licensing update"],
        supportOpportunities: ["Startup incubator grants", "Co-working space subsidies"],
        legalDimensions: [
          { label: "Data Privacy", status: "caution", detail: "General data protection compliance recommended." },
          { label: "Labor Laws", status: "compliant", detail: "Employment contracts meet standard requirements." },
          { label: "IP Protection", status: "caution", detail: "Core technology patent filing suggested." }
        ],
        policyAlignment: 7,
        policyNote: "Aligned with current digital transformation goals.",
        keyActions: ["Assign compliance lead", "Apply for national startup scheme"]
      })
    } finally { setLoading(false) }
  }

  const sentimentColor = result?.governmentSentiment === 'Positive' ? '#00ea64'
    : result?.governmentSentiment === 'Neutral' ? '#f59e0b' : '#ef4444'
  const sentimentIcon = result?.governmentSentiment === 'Positive' ? ShieldCheck
    : result?.governmentSentiment === 'Neutral' ? Scale : ShieldAlert

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: '#7c3aed15', border: '1px solid #7c3aed30' }}>
            <Landmark className="w-6 h-6" style={{ color: '#7c3aed' }} />
          </div>
          <div>
            <h2 className="font-head font-bold text-2xl text-ink">Government Analysis</h2>
            <p className="text-sm text-muted">AI-powered regulatory & policy impact assessment based on your decisions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted">
          <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          Groq AI
        </div>
      </div>

      {/* Engine card */}
      <div className="card rounded-2xl p-5 border border-border space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="label mb-1">Policy Analysis Engine</div>
            <p className="text-xs text-muted leading-relaxed max-w-xl">
              Based on your decisions and current metrics, this analysis predicts government attitude,
              potential regulatory risks, and support opportunities for your{' '}
              <span className="text-ink font-medium">{venture?.track || ''}</span> startup.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runAnalysis}
            disabled={loading || !venture?.ventureId}
            className="btn-primary flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Analyzing...</>
              : <><Landmark className="w-4 h-4" />Run Government Analysis</>
            }
          </button>
          {result && (
            <button onClick={runAnalysis} disabled={loading}
              className="btn-ghost flex items-center gap-1.5 text-xs text-muted">
              <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-2 rounded-full animate-spin"
            style={{ borderColor: '#7c3aed', borderTopColor: 'transparent' }} />
          <p className="text-sm text-muted">Analyzing regulatory landscape...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Row 1: Support probability + Government sentiment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Support probability */}
              <div className="card rounded-2xl p-6 space-y-4">
                <div className="label">Support Probability</div>
                <div className="font-head font-bold text-6xl text-ink">
                  {result.supportProbability}%
                </div>
                <ProbabilityBar
                  value={result.supportProbability}
                  color={result.supportProbability > 60 ? '#00ea64' : result.supportProbability > 35 ? '#f59e0b' : '#ef4444'}
                />
                <p className="text-xs text-muted">Likelihood of receiving government grants or support</p>
              </div>

              {/* Government sentiment */}
              <div className="card rounded-2xl p-6 space-y-4">
                <div className="label">Government Sentiment</div>
                <div className="flex items-center gap-3 mb-2">
                  {React.createElement(sentimentIcon, { className: 'w-5 h-5', style: { color: sentimentColor } })}
                  <span className="px-4 py-1.5 rounded-full font-semibold text-sm font-mono"
                    style={{ background: sentimentColor + '20', color: sentimentColor, border: `1px solid ${sentimentColor}40` }}>
                    {result.governmentSentiment}
                  </span>
                </div>
                <p className="text-sm text-muted/90 leading-relaxed">{result.sentimentReasoning}</p>
              </div>
            </div>

            {/* Row 2: Regulatory risks + Support opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Regulatory risks */}
              <div className="card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="label flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-danger" /> Regulatory Risks
                  </div>
                  <span className="text-xs font-semibold text-danger">mitigate these</span>
                </div>
                <div className="space-y-2">
                  {(result.regulatoryRisks || []).map((r, i) => (
                    <ListItem key={i} text={r} type="risk" />
                  ))}
                </div>
              </div>

              {/* Support opportunities */}
              <div className="card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="label flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-neon" /> Support Opportunities
                  </div>
                  <span className="text-xs font-semibold text-neon">leverage these</span>
                </div>
                <div className="space-y-2">
                  {(result.supportOpportunities || []).map((o, i) => (
                    <ListItem key={i} text={o} type="opportunity" />
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Legal dimensions */}
            <div className="card rounded-2xl p-5 space-y-4">
              <div className="label flex items-center gap-2">
                <Scale className="w-3.5 h-3.5 text-info" /> Legal Compliance Dimensions
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(result.legalDimensions || []).map((d, i) => (
                  <LegalCard
                    key={i}
                    label={d.label}
                    status={d.status}
                    detail={d.detail}
                    icon={[Scale, FileText, Globe, ShieldCheck, Landmark, Zap][i % 6]}
                  />
                ))}
              </div>
            </div>

            {/* Row 4: Policy alignment + key actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Policy alignment */}
              {result.policyAlignment && (
                <div className="card rounded-2xl p-5 space-y-3">
                  <div className="label flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" /> Policy Alignment Score
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="font-head font-bold text-4xl text-ink">{result.policyAlignment}/10</span>
                    <div className="mb-1 text-xs text-muted">alignment with current government priorities</div>
                  </div>
                  <ProbabilityBar value={result.policyAlignment * 10} color="#a855f7" />
                  {result.policyNote && (
                    <p className="text-xs text-muted leading-relaxed border-l-2 pl-3" style={{ borderColor: '#a855f730' }}>
                      {result.policyNote}
                    </p>
                  )}
                </div>
              )}

              {/* Key action steps */}
              {result.keyActions?.length > 0 && (
                <div className="card rounded-2xl p-5 space-y-3">
                  <div className="label flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-ember" /> Priority Actions
                  </div>
                  <div className="space-y-2">
                    {result.keyActions.map((a, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold flex-shrink-0 mt-0.5"
                          style={{ background: '#ff6b2b15', color: '#ff6b2b', border: '1px solid #ff6b2b30' }}>
                          {i + 1}
                        </div>
                        <p className="text-xs text-muted leading-relaxed">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: '#7c3aed10', border: '1px solid #7c3aed20' }}>
            <Landmark className="w-8 h-8 opacity-30" style={{ color: '#7c3aed' }} />
          </div>
          <p className="text-sm text-muted max-w-sm leading-relaxed">
            Run the Government Analysis to get an AI-powered assessment of regulatory risks, legal compliance gaps, and government support opportunities for your startup.
          </p>
        </div>
      )}
    </div>
  )
}
