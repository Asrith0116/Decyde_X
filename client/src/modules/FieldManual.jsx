import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, History, Zap, FileText, Target, MessageSquare,
  BarChart3, Upload, ChevronDown, ChevronUp, Activity, Globe, DollarSign, Landmark
} from 'lucide-react'

const SECTIONS = [
  {
    id: 'setup',
    icon: Upload,
    color: 'text-neon', border: 'border-neon/20', bg: 'bg-neon/5',
    title: 'Setup Wizard', badge: 'Step 1',
    what: 'Configure your startup before the simulation begins.',
    how: [
      'Upload PDF research or prototype screenshots.',
      'Select your startup domain or provide a custom one.',
      'Describe your mission and geography.',
      'AI assesses your founder style and sets initial capital.'
    ],
    tip: 'The more detail you provide, the more relevant scenarios will be.'
  },
  {
    id: 'mission',
    icon: Activity,
    color: 'text-ember', border: 'border-ember/20', bg: 'bg-ember/5',
    title: 'Mission Control', badge: '10 Weeks',
    what: 'Face real market challenges and make strategic decisions week by week.',
    how: [
      'Each week presents a unique market scenario.',
      'Choose from 4 options with exact capital and trust impacts hidden.',
      'Use the Custom Strategy mode to input your own approach.',
      'After Week 10, your SWOT analysis is automatically generated.'
    ],
    tip: 'Blind decisions mean you must reason through options using business logic, not just look at colored numbers.'
  },
  {
    id: 'analytics',
    icon: BarChart3,
    color: 'text-info', border: 'border-info/20', bg: 'bg-info/5',
    title: 'Analytics', badge: 'Metrics',
    what: 'Examine detailed metrics for your venture.',
    how: [
      'Visualizes impact, trust, and capital efficiency.',
      'Shows historic data over previous weeks.',
      'Helps you identify areas where your strategy is underperforming.'
    ],
    tip: 'Check this often to ensure you are balancing social impact with financial stability.'
  },
  {
    id: 'intel',
    icon: History,
    color: 'text-neon', border: 'border-neon/20', bg: 'bg-neon/5',
    title: 'Intel Dashboard', badge: 'Real-time',
    what: 'Track your venture\'s performance trajectory over 10 weeks.',
    how: [
      'Area chart shows Impact and Capital trajectories week by week.',
      'Burn velocity panel shows weekly burn rate and runway remaining.'
    ],
    tip: 'If capital drops below sustainable levels, it will highlight in red as a warning.'
  },
  {
    id: 'resources',
    icon: DollarSign,
    color: 'text-warning', border: 'border-warning/20', bg: 'bg-warning/5',
    title: 'Resource Constraints', badge: 'Phase Planner',
    what: 'Get an AI-generated 5-phase strategic plan based on your remaining capital.',
    how: [
      'Evaluates current funds and weekly burn.',
      'Maps out phases from MVP to Growth over the coming months.',
      'Allocates your specific budget strictly to tech, legal, marketing, etc.'
    ],
    tip: 'This roadmap dynamically updates as your capital changes throughout the simulation.'
  },
  {
    id: 'gov',
    icon: Landmark,
    color: 'text-ember', border: 'border-ember/20', bg: 'bg-ember/5',
    title: 'Government Analysis', badge: 'Policy Check',
    what: 'Check regulatory risks and specific legal compliance dimensions.',
    how: [
      'Calculates Support Probability and Government Sentiment.',
      'Highlights specific opportunities like subsidies or grants.',
      'Evaluates 6 legal dimensions like Data Privacy, IP, and Labor Laws.'
    ],
    tip: 'A "Positive" government sentiment drastically improves your chance of surviving policy changes.'
  },
  {
    id: 'stakeholders',
    icon: MessageSquare,
    color: 'text-info', border: 'border-info/20', bg: 'bg-info/5',
    title: 'Stakeholders', badge: 'Negotiation',
    what: 'Have realistic conversations with key stakeholders who impact your startup.',
    how: [
      'Talk directly to Government Officials, Lead Investors, or Community Leaders.',
      'Use voice or text to pitch your ideas.',
      'The AI dynamically acts as the chosen persona taking your history into account.'
    ],
    tip: 'Listen to their feedback carefully—each stakeholder cares about different metrics.'
  },
  {
    id: 'trends',
    icon: Globe,
    color: 'text-neon', border: 'border-neon/20', bg: 'bg-neon/5',
    title: 'Global Trends', badge: 'Industry Watch',
    what: 'Monitor macro trends in your specific sector.',
    how: [
      'AI analyzes past data vs current climate.',
      'Provides a future prediction for your industry.',
      'Charts display comparable market flows over time.'
    ],
    tip: 'Use future predictions to guess which domain shifts will occur in Mission Control.'
  }
]

function Section({ section }) {
  const [open, setOpen] = useState(false)
  const Icon = section.icon

  return (
    <div className={`card rounded-xl border-l-4 ${section.border} overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-elevated transition-all"
      >
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${section.border} ${section.bg}`}>
          <Icon className={`w-5 h-5 ${section.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-head font-semibold text-base text-ink">{section.title}</span>
            <span className={`chip text-[9px] ${section.color.replace('text-', 'chip-').split('-')[0]}`}
              style={{ background: 'transparent', border: `1px solid currentColor`, color: 'inherit', opacity: 0.7 }}>
              {section.badge}
            </span>
          </div>
          <p className="text-sm text-muted truncate">{section.what}</p>
        </div>
        {open
          ? <ChevronUp   className="w-4 h-4 text-muted flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5 space-y-4 border-t border-border"
        >
          <div className="pt-4 space-y-4">
            <div>
              <div className="label mb-2">How it works</div>
              <ul className="space-y-2">
                {section.how.map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className={`text-xs font-mono font-bold ${section.color} flex-shrink-0 mt-0.5`}>{i + 1}.</span>
                    <span className="text-sm text-muted leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`flex gap-2 p-3 rounded-lg ${section.bg} border ${section.border}`}>
              <Zap className={`w-4 h-4 ${section.color} flex-shrink-0 mt-0.5`} />
              <p className="text-xs text-ink leading-relaxed"><span className="font-semibold">Pro tip: </span>{section.tip}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function FieldManual() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-neon" />
        </div>
        <div>
          <h2 className="font-head font-semibold text-xl text-ink">Field Manual</h2>
          <p className="text-sm text-muted">Everything you need to know about DecydeX modules.</p>
        </div>
      </div>

      {/* How simulation works — summary */}
      <div className="card rounded-xl p-5 space-y-4">
        <div className="label">Simulation Flow</div>
        <div className="flex items-center gap-2 flex-wrap">
          {['Setup', '→', '10 Weeks', '→', 'SWOT Analysis'].map((s, i) => (
            <span key={i} className={s === '→'
              ? 'text-muted text-sm'
              : 'chip chip-green text-[10px]'
            }>{s}</span>
          ))}
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Start by setting up your venture → face 10 adaptive market challenges → review your SWOT Analysis after 10 weeks.
        </p>
      </div>

      {/* Module sections */}
      <div className="space-y-3">
        <div className="label">Module Guide — Click to expand</div>
        {SECTIONS.map(section => (
          <Section key={section.id} section={section} />
        ))}
      </div>

      {/* Footer tip */}
      <div className="card rounded-xl p-5 flex gap-3">
        <FileText className="w-5 h-5 text-muted flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-semibold text-ink mb-1">Research uploads improve everything</div>
          <p className="text-sm text-muted leading-relaxed">
            Uploading your research PDFs or prototype screenshots in the Setup Wizard 
            directly improves the realism of your scenarios and the depth of your final SWOT analysis.
          </p>
        </div>
      </div>
    </div>
  )
}
