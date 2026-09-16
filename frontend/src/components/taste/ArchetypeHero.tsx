import { motion } from 'framer-motion';
import type { ListenerArchetype, MusicDNAScorecard } from '../../types';

interface ArchetypeHeroProps {
  archetype: ListenerArchetype;
  dna: MusicDNAScorecard;
  timeRangeLabel: string;
}

export function ArchetypeHero({ archetype, dna, timeRangeLabel }: ArchetypeHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10"
      style={{
        background: 'radial-gradient(ellipse at top right, rgba(124, 58, 237, 0.25) 0%, rgba(20, 20, 33, 0.95) 70%), var(--bg-card)',
        border: '1px solid rgba(124, 58, 237, 0.25)',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Background ambient decorative shapes */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left column: Archetype Identity */}
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl sm:text-4xl p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
              {archetype.badge}
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                Listener Archetype • {timeRangeLabel}
              </span>
              <h2
                className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-0.5"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                {archetype.title}
              </h2>
            </div>
          </div>

          <p className="text-sm font-medium text-purple-200/90 mb-3">
            {archetype.subtitle}
          </p>

          <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-6">
            {archetype.description}
          </p>

          {/* Traits pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {archetype.traits.map((trait) => (
              <span
                key={trait}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                }}
              >
                ✦ {trait}
              </span>
            ))}
          </div>

          {/* Signature listening habits */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Signature Listening Patterns
            </p>
            <ul className="space-y-1.5">
              {archetype.signatureHabits.map((habit, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-purple-400 font-bold mt-0.5">▸</span>
                  <span>{habit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: Quick DNA Snapshot Meters */}
        <div
          className="w-full lg:w-80 p-5 rounded-2xl flex flex-col gap-4 bg-black/40 backdrop-blur-md"
          style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>🧬</span> Music DNA Metrics
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
              0–100 Normalized
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Artist Diversity', val: dna.artistDiversity, color: 'var(--accent-green)' },
              { label: 'Genre Diversity', val: dna.genreDiversity, color: 'var(--accent-purple)' },
              { label: 'Discovery Rate', val: dna.discoveryRate, color: 'var(--accent-blue)' },
              { label: 'Loyalty Index', val: dna.loyaltyIndex, color: 'var(--accent-pink)' },
              { label: 'Niche Affinity', val: dna.nicheAffinity, color: '#f59e0b' },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">{item.label}</span>
                  <span className="font-bold tabular-nums text-white">{item.val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${item.val}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-1">
            Deterministic scores computed directly from your Spotify library.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
