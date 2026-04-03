import React, { useState, useEffect } from 'react'
import {
  Activity, Users, LogOut, Terminal, Shield,
  History, Layers, Home as HomeIcon, ChevronLeft, ChevronRight,
  Award, Settings2, BarChart2, Globe, Landmark, DollarSign
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { StatHeader, NavItem } from './components/UI'
import LandingPage        from './modules/LandingPage'
import SetupWizard        from './modules/SetupWizard'
import MissionControl     from './modules/MissionControl'
import IntelDashboard     from './modules/IntelDashboard'
import AnalyticsDashboard from './modules/AnalyticsDashboard'
import StakeholderNavigator from './modules/StakeholderNavigator'
import GovAnalysis         from './modules/GovAnalysis'
import ResourceConstraints from './modules/ResourceConstraints'
import FieldManual         from './modules/FieldManual'
import GlobalTrends        from './modules/GlobalTrends'

export default function App() {
  const [activeModule, setActiveModule]   = useState('landing')
  const [venture, setVenture]             = useState(null)
  const [xp, setXP]                       = useState(0)
  const [isTerminated, setIsTerminated]   = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  const normalizeVenture = (v) => {
    if (!v || typeof v !== 'object') return v
    const weekRaw = Number(v.week)
    const week = Number.isFinite(weekRaw) ? Math.max(1, Math.min(11, Math.floor(weekRaw))) : 1
    const history = Array.isArray(v.history) ? v.history.slice(0, 10) : []
    return { ...v, week, history }
  }

  // ── Hydrate from localStorage ───────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('impactsim_v7') || localStorage.getItem('decydex_v7')
    if (saved) {
      try {
        const p = normalizeVenture(JSON.parse(saved))
        if (p?.ventureId) {
          setVenture(p)
          setXP(p.xp || 0)
          if (p.week > 10) setIsTerminated(true)
        }
      } catch { localStorage.removeItem('impactsim_v7') }
    }
  }, [])

  // ── Re-register venture with server after refresh / restart ──────────────
  useEffect(() => {
    if (!venture?.ventureId) return
    const controller = new AbortController()
    const sync = async () => {
      try {
        await fetch('/api/register-venture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(venture),
          signal: controller.signal,
        })
      } catch {
        // Silent: server may be offline; MissionControl will surface errors if needed
      }
    }
    sync()
    return () => controller.abort()
  }, [venture?.ventureId])

  // ── Update venture state & persist ─────────────────────────────
  const updateVentureState = async (updates) => {
    if (!venture?.ventureId) return
    const nextXP   = (venture.xp || 0) + (updates.xpBonus || 25)

    // ── Append historyEntry to history array ──────────────────────
    const prevHistory = venture.history || []
    const newHistory  = updates.historyEntry
      ? [...prevHistory, updates.historyEntry]
      : prevHistory

    const newState = normalizeVenture({
      ...venture,
      ...updates,
      history: newHistory,
      xp: nextXP,
    })
    // Clean up transient fields before saving
    delete newState.xpBonus
    delete newState.historyEntry

    if ((newState.week || 0) > 10) setIsTerminated(true)
    setVenture(newState)
    setXP(nextXP)
    localStorage.setItem('decydex_v7', JSON.stringify(newState))
    localStorage.setItem('impactsim_v7', JSON.stringify(newState)) // Sync old key for migration safety
    try {
      await fetch('/api/update-venture', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ventureId: venture.ventureId, updates: newState })
      })
    } catch {}
  }


  const startSimulation = () => {
    if (venture?.ventureId) {
      setActiveModule((isTerminated || (venture.week || 0) > 10) ? 'dashboard' : 'sim')
    } else {
      setActiveModule('onboarding')
    }
  }

  const clearHubState = () => {
    localStorage.removeItem('impactsim_v7')
    localStorage.removeItem('decydex_v7')
    setVenture(null); setIsTerminated(false)
    setActiveModule('landing')
  }

  // ── Nav items ───────────────────────────────────────────────────
  const navItems = [
    {
      id: 'onboarding', label: 'Setup Wizard', icon: <Settings2 className="w-4 h-4" />,
    },
    {
      id: 'sim', label: 'Mission Control', icon: <Activity className="w-4 h-4" />,
      disabled: !venture?.ventureId || isTerminated || (venture?.week || 0) > 10,
    },
    { id: 'analytics',    label: 'Analytics',            icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'dashboard',    label: 'Intel Dashboard',      icon: <History className="w-4 h-4" /> },
    { id: 'resources',    label: 'Resource Constraints', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'gov',          label: 'Govt Analysis',        icon: <Landmark className="w-4 h-4" /> },
    { id: 'stakeholders', label: 'Stakeholders',         icon: <Users className="w-4 h-4" /> },
    { id: 'trends',       label: 'Global Trends',        icon: <Globe className="w-4 h-4" /> },
    { id: 'manual',       label: 'Field Manual',         icon: <Layers className="w-4 h-4" /> },
  ]

  // ── Render landing page ─────────────────────────────────────────
  if (activeModule === 'landing') {
    return (
      <LandingPage
        onStart={startSimulation}
        onClear={clearHubState}
        hasVenture={!!venture?.ventureId}
        venture={venture}
      />
    )
  }

  // ── Hub layout ──────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-base text-ink overflow-hidden font-sans bg-mesh">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: sidebarMinimized ? 56 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-col border-r border-border bg-surface flex-shrink-0 relative z-30 overflow-hidden"
      >
        {/* Toggle button */}
        <button
          onClick={() => setSidebarMinimized(!sidebarMinimized)}
          className="absolute -right-3.5 top-12 w-7 h-7 rounded-full bg-elevated border border-border flex items-center justify-center hover:border-neon/30 transition-colors z-50 shadow-md"
        >
          {sidebarMinimized
            ? <ChevronRight className="w-3.5 h-3.5 text-muted" />
            : <ChevronLeft  className="w-3.5 h-3.5 text-muted" />}
        </button>

        {/* Logo */}
        <div
          className={`flex items-center gap-3 p-4 border-b border-border cursor-pointer flex-shrink-0 ${sidebarMinimized ? 'justify-center' : ''}`}
          onClick={() => setActiveModule('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-neon" />
          </div>
          {!sidebarMinimized && (
            <div className="min-w-0">
              <div className="font-head font-semibold text-sm text-ink whitespace-nowrap">
                Decyde<span className="text-neon">X</span>
              </div>
              <div className="text-[10px] text-muted font-mono">v7.0</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-2 space-y-0.5 overflow-y-auto no-scroll ${sidebarMinimized ? 'px-2' : 'px-3'}`}>
          {navItems.map(item => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeModule === item.id}
              onClick={() => setActiveModule(item.id)}
              disabled={item.disabled}
              minimized={sidebarMinimized}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-border flex-shrink-0 ${sidebarMinimized ? 'p-2 flex flex-col items-center gap-2' : 'p-3'}`}>
          <button
            onClick={clearHubState}
            className={`flex items-center gap-2 text-muted hover:text-danger text-xs transition-colors ${sidebarMinimized ? 'justify-center w-full py-1.5' : 'px-1 py-1'}`}
            title="Reset simulation"
          >
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            {!sidebarMinimized && <span className="font-medium text-sm">Reset Simulation</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main content area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header stats bar */}
        <header className="h-13 border-b border-border flex items-center justify-between px-6 bg-surface flex-shrink-0" style={{ height: 52 }}>
          <div className="flex items-center gap-8">
            {venture ? (
              <>
                <StatHeader label="Impact"  value={`${venture?.impactScore ?? 0}%`}
                  color={(venture?.impactScore ?? 0) > 50 ? 'text-neon' : 'text-ink'} />
                <StatHeader label="Runway"  value={`$${(venture?.credits ?? 0).toLocaleString()}`}
                  color={(venture?.credits ?? 0) < 10000 ? 'text-danger' : 'text-ink'} />
                <StatHeader label="Trust"   value={`${venture?.communityTrust ?? 50}%`} color="text-ink" />
                <StatHeader label="Week"    value={`${venture?.week ?? 1}/10`} color="text-ember" />
              </>
            ) : (
                <div className="flex items-center gap-2 text-muted animate-pulse font-mono text-[10px] uppercase font-bold tracking-widest">
                  <Shield className="w-3 h-3" /> INITIALIZING SYSTEM...
                </div>
            )}
          </div>
          <button
            onClick={() => setActiveModule('landing')}
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-elevated transition-all"
            title="Back to home"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
        </header>

        {/* Module content */}
        <main className="flex-1 overflow-y-auto slim-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeModule}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="min-h-full"
            >
              {activeModule === 'onboarding' && (
                venture?.ventureId && !(isTerminated || venture.week > 10) ? (
                  <AlreadySetupState venture={venture} onResume={() => setActiveModule('sim')} onReset={clearHubState} />
                ) : (
                  <SetupWizard onComplete={(data) => { setVenture(data); setActiveModule('sim') }} />
                )
              )}
              {activeModule === 'sim' && (
                venture ? <MissionControl venture={venture} setVenture={updateVentureState} /> : <NoVentureState onStart={() => setActiveModule('onboarding')} />
              )}
              {activeModule === 'analytics' && (
                venture ? <AnalyticsDashboard venture={venture} /> : <NoVentureState onStart={() => setActiveModule('onboarding')} title="Analytics Dashboard" />
              )}
              {activeModule === 'trends' && (
                <GlobalTrends venture={venture} />
              )}
              {activeModule === 'dashboard' && (
                venture ? (
                  <IntelDashboard
                    venture={venture}
                    isTerminated={isTerminated || (venture.week || 0) > 10}
                    onReset={() => {
                      const r = {
                        ...venture, week: 1, credits: venture.startingCredits || 50000,
                        communityTrust: 50, impactScore: 0, history: [], xp
                      }
                      setVenture(r); setIsTerminated(false)
                      localStorage.setItem('decydex_v7', JSON.stringify(r))
                      localStorage.setItem('impactsim_v7', JSON.stringify(r))
                      setActiveModule('sim')
                    }}
                  />
                ) : <NoVentureState onStart={() => setActiveModule('onboarding')} title="Intel Dashboard" />
              )}
              {activeModule === 'gov'       && <GovAnalysis venture={venture} />}
              {activeModule === 'resources' && <ResourceConstraints venture={venture} />}
              {activeModule === 'stakeholders' && <StakeholderNavigator venture={venture} />}
              {activeModule === 'manual'       && <FieldManual />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ── "Already set up" state shown when clicking Setup Wizard with an active venture ──
function AlreadySetupState({ venture, onResume, onReset }) {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 flex flex-col items-center text-center space-y-8">
      <div className="w-16 h-16 rounded-2xl bg-neon/10 border border-neon/20 flex items-center justify-center">
        <Settings2 className="w-8 h-8 text-neon" />
      </div>
      <div className="space-y-3">
        <h2 className="font-head font-semibold text-2xl text-ink">Venture Already Active</h2>
        <p className="text-muted text-base leading-relaxed">
          You have an active simulation for <span className="text-ink font-medium">"{venture.mission?.slice(0, 60)}..."</span>
          <br />in the <span className="text-neon">{venture.track}</span> sector.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="card p-4 text-left space-y-1">
          <div className="label">Sector</div>
          <div className="font-semibold text-ink">{venture.track}</div>
        </div>
        <div className="card p-4 text-left space-y-1">
          <div className="label">Week</div>
          <div className="font-semibold text-ink">{venture.week}/10</div>
        </div>
        <div className="card p-4 text-left space-y-1">
          <div className="label">Capital</div>
          <div className="font-semibold text-neon">${venture.credits?.toLocaleString()}</div>
        </div>
        <div className="card p-4 text-left space-y-1">
          <div className="label">Founder Style</div>
          <div className="font-semibold text-ink">{venture.founderStyle || 'Visionary'}</div>
        </div>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={onResume} className="btn-primary flex-1">
          Resume Mission Control
        </button>
        <button onClick={onReset} className="btn-danger">
          Start Over
        </button>
      </div>
    </div>
  )
}

function NoVentureState({ onStart, title = "Module" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-20 h-20 rounded-3xl bg-elevated border border-border flex items-center justify-center mb-6">
        <Activity className="w-10 h-10 text-muted/30" />
      </div>
      <h2 className="font-head font-bold text-2xl text-ink mb-2">{title}</h2>
      <p className="text-sm text-muted max-w-sm leading-relaxed mb-8">
        This module requires an active venture simulation. Launch your startup from the Setup Wizard to begin tracking real-time impact and analytics.
      </p>
      <button onClick={onStart} className="btn-primary px-8 flex items-center gap-2">
        <Settings2 className="w-4 h-4" /> Go to Setup Wizard
      </button>
    </div>
  )
}
