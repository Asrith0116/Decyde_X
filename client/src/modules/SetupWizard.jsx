import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, FileText, Zap, ChevronRight, Upload, X, Image, File } from 'lucide-react'

const useSpeech = (onTranscript) => {
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  React.useEffect(() => {
    if (window.webkitSpeechRecognition) {
      rec.current = new window.webkitSpeechRecognition()
      rec.current.continuous = true; rec.current.interimResults = true
      rec.current.onresult = (e) => onTranscript(Array.from(e.results).map(r => r[0].transcript).join(''))
      rec.current.onend = () => setListening(false)
    }
  }, [onTranscript])
  const toggle = () => {
    if (listening) { rec.current?.stop(); setListening(false) }
    else           { rec.current?.start(); setListening(true) }
  }
  return { listening, toggle, supported: !!window.webkitSpeechRecognition }
}

const TRACKS = [
  { id: 'EdTech',         emoji: '🎓', desc: 'Education & Learning' },
  { id: 'HealthTech',     emoji: '🏥', desc: 'Healthcare & Wellness' },
  { id: 'ClimateTech',   emoji: '🌿', desc: 'Climate & Sustainability' },
  { id: 'FinTech',        emoji: '💳', desc: 'Finance & Payments' },
  { id: 'AgriTech',       emoji: '🌾', desc: 'Agriculture & Food' },
  { id: 'Custom',         emoji: '✨', desc: 'My own unique idea' },
]

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [researchText, setResearchText] = useState('')
  const [track, setTrack] = useState('')
  const [customIdea, setCustomIdea] = useState('')
  const [mission, setMission] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const { listening, toggle, supported } = useSpeech(useCallback((t) => setMission(t), []))

  const handleFiles = async (files) => {
    const arr = Array.from(files)
    const newFiles = arr.map(f => ({ name: f.name, size: f.size, type: f.type, ref: f }))
    setUploadedFiles(prev => [...prev, ...newFiles])

    setUploading(true)
    try {
      const fd = new FormData()
      arr.forEach(f => fd.append('files', f))
      const resp = await fetch('/api/upload-research', { method: 'POST', body: fd })
      const data = await resp.json()
      setResearchText(prev => prev + '\n' + data.text)
    } catch { /* silent */ }
    finally { setUploading(false) }
  }

  const removeFile = (i) => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))

  const handleNext = async () => {
    if (step < 2) { setStep(s => s + 1); return }
    setLoading(true)
    // If custom, auto-detect domain from customIdea + mission
    const effectiveTrack = track === 'Custom'
      ? await detectCustomDomain(customIdea + ' ' + mission)
      : track
    try {
      const resp = await fetch('/api/assess-founder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: effectiveTrack, mission, researchContent: researchText, customIdea })
      })
      const data = await resp.json()
      onComplete({
        ...data,
        track: effectiveTrack,
        originalTrack: track,
        customIdeaDescription: customIdea,
        mission, researchContent: researchText,
        ventureId: data.ventureId, credits: data.initialCapital || 50000,
        startingCredits: data.initialCapital || 50000, burnRate: data.burnRate || 2500,
        communityTrust: 50, impactScore: 0, week: 1, history: [], xp: 0,
      })
    } catch { alert('Assessment failed. Check server.') }
    finally { setLoading(false) }
  }

  // Auto-detect domain from free-text description
  const detectCustomDomain = async (text) => {
    const t = text.toLowerCase()
    if (/\b(school|learn|teach|educat|student|curriculum|tutor|course|classroom)/.test(t)) return 'EdTech'
    if (/\b(health|hospital|doctor|patient|clinic|medic|mental|wellbeing|pharma)/.test(t)) return 'HealthTech'
    if (/\b(climate|solar|carbon|environment|green|sustain|renewable|emission|energy)/.test(t)) return 'ClimateTech'
    if (/\b(pay|bank|loan|credit|invest|finance|wallet|money|insuran|fintech)/.test(t)) return 'FinTech'
    if (/\b(farm|crop|agri|food|rural|harvest|soil|irrigation|livestock)/.test(t)) return 'AgriTech'
    try {
      // Fallback: ask server to detect
      const r = await fetch('/api/detect-domain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text })
      })
      const d = await r.json()
      return d.domain || 'Social Impact'
    } catch {
      return 'Social Impact'
    }
  }

  const canNext = step === 0 ? true : step === 1 ? (!!track && (track !== 'Custom' || !!customIdea.trim())) : !!mission

  const steps = ['Research', 'Domain', 'Mission']

  return (
    <div className="flex flex-col items-center justify-center min-h-full py-12 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl"
      >
        <div className="card rounded-2xl p-8 space-y-8 bg-surface">
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-neon' : 'text-muted'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-all ${
                    i < step  ? 'bg-neon border-neon text-base' :
                    i === step ? 'border-neon text-neon' : 'border-border text-muted'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px transition-all ${i < step ? 'bg-neon/40' : 'bg-border'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* ── Step 0: Upload ────────────────────────────── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-head font-bold text-3xl text-ink">Upload Research</h2>
                    <p className="text-sm text-muted mt-2">PDFs and images of your research, prototype, or documentation. This improves AI context and report accuracy.</p>
                  </div>

                  {/* Drop zone */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                      dragOver ? 'border-neon bg-neon/5' : 'border-border hover:border-muted'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
                    onClick={() => fileRef.current.click()}
                  >
                    <input ref={fileRef} type="file" multiple accept=".pdf,image/*" className="hidden"
                      onChange={(e) => handleFiles(e.target.files)} />
                    <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${dragOver ? 'text-neon' : 'text-muted'}`} />
                    <p className="text-base font-semibold text-ink">Drag & drop files here</p>
                    <p className="text-sm text-muted mt-2">PDF research docs, prototype screenshots, market data images</p>
                    <span className="chip chip-green mt-3 inline-flex">Optional but recommended</span>
                  </div>

                  {/* File list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 card-raised rounded-lg">
                          {f.type.startsWith('image/') ? <Image className="w-4 h-4 text-ember flex-shrink-0" /> : <File className="w-4 h-4 text-neon flex-shrink-0" />}
                          <span className="text-xs text-ink flex-1 truncate">{f.name}</span>
                          <span className="text-[10px] text-muted">{(f.size / 1024).toFixed(0)} KB</span>
                          <button onClick={() => removeFile(i)} className="text-muted hover:text-danger transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {uploading && (
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <div className="w-3 h-3 border border-neon border-t-transparent rounded-full animate-spin" />
                          Processing files...
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted border border-border rounded-lg p-3 bg-elevated flex gap-2">
                    <Zap className="w-3.5 h-3.5 text-ember flex-shrink-0 mt-0.5" />
                    <span>Your uploads inform scenario generation, SWOT analysis, and final compatibility scoring. Skip if you don't have research documents yet.</span>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-head font-bold text-3xl text-ink">Select Domain</h2>
                    <p className="text-sm text-muted mt-2">Choose your startup's primary sector, or describe your own idea.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {TRACKS.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTrack(t.id)}
                        className={`p-5 rounded-xl border-2 text-left transition-all ${
                          track === t.id
                            ? 'border-neon bg-neon/10'
                            : 'border-border hover:border-muted bg-elevated'
                        }`}
                      >
                        <div className="text-2xl mb-2">{t.emoji}</div>
                        <div className={`font-head font-semibold text-sm ${track === t.id ? 'text-neon' : 'text-ink'}`}>{t.id}</div>
                        <div className="text-[10px] text-muted mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom idea input */}
                  {track === 'Custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="label flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-ember" />
                        Describe your custom idea
                      </label>
                      <textarea
                        value={customIdea}
                        onChange={e => setCustomIdea(e.target.value)}
                        className="textarea h-36 text-base p-4"
                        placeholder="e.g. A drone-based last-mile delivery network for rural pharmacies in Tier-3 India…"
                      />
                      <p className="text-[10px] text-muted">
                        💡 We'll auto-detect your domain from this description to show you the right Global Trends data.
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── Step 2: Mission ──────────────────────────── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-head font-bold text-3xl text-ink">Describe Your Mission</h2>
                      <p className="text-sm text-muted mt-2">What problem you're solving, where, and for whom.</p>
                    </div>
                    {supported && (
                      <button onClick={toggle} className={`p-2 rounded-lg border transition-all ${
                        listening ? 'bg-neon/20 border-neon text-neon animate-pulse' : 'border-border text-muted hover:text-ink'
                      }`}>
                        {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  <textarea
                    value={mission}
                    onChange={e => setMission(e.target.value)}
                    className="textarea h-64 text-lg p-6 leading-relaxed"
                    placeholder="e.g. We're building a micro-learning platform for STEM education in rural India, targeting students aged 12–18 with no reliable internet access..."
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-neon">
                      <Zap className="w-3 h-3" />
                      {uploadedFiles.length} research file{uploadedFiles.length > 1 ? 's' : ''} will enhance AI analysis
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2 border-t border-border">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} className="btn-secondary px-6">
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canNext || loading || uploading}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />Analyzing...</>
              ) : step === 2 ? 'Launch Simulation' : (
                <>{step === 0 ? 'Continue' : 'Next'}<ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
