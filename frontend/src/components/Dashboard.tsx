import { Swords, ShieldAlert, TrendingUp, Sparkles } from 'lucide-react'
import type { AnalysisType } from '../App'

interface DashboardProps {
  onCardClick: (type: AnalysisType) => void
}

const cards = [
  {
    type: 'competition' as const,
    title: 'Analyze Competition',
    description: 'Deep dive into strategies, pricing & market position',
    icon: Swords,
    gradient: 'from-amber-500/10 via-orange-500/10 to-red-500/10',
    border: 'border-amber-500/20 hover:border-amber-400/40',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    glow: 'hover:shadow-amber-500/10'
  },
  {
    type: 'due_diligence' as const,
    title: 'Merchant Due Diligence',
    description: 'Risk assessment, fraud checks & reputation analysis',
    icon: ShieldAlert,
    gradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
    border: 'border-emerald-500/20 hover:border-emerald-400/40',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    glow: 'hover:shadow-emerald-500/10'
  },
  {
    type: 'market_trends' as const,
    title: 'Market Trends',
    description: 'Macro trends, forecasts & regulatory landscape',
    icon: TrendingUp,
    gradient: 'from-violet-500/10 via-purple-500/10 to-fuchsia-500/10',
    border: 'border-violet-500/20 hover:border-violet-400/40',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    glow: 'hover:shadow-violet-500/10'
  }
]

export default function Dashboard({ onCardClick }: DashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Header */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Intelligence
        </div>
        <h1 className="text-5xl font-display font-semibold tracking-tight mb-3 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
          Market Intelligence
        </h1>
        <p className="text-zinc-500 text-lg max-w-md">
          Deep competitive analysis and due diligence powered by Claude
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {cards.map((card, index) => (
          <button
            key={card.type}
            onClick={() => onCardClick(card.type)}
            className={`
              group relative p-8 rounded-2xl border
              ${card.border}
              bg-gradient-to-br ${card.gradient}
              backdrop-blur-sm
              transition-all duration-500 ease-out
              hover:scale-[1.02] hover:shadow-2xl ${card.glow}
              text-left
              animate-slide-up
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Icon */}
            <div className={`
              inline-flex items-center justify-center
              w-12 h-12 rounded-xl ${card.iconBg}
              mb-5 transition-transform duration-300
              group-hover:scale-110
            `}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>

            {/* Content */}
            <h3 className="text-xl font-display font-semibold text-white mb-2">
              {card.title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {card.description}
            </p>

            {/* Hover arrow */}
            <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <p className="mt-12 text-zinc-600 text-sm">
        Select an analysis type to begin
      </p>
    </div>
  )
}
