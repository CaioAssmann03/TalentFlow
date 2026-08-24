import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ScanLine } from 'lucide-react'

export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = size === 'lg' ? 'text-3xl md:text-4xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="relative w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center overflow-hidden">
        <ScanLine size={16} className="text-cyan-400" strokeWidth={2.5} />
      </div>
      <span className={`font-[var(--font-display)] font-semibold tracking-tight ${textSize} text-mist-100`}>
        HireLens<span className="text-cyan-400"> Ético</span>
      </span>
    </div>
  )
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-semibold text-ink-950 transition-all hover:bg-cyan-400 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-ink-600 bg-ink-800/60 px-6 py-3.5 font-semibold text-mist-100 transition-all hover:border-cyan-500/50 hover:text-cyan-400 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function DangerButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-signal-red/40 bg-signal-red/10 px-5 py-3 font-semibold text-signal-red transition-all hover:bg-signal-red/20 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink-700 bg-ink-900/70 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

export function Pill({
  children,
  tone = 'default',
}: {
  children: ReactNode
  tone?: 'default' | 'cyan' | 'green' | 'red' | 'amber'
}) {
  const tones: Record<string, string> = {
    default: 'bg-ink-700 text-mist-300 border-ink-600',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    green: 'bg-signal-green/10 text-signal-green border-signal-green/30',
    red: 'bg-signal-red/10 text-signal-red border-signal-red/30',
    amber: 'bg-signal-amber/10 text-signal-amber border-signal-amber/30',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function ValueBar({ label, score, tone = 'cyan' }: { label: string; score: number; tone?: 'cyan' | 'red' | 'green' }) {
  const barColor = tone === 'red' ? 'bg-signal-red' : tone === 'green' ? 'bg-signal-green' : 'bg-cyan-400'
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-mist-100">{label}</span>
        <span className="font-[var(--font-mono)] text-sm text-mist-300">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-ink-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(2, score)}%` }}
        />
      </div>
    </div>
  )
}

export function OptionBar({ letter, label, pct, count, isLeading }: { letter: string; label: string; pct: number; count: number; isLeading?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 transition-colors ${isLeading ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-ink-700 bg-ink-800/40'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="font-[var(--font-mono)] text-xs mt-0.5 text-mist-400 shrink-0">{letter.toUpperCase()}</span>
          <span className="text-sm text-mist-100 leading-snug min-w-0">{label}</span>
        </div>
        <span className="font-[var(--font-mono)] text-sm text-cyan-400 shrink-0">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-ink-700 overflow-hidden ml-6">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${isLeading ? 'bg-cyan-400' : 'bg-ink-600'}`}
          style={{ width: `${Math.max(1, pct)}%` }}
        />
      </div>
      <div className="ml-6 mt-1 text-[11px] text-mist-400">{count} {count === 1 ? 'voto' : 'votos'}</div>
    </div>
  )
}

export function LoadingScreen({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink-950">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-ink-700" />
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
      <p className="text-mist-400 text-sm font-[var(--font-mono)]">{label}</p>
    </div>
  )
}
