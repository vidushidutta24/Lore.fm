import { motion } from 'framer-motion';
import type { AIInterpretation, TasteAnalysisContext } from '../../types';

interface MultiPeriodComparisonCardProps {
  changeData: AIInterpretation['howTasteHasChanged'];
  context: TasteAnalysisContext;
}

export function MultiPeriodComparisonCard({ changeData, context }: MultiPeriodComparisonCardProps) {
  const { current, recent, yearly, metricDeltas } = context;

  const metricsList = [
    {
      label: 'Artist Diversity',
      yearly: yearly.metrics.artistDiversity,
      recent: recent.metrics.artistDiversity,
      current: current.metrics.artistDiversity,
      delta: metricDeltas.artistDiversity.netChange,
      color: '#8b5cf6',
    },
    {
      label: 'Genre Diversity',
      yearly: yearly.metrics.genreDiversity,
      recent: recent.metrics.genreDiversity,
      current: current.metrics.genreDiversity,
      delta: metricDeltas.genreDiversity.netChange,
      color: '#3b82f6',
    },
    {
      label: 'Discovery Rate',
      yearly: yearly.metrics.discoveryRate,
      recent: recent.metrics.discoveryRate,
      current: current.metrics.discoveryRate,
      delta: metricDeltas.discovery.netChange,
      color: '#10b981',
    },
    {
      label: 'Artist Loyalty',
      yearly: yearly.metrics.loyaltyScore,
      recent: recent.metrics.loyaltyScore,
      current: current.metrics.loyaltyScore,
      delta: metricDeltas.loyalty.netChange,
      color: '#f59e0b',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full"
      style={{
        background: 'radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.12) 0%, var(--bg-card) 70%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 16px 32px -12px rgba(0,0,0,0.4)',
      }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div>
              <h3
                className="text-base font-bold"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                How Your Taste Has Changed
              </h3>
              <p className="text-[11px] text-slate-400">1 Year Baseline → 6 Months → 4 Weeks</p>
            </div>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-blue-400"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
            }}
          >
            Evolution
          </span>
        </div>

        {/* Primary Shift Callout */}
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
          <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mb-1">
            Primary Shift
          </p>
          <p className="text-sm font-semibold text-slate-100">
            {changeData.primaryShift}
          </p>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-slate-300 mb-5">
          {changeData.comparisonNarrative}
        </p>

        {/* 3-Period Metric Progressions */}
        <div className="space-y-3 mb-4">
          {metricsList.map((m) => (
            <div
              key={m.label}
              className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="text-xs font-semibold text-slate-200">{m.label}</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-500">1Y <strong className="text-slate-300">{m.yearly}</strong></span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-500">6M <strong className="text-slate-300">{m.recent}</strong></span>
                <span className="text-slate-600">→</span>
                <span className="text-slate-500">4W <strong className="text-white font-bold">{m.current}</strong></span>

                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    m.delta > 0
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : m.delta < 0
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {m.delta > 0 ? `+${m.delta}` : m.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Timeline: <strong>Continuous Spotify Snapshots</strong></span>
        <span>Accuracy: <strong>100% Calculated</strong></span>
      </div>
    </motion.div>
  );
}
