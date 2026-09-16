import { motion } from 'framer-motion';
import type { AIInterpretation } from '../../types';

interface AiNarrativeCardProps {
  interpretation: AIInterpretation;
}

export function AiNarrativeCard({ interpretation }: AiNarrativeCardProps) {
  const { currentSoundIdentity, yourTasteExplained, metadata } = interpretation;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* 1. Header with AI Intelligence Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            <span>🧠</span> Your Taste, Explained
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-powered interpretation synthesized from your 4-week, 6-month, and 1-year listening signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: metadata.isAIGenerated
                ? 'rgba(168, 85, 247, 0.15)'
                : 'rgba(56, 189, 248, 0.15)',
              border: metadata.isAIGenerated
                ? '1px solid rgba(168, 85, 247, 0.35)'
                : '1px solid rgba(56, 189, 248, 0.35)',
              color: metadata.isAIGenerated ? '#c084fc' : '#38bdf8',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {metadata.isAIGenerated ? 'AI Narrative Layer' : 'Deterministic Synthesis'}
          </span>
        </div>
      </div>

      {/* 2. Sound Right Now Spotlight */}
      <div
        className="p-6 rounded-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.14) 0%, rgba(20, 20, 35, 0.95) 100%)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
          <span>🎧</span>
          <span>Your Sound Right Now</span>
        </div>
        <p
          className="text-lg sm:text-xl font-semibold text-slate-100 leading-snug mb-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          "{currentSoundIdentity.identityStatement}"
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Core Atmosphere:</span>
          <span
            className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-primary)',
            }}
          >
            {currentSoundIdentity.coreAtmosphere}
          </span>
        </div>
      </div>

      {/* 3. Deep Analytical Story Cards */}
      <div
        className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        }}
      >
        <h3
          className="text-lg font-bold mb-4 text-white flex items-center gap-2"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          <span className="text-purple-400">✧</span>
          {yourTasteExplained.title}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm leading-relaxed text-slate-300">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              The Big Picture
            </h4>
            <p>{yourTasteExplained.introduction}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
              Era Progression (4W vs. 6M & 1Y)
            </h4>
            <p>{yourTasteExplained.recentVsLongterm}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Breadth & Focus Balance
            </h4>
            <p>{yourTasteExplained.varietyAndConcentration}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Discovery & Loyalty Dynamics
            </h4>
            <p>{yourTasteExplained.contradictionsAndPatterns}</p>
          </div>
        </div>

        {/* Synthesis quote bar */}
        <div className="mt-6 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs sm:text-sm text-purple-200/95 italic">
          💡 {yourTasteExplained.closingSynthesis}
        </div>

        {/* Attribution note */}
        <p className="mt-4 text-[11px] text-slate-500 italic">
          {metadata.notice}
        </p>
      </div>
    </motion.section>
  );
}
