import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Target, Globe, Activity, ArrowRight, RotateCcw, X, CheckCircle2, Server } from 'lucide-react'

export function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-neon/5 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{ 
          scale: [1, 1.4, 1],
          x: [0, -150, 0],
          y: [0, -80, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-1/4 -right-1/4 w-[1000px] h-[1000px] bg-neon/5 rounded-full blur-[140px]"
      />
    </div>
  )
}

export default function LandingPage({ onStart, hasVenture, onClear, venture }) {
  const [showMethodology, setShowMethodology] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const r = await fetch('/api/status')
        const d = await r.json()
        if (!cancelled) setStatus(d)
      } catch {
        if (!cancelled) setStatus({ status: 'offline' })
      }
    }
    load()
    const t = setInterval(load, 8000)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  const metrics = useMemo(() => {
    if (hasVenture && venture) {
      const impact = Number(venture.impactScore ?? 0)
      const trust = Number(venture.communityTrust ?? 50)
      const credits = Number(venture.credits ?? 0)
      const burn = Math.max(1, Number(venture.burnRate ?? 2500))
      const runwayWeeks = Math.max(0, Math.floor(credits / burn))
      const week = Math.max(1, Math.min(10, Number(venture.week ?? 1)))
      return [
        { icon: Target, label: 'Impact', value: `${impact}%`, sub: `Week ${week}/10` },
        { icon: Activity, label: 'Runway', value: `$${credits.toLocaleString()}`, sub: `${runwayWeeks} weeks @ $${burn.toLocaleString()}/wk` },
        { icon: Globe, label: 'Trust', value: `${trust}%`, sub: venture.track ? `${venture.track} track` : 'Community trust' },
      ]
    }
    const engine = status?.engine || 'ImpactSim Engine'
    const sims = typeof status?.simulations === 'number' ? status.simulations : '—'
    const key = status?.hasKey ? 'AI enabled' : 'AI fallback'
    return [
      { icon: Server, label: 'Engine', value: status?.status === 'online' ? 'Online' : 'Offline', sub: engine },
      { icon: Activity, label: 'Simulations', value: String(sims), sub: 'Saved on this machine' },
      { icon: Zap, label: 'Mode', value: key, sub: status?.hasKey ? 'Using GROQ key' : 'No key required' },
    ]
  }, [hasVenture, venture, status])

  return (
    <div className="min-h-screen bg-base bg-mesh flex flex-col text-ink overflow-y-auto slim-scroll relative">
      <BackgroundAnimation />
      {/* Top nav */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-border bg-surface/70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-neon" />
          </div>
          <span className="font-head font-semibold text-base text-ink">
            Decyde<span className="text-neon">X</span>
            <span className="ml-2 text-[10px] text-muted font-mono align-middle">
              {status?.status === 'online' ? 'ENGINE ONLINE' : 'ENGINE OFFLINE'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="label hidden md:block">
            {hasVenture && venture?.mission ? `Active venture · ${venture.mission.slice(0, 42)}${venture.mission.length > 42 ? '…' : ''}` : '10‑week startup simulation hub'}
          </span>
          <button onClick={onStart} className="btn-primary flex items-center gap-2">
            {hasVenture ? 'Resume' : 'Get Started'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto w-full space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon/10 border border-neon/20 text-neon text-xs font-mono">
            <Zap className="w-3 h-3" />
            Startup Simulation Engine · v7.0
          </div>

          <h1 className="font-head text-5xl md:text-7xl font-bold text-ink leading-tight tracking-tight">
            Simulate your<br />
            <span style={{ color: '#00ffd2', textShadow: '0 0 20px rgba(0,255,210,0.3)' }}>startup journey</span>
          </h1>

          <p className="text-muted text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
            10-week adaptive simulation engine. Face real market challenges, get expert insights, 
            and receive a detailed readiness report — before risking real capital.
          </p>
        </motion.div>

        {/* Metric cards */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl"
        >
          {metrics.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="card p-5 card-hover group">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-muted group-hover:text-neon transition-colors" />
                <span className="label">{label}</span>
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="font-head font-semibold text-2xl">{value}</span>
                <span className="text-[10px] text-muted font-mono">{sub}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onStart} className="btn-primary px-8 py-3 text-sm flex items-center gap-2 group">
              <span>{hasVenture ? 'Resume Simulation' : 'Launch Simulation'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setShowMethodology(true)} className="btn-secondary px-8 py-3 text-sm">
              View Methodology
            </button>
          </div>
          {hasVenture && (
            <button onClick={onClear} className="btn-danger flex items-center gap-1.5">
              <RotateCcw className="w-3 h-3" />
              Hard Reset
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-4 flex justify-between items-center text-[10px] text-muted font-mono">
        <div className="flex gap-6">
          <span>
            Status <span className={status?.status === 'online' ? 'text-neon' : 'text-danger'}>
              {status?.status === 'online' ? 'ONLINE' : 'OFFLINE'}
            </span>
          </span>
          <span>
            Simulations <span className="text-ink">{typeof status?.simulations === 'number' ? status.simulations : '—'}</span>
          </span>
        </div>
        <span>DecydeX · v7.0</span>
      </footer>

      <AnimatePresence>
        {showMethodology && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-base/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="card bg-surface border border-neon/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-border flex justify-between items-center bg-elevated/50">
                <div className="flex gap-3 items-center">
                  <Globe className="w-5 h-5 text-neon" />
                  <h2 className="font-head text-xl font-semibold text-ink">Our Methodology</h2>
                </div>
                <button onClick={() => setShowMethodology(false)} className="text-muted hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 space-y-6 text-sm text-muted leading-relaxed max-h-[60vh] overflow-y-auto slim-scroll">
                <div className="p-4 rounded-xl bg-neon/5 border border-neon/20">
                  <h3 className="font-head text-base text-ink mb-2">About The Platform</h3>
                  <p className="text-ink/80 text-xs leading-relaxed">
                    DecydeX is a robust learning platform designed specifically for founders and operators in the social impact sector. 
                    It bridges the gap between theoretical knowledge and practical execution by providing a high-fidelity, zero-risk sandbox where 
                    you can experience the resource constraints and challenges of running a real startup.
                  </p>
                </div>
                <p>
                  DecydeX is built on a proprietary engine that simulates strategic, economic, and social variables 
                  for impact-driven startups in real-time. It can run with AI assistance when configured, and also
                  supports a fallback simulation mode so the product works without external keys.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                    <p><strong className="text-ink">Scenario Generation:</strong> Using causal-chains linked with live LLM prompting, we generate highly contextual 10-week challenges preventing identical playthroughs.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                    <p><strong className="text-ink">Market Variables:</strong> Impact, Runway, and Trust interact causally. Enhancing impact often burns runway faster unless offset by strong community relations.</p>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-4 h-4 text-neon flex-shrink-0 mt-0.5" />
                    <p><strong className="text-ink">Document Evaluation:</strong> External PDFs and documents are parsed into high-dimensional semantic spaces to bias the simulation toward your exact strategic context.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
