import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, ChevronRight, Zap, AlertTriangle, Star, DollarSign, TrendingUp, X, ExternalLink, Landmark, HandHeart } from 'lucide-react'
import { SWOTPanel } from '../components/UI'
import { detectSchemeCollisions } from '../data/govSchemes'

const buildLocalScenario = (venture) => {
  const week = venture?.week || 1
  const SCENARIO_CATEGORIES = [
    'Funding & Capital Strategy (investor pitch, bridge loan, grant application)',
    'Team & Talent Management (hiring, co-founder conflict, culture, attrition)',
    'Regulatory & Legal Compliance (licenses, government policy, data law, IP)',
    'Market Competition & Positioning (competitor entry, pricing war, differentiation)',
    'Community Trust & Stakeholder Relations (NGO partnership, media, user feedback)',
    'Product-Market Fit & Pivot (feature validation, MVP iteration, user adoption)',
    'Operations & Supply Chain (vendor, logistics, quality control, tech debt)',
    'Partnerships & Distribution (B2B deal, channel partner, government contract)',
  ];
  const usedWeeks = (venture.history || []).length;
  const category = SCENARIO_CATEGORIES[usedWeeks % SCENARIO_CATEGORIES.length];

  const FALLBACK_DATA = {
    'Funding & Capital Strategy (investor pitch, bridge loan, grant application)': {
      title: 'Runway Extension Crisis',
      description: `Week ${week}: Your ${venture.track} startup is burning cash faster than expected. You need to secure capital or cut costs to survive.`,
      options: [
        { label: 'Option A: Apply for an emergency bridge loan', capitalChange: 15000, impacts: { credits: 15000, communityTrust: -5, impactScore: 2 } },
        { label: 'Option B: Cut all non-essential staff and R&D', capitalChange: 25000, impacts: { credits: 25000, communityTrust: -10, impactScore: -8 } },
        { label: 'Option C: Pivot to a high-margin service model', capitalChange: 5000, impacts: { credits: 5000, communityTrust: 2, impactScore: 6 } },
        { label: 'Option D: Run a community equity crowdfunding campaign', capitalChange: 10000, impacts: { credits: 10000, communityTrust: 15, impactScore: 4 } },
      ],
      expertPreferred: 'Option D: Run a community equity crowdfunding campaign',
    },
    'Team & Talent Management (hiring, co-founder conflict, culture, attrition)': {
      title: 'Co-Founder Strategic Conflict',
      description: `Week ${week}: A major disagreement between your co-founders regarding the ${venture.track} roadmap is demoralizing the core team.`,
      options: [
        { label: 'Option A: Bring in an external mediator', capitalChange: -3000, impacts: { credits: -3000, communityTrust: 5, impactScore: 3 } },
        { label: 'Option B: Force a vote and pick one direction', capitalChange: 0, impacts: { credits: 0, communityTrust: -8, impactScore: 10 } },
        { label: 'Option C: Separate into two focused departments', capitalChange: -5000, impacts: { credits: -5000, communityTrust: 2, impactScore: 5 } },
        { label: 'Option D: Pause operations for one week of retreat', capitalChange: -8000, impacts: { credits: -8000, communityTrust: 12, impactScore: 2 } },
      ],
      expertPreferred: 'Option A: Bring in an external mediator',
    },
    'Regulatory & Legal Compliance (licenses, government policy, data law, IP)': {
      title: 'Data Privacy Audit',
      description: `Week ${week}: A new regulatory framework has been introduced that affects how your ${venture.track} venture handles data.`,
      options: [
        { label: 'Option A: Redesign the architecture for compliance', capitalChange: -12000, impacts: { credits: -12000, communityTrust: 10, impactScore: 5 } },
        { label: 'Option B: Outsource data handling to a 3rd party', capitalChange: -7000, impacts: { credits: -7000, communityTrust: 2, impactScore: 0 } },
        { label: 'Option C: Delay compliance until the grace period ends', capitalChange: 0, impacts: { credits: 0, communityTrust: -15, impactScore: 8 } },
        { label: 'Option D: Lobby the government for an exemption', capitalChange: -5000, impacts: { credits: -5000, communityTrust: -5, impactScore: 3 } },
      ],
      expertPreferred: 'Option A: Redesign the architecture for compliance',
    },
    'Market Competition & Positioning (competitor entry, pricing war, differentiation)': {
      title: 'Aggressive Competitor Pivot',
      description: `Week ${week}: A larger competitor has launched a feature that replicates your ${venture.track} startup's core value proposition.`,
      options: [
        { label: 'Option A: Focus on a niche customer segment', capitalChange: -2000, impacts: { credits: -2000, communityTrust: 8, impactScore: 7 } },
        { label: 'Option B: Accelerate your next high-impact feature', capitalChange: -10000, impacts: { credits: -10000, communityTrust: 5, impactScore: 12 } },
        { label: 'Option C: Engage in a pricing war', capitalChange: -15000, impacts: { credits: -15000, communityTrust: -2, impactScore: 4 } },
        { label: 'Option D: Publish a public case for your mission', capitalChange: -1000, impacts: { credits: -1000, communityTrust: 18, impactScore: 3 } },
      ],
      expertPreferred: 'Option A: Focus on a niche customer segment',
    },
    'Community Trust & Stakeholder Relations (NGO partnership, media, user feedback)': {
      title: 'Local Community Backlash',
      description: `Week ${week}: A local advocacy group claims your venture is ignoring indigenous needs or cultural norms.`,
      options: [
        { label: 'Option A: Appoint a community board lead', capitalChange: -4000, impacts: { credits: -4000, communityTrust: 20, impactScore: 8 } },
        { label: 'Option B: Release a public rebuttal document', capitalChange: -1000, impacts: { credits: -1000, communityTrust: -15, impactScore: 2 } },
        { label: 'Option C: Offer a percentage of profits to the group', capitalChange: -8000, impacts: { credits: -8000, communityTrust: 5, impactScore: 4 } },
        { label: 'Option D: Ignore the claims and focus on users', capitalChange: 0, impacts: { credits: 0, communityTrust: -25, impactScore: 10 } },
      ],
      expertPreferred: 'Option A: Appoint a community board lead',
    },
    'Product-Market Fit & Pivot (feature validation, MVP iteration, user adoption)': {
      title: 'Low Retention Feedback',
      description: `Week ${week}: Your latest user data shows that signed-up users are not returning after 48 hours.`,
      options: [
        { label: 'Option A: Interview 20 users personally', capitalChange: -1000, impacts: { credits: -1000, communityTrust: 12, impactScore: 6 } },
        { label: 'Option B: Rebuild the onboarding experience', capitalChange: -9000, impacts: { credits: -9000, communityTrust: 5, impactScore: 9 } },
        { label: 'Option C: Add gamification and daily notifications', capitalChange: -6000, impacts: { credits: -6000, communityTrust: -5, impactScore: 2 } },
        { label: 'Option D: Hard pivot to the most active sub-feature', capitalChange: -15000, impacts: { credits: -15000, communityTrust: 2, impactScore: 15 } },
      ],
      expertPreferred: 'Option A: Interview 20 users personally',
    },
    'Operations & Supply Chain (vendor, logistics, quality control, tech debt)': {
      title: 'Critical Supply Chain Failure',
      description: `Week ${week}: Your primary vendor for fulfillment has declared bankruptcy.`,
      options: [
        { label: 'Option A: Bring operations in-house', capitalChange: -20000, impacts: { credits: -20000, communityTrust: 8, impactScore: 12 } },
        { label: 'Option B: Scramble to find a temporary supplier', capitalChange: -5000, impacts: { credits: -5000, communityTrust: -5, impactScore: 4 } },
        { label: 'Option C: Halt operations until a partner is found', capitalChange: 0, impacts: { credits: 0, communityTrust: -12, impactScore: -5 } },
        { label: 'Option D: Shift focus to purely digital services', capitalChange: -8000, impacts: { credits: -8000, communityTrust: 2, impactScore: 7 } },
      ],
      expertPreferred: 'Option B: Scramble to find a temporary supplier',
    },
    'Partnerships & Distribution (B2B deal, channel partner, government contract)': {
      title: 'Major Government Contract Delay',
      description: `Week ${week}: A key distribution partner has pushed their contract signing by 3 months.`,
      options: [
        { label: 'Option A: Pursue direct-to-consumer sales', capitalChange: -10000, impacts: { credits: -10000, communityTrust: 5, impactScore: 8 } },
        { label: 'Option B: Secure an interim private-sector deal', capitalChange: -4000, impacts: { credits: -4000, communityTrust: 2, impactScore: 5 } },
        { label: 'Option C: Cut active costs to wait out the delay', capitalChange: 12000, impacts: { credits: 12000, communityTrust: -8, impactScore: -2 } },
        { label: 'Option D: Offer the partner an equity incentive', capitalChange: 0, impacts: { credits: 0, communityTrust: -5, impactScore: 6 } },
      ],
      expertPreferred: 'Option B: Secure an interim private-sector deal',
    }
  };

  const data = FALLBACK_DATA[category] || FALLBACK_DATA[Object.keys(FALLBACK_DATA)[0]];

  return {
    title: data.title,
    description: data.description,
    expertPreferredChoiceLabel: data.expertPreferred,
    expertReasoning: 'In local mode, prioritizing relationships and structured growth usually protects long-term outcomes.',
    improvisationTips: [
      'Write down a single measurable target for this week.',
      'Communicate the decision and trade-offs clearly to your team.',
    ],
    options: data.options,
    _localFallback: true,
  }
}

const useSpeech = (onT) => {
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      rec.current = new window.webkitSpeechRecognition()
      rec.current.continuous = true; rec.current.interimResults = true
      rec.current.onresult = e => onT(Array.from(e.results).map(r => r[0].transcript).join(''))
      rec.current.onend = () => setListening(false)
    }
  }, [onT])
  const toggle = () => { if (listening) { rec.current?.stop(); setListening(false) } else { rec.current?.start(); setListening(true) } }
  return { listening, toggle, supported: !!window.webkitSpeechRecognition }
}

/* ── Scheme Collision Popup ─────────────────────────────────── */
function SchemePopup({ schemes, onDismiss }) {
  if (!schemes || schemes.length === 0) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -8 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: '#f59e0b40', background: 'linear-gradient(135deg, #1c1a0f, #13131380)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#f59e0b25', background: '#f59e0b0a' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#f59e0b15', border: '1px solid #f59e0b30' }}>
              <Landmark className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <div className="text-xs font-bold font-mono" style={{ color: '#f59e0b' }}>
                🚨 SCHEME OPPORTUNITY DETECTED
              </div>
              <div className="text-[10px] text-muted">This scenario may align with existing Govt / NGO schemes</div>
            </div>
          </div>
          <button onClick={onDismiss} className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-elevated transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scheme cards */}
        <div className="p-4 space-y-3">
          <p className="text-xs text-muted leading-relaxed">
            Before making your decision, consider that the following schemes could support your venture's approach:
          </p>
          {schemes.map((scheme, i) => (
            <div key={scheme.id} className="rounded-xl p-4 space-y-2.5 border" style={{ borderColor: '#252525', background: '#1c1c1c' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {scheme.type === 'government'
                      ? <Landmark className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                      : <HandHeart className="w-3.5 h-3.5 flex-shrink-0 text-info" />
                    }
                    <span className="font-semibold text-sm text-ink">{scheme.name}</span>
                    <span className={`chip text-[9px] ${scheme.type === 'government' ? 'chip-orange' : 'chip-green'}`}>
                      {scheme.type === 'government' ? 'Govt Scheme' : 'NGO Partner'}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted font-mono">{scheme.org}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[9px] text-muted">Funding Range</div>
                  <div className="text-xs font-mono font-bold text-neon">{scheme.fundingRange}</div>
                </div>
              </div>
              <p className="text-xs text-muted/90 leading-relaxed">{scheme.description}</p>
              <div className="p-2.5 rounded-lg" style={{ background: '#00ea6408', border: '1px solid #00ea6420' }}>
                <div className="text-[10px] font-semibold text-neon mb-1">What it provides:</div>
                <p className="text-xs text-ink/80 leading-relaxed">{scheme.provides}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 pb-4">
          <button
            onClick={onDismiss}
            className="w-full btn-primary text-sm flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" />
            Got it — Incorporate into my decision
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Main MissionControl ────────────────────────────────────── */
export default function MissionControl({ venture, setVenture }) {
  const [scenario, setScenario] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [customInput, setCustomInput] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [applying, setApplying] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [swot, setSwot] = useState(null)
  const [swotLoading, setSwotLoading] = useState(false)
  const [showSWOT, setShowSWOT] = useState(false)
  const [matchedSchemes, setMatchedSchemes] = useState([])
  const [showSchemePopup, setShowSchemePopup] = useState(false)
  const [pendingOption, setPendingOption] = useState(null)

  const { listening, toggle, supported } = useSpeech(useCallback(t => setCustomInput(t), []))

  const fetchScenario = useCallback(async (fromRetry = false) => {
    setLoading(true); setScenario(null); setSelected(null); setFeedback(null); setLoadError(null)
    setShowCustom(false); setMatchedSchemes([]); setShowSchemePopup(false); setPendingOption(null)
    try {
      const r = await fetch('/api/generate-scenario', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: venture.ventureId })
      })
      const data = await r.json().catch(() => ({}))
      if (!r.ok || data?.error) {
        const local = buildLocalScenario(venture)
        setScenario(local)
        setLoadError(null)
        return
      }
      setScenario(data)

      // ── Detect govt/NGO scheme collisions ──────────────────
      const matched = detectSchemeCollisions(
        (data.description || '') + ' ' + (data.title || ''),
        data.options || [],
        venture.track
      )
      if (matched.length > 0) {
        setMatchedSchemes(matched)
        // Delay so user sees the scenario first; use ref to track mount
        setTimeout(() => setShowSchemePopup(true), 1200)
      }
    } catch (e) {
      const local = buildLocalScenario(venture)
      setScenario(local)
      setLoadError(null)
    }
    finally { setLoading(false) }
  }, [venture])

  useEffect(() => { 
    if ((venture.week || 1) > 10) {
      if (!showSWOT) fetchSWOT()
    } else {
      fetchScenario() 
    }
  }, [fetchScenario, venture.week])

  const fetchSWOT = async () => {
    setSwotLoading(true)
    try {
      const r = await fetch('/api/swot-analysis', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: venture.ventureId })
      })
      if (!r.ok) throw new Error()
      const data = await r.json()
      setSwot(data)
      setShowSWOT(true)
    } catch {
      // Local SWOT Fallback
      setSwot({
        strengths: ["Strong mission alignment", "Resilient capital management", "Deep community trust"],
        weaknesses: ["Scale limitations", "High burn rate risk"],
        opportunities: ["Geographic expansion", "Series A readiness"],
        threats: ["Regulatory shifts", "Competitor entry"],
        documentationFeedback: "Solid documentation presence.",
        overallVerdict: "Your venture shows strong potential for follow-on funding and long-term impact."
      })
      setShowSWOT(true)
    } finally { setSwotLoading(false) }
  }

  const applyDecision = async (option) => {
    if (!scenario) return
    if ((venture.week || 1) > 10) return
    setApplying(true); setSelected(option.label)
    try {
      const prevCredits = venture.credits || 0
      const prevTrust   = venture.communityTrust || 50
      const prevImpact  = venture.impactScore || 0

      const newWeek    = (venture.week || 1) + 1
      const newCredits = Math.max(0, prevCredits + (option.impacts?.credits || 0) - (venture.burnRate || 2500))
      const newTrust   = Math.max(0, Math.min(100, prevTrust + (option.impacts?.communityTrust || 0)))
      const newImpact  = Math.max(0, Math.min(100, prevImpact + (option.impacts?.impactScore || 0)))

      // ── Rich history entry — stores ALL data needed for SnakeTimeline ──
      const histEntry = {
        week: venture.week || 1,
        scenarioTitle:   scenario.title,
        description:     scenario.description,
        userChoice:      option.label,
        expertPreferred: scenario.expertPreferredChoiceLabel,
        expertReasoning: scenario.expertReasoning,
        improvisationTips: scenario.improvisationTips || [],
        capitalChange:   option.capitalChange || 0,
        capitalReason:   option.capitalReason || '',
        impacts:         option.impacts || {},
        // Store before/after for the snake timeline value changes
        before: {
          credits:        prevCredits,
          communityTrust: prevTrust,
          impactScore:    prevImpact,
          riskPct:        Math.max(0, 100 - prevImpact - prevTrust / 2),
        },
        after: {
          credits:        newCredits,
          communityTrust: newTrust,
          impactScore:    newImpact,
          riskPct:        Math.max(0, 100 - newImpact - newTrust / 2),
        },
        // Matched schemes for reference
        schemesAvailable: matchedSchemes.map(s => s.name),
      }

      await setVenture({
        week: newWeek,
        credits: newCredits,
        communityTrust: newTrust,
        impactScore: newImpact,
        historyEntry: histEntry,
        xpBonus: 25
      })

      if (newWeek > 10) {
        await fetchSWOT()
      } else {
        fetchScenario()
      }
    } catch { }
    finally { setApplying(false) }
  }

  const applyCustom = async () => {
    if (!customInput.trim() || !scenario) return
    setApplying(true)
    try {
      const r = await fetch('/api/evaluate-custom-decision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: customInput, ventureId: venture.ventureId })
      })
      const data = await r.json()
      setFeedback(data)
      await applyDecision({
        label: customInput,
        impacts: data.impacts,
        capitalChange: data.capitalChange,
        capitalReason: data.capitalReason
      })
    } catch { } finally { setApplying(false) }
  }

  // ── SWOT screen after Q10 ──────────────────────────────────
  if (showSWOT) return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center gap-3">
        <div className="chip chip-green">10/10 Complete</div>
        <h2 className="font-head font-semibold text-lg text-ink">Venture SWOT Analysis</h2>
      </div>

      {swotLoading ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted">Generating strategic analysis...</p>
        </div>
      ) : swot ? (
        <>
          {swot.overallVerdict && (
            <div className="card p-5 bg-elevated rounded-xl">
              <div className="label mb-2 flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Expert Verdict</div>
              <p className="text-sm text-ink leading-relaxed">{swot.overallVerdict}</p>
            </div>
          )}
          <SWOTPanel swot={swot} />
          {swot.documentationFeedback && (
            <div className="card-raised rounded-xl p-4 border border-neon/10 space-y-2">
              <div className="label flex items-center gap-1.5 text-neon"><Star className="w-3.5 h-3.5" /> Documentation Context Feedback</div>
              <p className="text-sm text-ink leading-relaxed">{swot.documentationFeedback}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="label">Week {venture.week}/10</span>
            {scenario && <span className="chip chip-orange text-[9px]">{venture.track}</span>}
            {matchedSchemes.length > 0 && (
              <button
                onClick={() => setShowSchemePopup(true)}
                className="chip text-[9px] flex items-center gap-1"
                style={{ background: '#f59e0b15', color: '#f59e0b', border: '1px solid #f59e0b30' }}
              >
                <Landmark className="w-2.5 h-2.5" />
                {matchedSchemes.length} Scheme{matchedSchemes.length > 1 ? 's' : ''} Available
              </button>
            )}
          </div>
          <div className="h-1.5 w-48 bg-elevated rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((venture.week - 1) / 10) * 100}%` }}
              className="h-full bg-neon rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="label">Capital</div>
            <div className={`font-mono text-sm font-bold ${venture.credits < 10000 ? 'text-danger' : 'text-ink'}`}>
              ${venture.credits?.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scheme popup — fixed overlay, never blocks layout ── */}
      <AnimatePresence>
        {showSchemePopup && matchedSchemes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowSchemePopup(false) }}
          >
            <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
              <SchemePopup schemes={matchedSchemes} onDismiss={() => setShowSchemePopup(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scenario card */}
      {loading ? (
        <div className="card rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-neon border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted">Generating market scenario...</p>
        </div>
      ) : loadError ? (
        <div className="card rounded-xl p-6 space-y-3 border" style={{ borderColor: '#ef444440', background: 'linear-gradient(135deg, #1b0f12, #13131380)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: '#ef4444' }} />
            <div className="space-y-1">
              <div className="text-sm font-semibold text-ink">Scenario failed to load</div>
              <div className="text-xs text-muted">{loadError}</div>
            </div>
          </div>
          <button onClick={fetchScenario} className="btn-secondary text-xs px-4 py-2 w-fit">
            Retry
          </button>
        </div>
      ) : !scenario ? (
        <div className="card rounded-xl p-6 space-y-3 border border-border/60 bg-elevated/60">
          <div className="text-sm font-semibold text-ink">No scenario loaded yet</div>
          <p className="text-xs text-muted">
            The engine did not return a scenario this round. This can happen if the server was restarted or a request timed out.
          </p>
          <button onClick={() => fetchScenario(false)} className="btn-secondary text-xs px-4 py-2 w-fit">
            Load a scenario
          </button>
        </div>
      ) : scenario && (
        <AnimatePresence mode="wait">
          <motion.div key={scenario.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {/* Scenario description */}
            <div className="card rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="label">Market Challenge</div>
                <span className="chip text-[9px]" style={{ background: '#3b82f615', color: '#3b82f6', border: '1px solid #3b82f625' }}>
                  Week {venture.week} of 10
                </span>
              </div>
              <h3 className="font-head font-semibold text-xl text-ink">{scenario.title}</h3>
              <p className="text-base text-muted leading-relaxed">{scenario.description}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="label mb-2 text-muted uppercase tracking-widest text-[10px] font-bold">Select Strategy</div>
              {(scenario.options || []).map((opt, i) => {
                const isSelected = pendingOption?.label === opt.label
                const cleanLabel = (opt.label || '').replace(/^option\s+[a-d]\s*:\s*/i, '')
                return (
                  <button
                    key={i}
                    onClick={() => !applying && setPendingOption(opt)}
                    disabled={applying}
                    className={`w-full text-left rounded-xl border p-4 transition-all duration-200 group relative overflow-hidden ${
                      isSelected
                        ? 'border-neon bg-neon/10 ring-1 ring-neon/20 shadow-lg shadow-neon/5'
                        : 'border-border hover:border-muted bg-elevated hover:bg-elevated/80'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-gradient-to-r from-neon/5 to-transparent pointer-events-none"
                      />
                    )}
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 font-mono text-sm transition-all ${
                        isSelected ? 'border-neon bg-neon text-base font-bold' : 'border-border text-muted group-hover:border-muted group-hover:text-ink'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm leading-relaxed transition-colors ${isSelected ? 'text-ink font-semibold' : 'text-muted group-hover:text-ink'}`}>
                          {cleanLabel}
                        </p>
                      </div>
                      {isSelected && <Star className="w-4 h-4 text-neon animate-pulse" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Submit Button */}
            <AnimatePresence>
              {pendingOption && !applying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="pt-4"
                >
                  <button
                    onClick={() => applyDecision(pendingOption)}
                    className="w-full btn-primary py-4 text-base font-bold flex items-center justify-center gap-3 shadow-xl shadow-neon/10 group"
                  >
                    <Zap className="w-5 h-5 text-base group-hover:animate-bounce" />
                    Confirm & Execute Decision
                    <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {applying && (
              <div className="flex flex-col items-center py-6 gap-3">
                <div className="w-6 h-6 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted animate-pulse">Calculating market impact...</p>
              </div>
            )}

            {/* Expert hint teaser */}
            {scenario.expertReasoning && (
              <div className="rounded-xl p-3 border flex items-start gap-3" style={{ borderColor: '#00ea6420', background: '#00ea640a' }}>
                <Star className="w-3.5 h-3.5 text-neon flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted leading-relaxed">
                  <span className="text-neon font-semibold">Expert tip:</span> {scenario.expertReasoning}
                </p>
              </div>
            )}

            {/* Custom strategy */}
            <div>
              <button onClick={() => setShowCustom(!showCustom)} className="btn-ghost text-xs flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-ember" />
                Use custom strategy
              </button>
              <AnimatePresence>
                {showCustom && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-2">
                    <div className="relative">
                      <textarea
                        value={customInput} onChange={(e) => setCustomInput(e.target.value)}
                        className="textarea h-24 pr-12 text-sm"
                        placeholder="Describe your strategic decision in detail..."
                      />
                      {supported && (
                        <button onClick={toggle} className={`absolute top-3 right-3 p-1.5 rounded-lg border transition-all ${
                          listening ? 'border-neon bg-neon/10 text-neon' : 'border-border text-muted'
                        }`}>
                          {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                    <button onClick={applyCustom} disabled={!customInput.trim() || applying}
                      className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                      <Star className="w-3 h-3" /> Apply Custom Strategy
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {feedback && (
              <div className="card-raised rounded-xl p-4 border border-neon/10 space-y-2">
                <div className="label text-neon">AI Feedback on Custom Strategy</div>
                <p className="text-xs text-ink leading-relaxed">{feedback.analysis}</p>
                {feedback.feedback && <p className="text-xs text-muted leading-relaxed">{feedback.feedback}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
