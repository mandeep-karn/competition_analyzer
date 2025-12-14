import { useState } from 'react'
import { ArrowLeft, Search, Swords, ShieldAlert, TrendingUp } from 'lucide-react'
import type { AnalysisType } from '../App'

interface InputFormProps {
  analysisType: AnalysisType
  onSubmit: (companyName: string) => void
  onBack: () => void
  error: string | null
}

const analysisConfig = {
  competition: {
    title: 'Competitive Analysis',
    description: 'Analyze market position, pricing strategies, and competitive landscape',
    placeholder: 'Enter company name (e.g., Klarna, Stripe)',
    icon: Swords,
    color: 'amber'
  },
  due_diligence: {
    title: 'Due Diligence',
    description: 'Assess risks, reputation, and business health',
    placeholder: 'Enter company or merchant name',
    icon: ShieldAlert,
    color: 'emerald'
  },
  market_trends: {
    title: 'Market Trends',
    description: 'Explore industry trends, forecasts, and market dynamics',
    placeholder: 'Enter company or sector name',
    icon: TrendingUp,
    color: 'violet'
  }
}

export default function InputForm({ analysisType, onSubmit, onBack, error }: InputFormProps) {
  const [companyName, setCompanyName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const config = analysisConfig[analysisType]
  const Icon = config.icon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim() || isSubmitting) return
    
    setIsSubmitting(true)
    onSubmit(companyName.trim())
  }

  const colorClasses = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30 focus:border-amber-500/50',
      icon: 'text-amber-400',
      button: 'bg-amber-500 hover:bg-amber-400',
      ring: 'focus:ring-amber-500/20'
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30 focus:border-emerald-500/50',
      icon: 'text-emerald-400',
      button: 'bg-emerald-500 hover:bg-emerald-400',
      ring: 'focus:ring-emerald-500/20'
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30 focus:border-violet-500/50',
      icon: 'text-violet-400',
      button: 'bg-violet-500 hover:bg-violet-400',
      ring: 'focus:ring-violet-500/20'
    }
  }

  const colors = colorClasses[config.color as keyof typeof colorClasses]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} mb-6`}>
            <Icon className={`w-8 h-8 ${colors.icon}`} />
          </div>
          <h1 className="text-3xl font-display font-semibold text-white mb-2">
            {config.title}
          </h1>
          <p className="text-zinc-400">
            {config.description}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={config.placeholder}
              className={`
                w-full pl-12 pr-4 py-4 rounded-xl
                bg-zinc-900/50 border ${colors.border}
                text-white placeholder-zinc-500
                outline-none transition-all duration-200
                focus:ring-2 ${colors.ring}
              `}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!companyName.trim() || isSubmitting}
            className={`
              w-full py-4 rounded-xl font-medium
              ${colors.button} text-white
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              hover:shadow-lg
            `}
          >
            {isSubmitting ? 'Starting analysis...' : 'Run Analysis'}
          </button>
        </form>

        {/* Example companies */}
        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-sm mb-3">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Klarna', 'Stripe', 'Adyen', 'PayPal'].map((name) => (
              <button
                key={name}
                onClick={() => setCompanyName(name)}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
