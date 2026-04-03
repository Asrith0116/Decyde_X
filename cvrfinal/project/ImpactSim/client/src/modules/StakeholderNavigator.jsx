import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Mic, MicOff, Send, Users, Building2, Banknote, TreePine, AlertCircle } from 'lucide-react'

const useSpeech = (onT) => {
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  React.useEffect(() => {
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

const PERSONAS = [
  {
    id: 'Government Ministry official',
    label: 'Government Official',
    sub: 'Policy · Regulation · Compliance',
    icon: Building2,
    color: 'text-info',
    border: 'border-info/20',
    bg: 'bg-info/5',
    tip: 'Focus on regulatory compliance, social impact metrics, and policy alignment when pitching.',
  },
  {
    id: 'Lead Investor',
    label: 'Lead Investor',
    sub: 'ROI · Scalability · Exit Strategy',
    icon: Banknote,
    color: 'text-neon',
    border: 'border-neon/20',
    bg: 'bg-neon/5',
    tip: 'Lead with traction, unit economics, and your go-to-market strategy first.',
  },
  {
    id: 'Community Leader',
    label: 'Community Leader',
    sub: 'Trust · Local Impact · Inclusion',
    icon: TreePine,
    color: 'text-ember',
    border: 'border-ember/20',
    bg: 'bg-ember/5',
    tip: 'Emphasize local benefit, community ownership, and cultural sensitivity.',
  },
]

export default function StakeholderNavigator({ venture }) {
  const [selectedId, setSelectedId] = useState(PERSONAS[0].id)
  const [messages, setMessages]     = useState([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const bottomRef = useRef(null)

  const persona = PERSONAS.find(p => p.id === selectedId) || PERSONAS[0]
  const { listening, toggle, supported } = useSpeech(useCallback(t => setInput(t), []))

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const hist    = [...messages, userMsg]
    setMessages(hist); setInput(''); setLoading(true)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    try {
      const r = await fetch('/api/negotiate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: selectedId, message: input, history: messages.slice(-6) })
      })
      const data = await r.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Connection lost. Try again.' }]) }
    finally { setLoading(false); setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50) }
  }

  return (
    <div className="flex h-full max-w-5xl mx-auto overflow-hidden" style={{ height: 'calc(100vh - 52px)' }}>
      {/* ── Left: Persona sidebar ──────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-r border-border flex flex-col overflow-y-auto slim-scroll bg-surface">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5 mb-1">
            <Users className="w-4 h-4 text-muted" />
            <h2 className="font-head font-semibold text-base text-ink">Stakeholders</h2>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Negotiate with key stakeholders who influence your startup's growth. Each persona has a unique perspective and priorities.
          </p>
        </div>

        {/* Persona list */}
        <div className="p-3 space-y-2 flex-1">
          {PERSONAS.map(p => {
            const Icon = p.icon
            const active = selectedId === p.id
            return (
              <button
                key={p.id}
                onClick={() => { setSelectedId(p.id); setMessages([]) }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  active ? `${p.border} ${p.bg}` : 'border-border hover:border-muted bg-elevated'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${active ? `${p.border} ${p.bg}` : 'border-border bg-surface'}`}>
                    <Icon className={`w-4 h-4 ${active ? p.color : 'text-muted'}`} />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold leading-tight ${active ? 'text-ink' : 'text-muted'}`}>{p.label}</div>
                    <div className="text-[10px] text-muted font-mono">{p.sub}</div>
                  </div>
                </div>
                {active && (
                  <div className={`text-xs leading-relaxed ${p.color} opacity-80 border-l-2 ${p.border} pl-3`}>
                    {p.tip}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* How to use */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2 p-3 rounded-lg bg-elevated border border-border">
            <AlertCircle className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted leading-relaxed">
              Ask for funding, regulatory approval, partnerships, or community support. Responses simulate realistic stakeholder negotiations.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Chat area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${persona.border} ${persona.bg}`}>
              {React.createElement(persona.icon, { className: `w-4.5 h-4.5 ${persona.color}` })}
            </div>
            <div>
              <div className="font-head font-semibold text-base text-ink">{persona.label}</div>
              <div className="text-xs text-muted">{persona.sub}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span className="text-xs text-neon font-mono">Active</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto slim-scroll p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-10">
              <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center ${persona.border} ${persona.bg}`}>
                {React.createElement(persona.icon, { className: `w-8 h-8 ${persona.color}` })}
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-head font-semibold text-lg text-ink">{persona.label}</h3>
                <p className="text-sm text-muted leading-relaxed">{persona.tip}</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {[
                  `Can you support our ${venture?.track || 'EdTech'} initiative?`,
                  'What are your concerns about our approach?',
                  'How can we align with your priorities?',
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(sug) }}
                    className="text-left px-4 py-2.5 card card-hover rounded-lg text-sm text-muted hover:text-ink"
                  >
                    "{sug}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-neon text-base font-medium'
                      : `card border ${persona.border} text-ink`
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className={`card border ${persona.border} px-5 py-3.5 rounded-2xl flex gap-2 items-center`}>
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${persona.color.replace('text-', 'bg-')} animate-bounce`}
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-muted">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        <div className="p-4 border-t border-border bg-surface flex-shrink-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                placeholder={`Message ${persona.label}...`}
                className="input pr-12 w-full"
              />
            </div>
            {supported && (
              <button onClick={toggle} className={`p-3 rounded-xl border transition-all flex-shrink-0 ${
                listening ? 'bg-neon/20 border-neon text-neon' : 'border-border text-muted hover:text-ink hover:border-muted'
              }`}>
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button onClick={send} disabled={!input.trim() || loading}
              className="p-3 bg-neon hover:bg-neon/90 text-base font-medium rounded-xl transition-all disabled:opacity-30 flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
