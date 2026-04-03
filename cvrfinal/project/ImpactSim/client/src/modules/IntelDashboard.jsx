import React from 'react'
import { Activity, Target, Users, RefreshCcw, TrendingUp, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import SnakeTimeline from '../components/SnakeTimeline'

export default function IntelDashboard({ venture, isTerminated, onReset }) {

  const curWeek   = Math.max(1, venture?.week || 1)
  const chartData = Array.from({ length: 10 }, (_, i) => ({
    week: `W${i + 1}`,
    impact:  i < curWeek ? Math.round(((venture?.impactScore || 0) / curWeek) * (i + 1)) : null,
    capital: i < curWeek ? Math.round(((venture?.startingCredits || 50000) - (((venture?.startingCredits || 50000) - (venture?.credits || 0)) / curWeek) * (i + 1))) : null
  }))
 
  const runsLeft = (venture?.burnRate || 0) > 0 ? ((venture?.credits || 0) / (venture?.burnRate || 1)).toFixed(1) : '∞'

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span className="label">Live Intel · Week {venture?.week || 1}/10</span>
          <h2 className="font-head font-semibold text-lg text-ink ml-1">Venture Dashboard</h2>
        </div>
        <button onClick={onReset} className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Net Runway',        value: `$${(venture?.credits || 0).toLocaleString()}`, icon: Activity, color: 'text-neon' },
          { label: 'Impact Reach',      value: `${(venture?.impactScore || 0)}%`,             icon: Target,   color: 'text-info' },
          { label: 'Market Resonance',  value: `${(venture?.communityTrust || 50)}%`,          icon: Users,    color: 'text-ember' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card rounded-xl p-4 card-hover group">
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-3.5 h-3.5 text-muted group-hover:text-neon transition-colors" />
              <span className="label">{label}</span>
            </div>
            <div className={`font-head font-semibold text-2xl ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Chart + burn side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon" />
              <div className="label">Mission Trajectory</div>
            </div>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 text-[10px] text-muted"><span className="w-2 h-2 rounded-full bg-neon inline-block" /> Impact</span>
              <span className="flex items-center gap-1 text-[10px] text-muted"><span className="w-2 h-2 rounded-full bg-ember inline-block" /> Capital</span>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00ffd2" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00ffd2" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ff6b2b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff6b2b" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252525" vertical={false} />
                <XAxis dataKey="week" stroke="#6b6b6b" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1c1c1c', border: '1px solid #252525', borderRadius: '8px', fontSize: '10px', fontFamily: 'JetBrains Mono' }} />
                <Area type="monotone" dataKey="impact"  stroke="#00ea64" fill="url(#g1)" strokeWidth={2} connectNulls />
                <Area type="monotone" dataKey="capital" stroke="#ff6b2b" fill="url(#g2)" strokeWidth={2} connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Week bar indicators */}
          <div className="flex gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i < venture.week ? 'bg-neon' : 'bg-elevated'}`} />
            ))}
          </div>
        </div>

        <div className="card rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-3.5 h-3.5 text-ember" />
              <div className="label">Burn Velocity</div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="label mb-1">Weekly Burn Rate</div>
                <div className="font-mono text-base font-bold text-danger">${(venture?.burnRate || 0).toLocaleString()}/wk</div>
              </div>
              <div>
                <div className="label mb-1">Runway Remaining</div>
                <div className="font-mono text-base font-bold text-ink">{runsLeft} weeks</div>
              </div>
              <div>
                <div className="label mb-1">Capital Efficiency</div>
                <div className="h-1.5 bg-elevated rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-neon rounded-full transition-all" style={{ width: `${Math.min((venture.credits / venture.startingCredits) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted leading-relaxed">
              At current burn, {runsLeft} weeks of runway remain. {Number(runsLeft) < 4 ? '⚠ Critical: Seek funding.' : 'Capital levels are sustainable.'}
            </p>
          </div>
        </div>
      </div>

      <div className="card rounded-xl p-5 space-y-4">
        <div className="label">Journey Map — Click any past week to review your choice vs expert strategy</div>
        <SnakeTimeline history={venture.history || []} />
      </div>
    </div>
  )
}
