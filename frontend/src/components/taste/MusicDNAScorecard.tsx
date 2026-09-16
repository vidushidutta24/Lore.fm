import { motion } from 'framer-motion';
import type { MusicDNAScorecard as DNAData } from '../../types';

interface MusicDNAScorecardProps {
  dna: DNAData;
}

interface ScoreItem {
  id: string;
  label: string;
  score: number;
  color: string;
  icon: string;
  summary: string;
  formula: string;
}

export function MusicDNAScorecard({ dna }: MusicDNAScorecardProps) {
  const scoreItems: ScoreItem[] = [
    {
      id: 'artist',
      label: 'Artist Diversity',
      score: dna.artistDiversity,
      color: 'var(--accent-green)',
      icon: '👥',
      summary:
        dna.artistDiversity > 70
          ? 'High exploration across numerous distinct artists.'
          : dna.artistDiversity > 45
          ? 'Balanced rotation between main favorites and varied artists.'
          : 'High listening concentration among a select few artists.',
      formula: 'Normalized Shannon entropy of your top artist rotation.',
    },
    {
      id: 'genre',
      label: 'Genre Diversity',
      score: dna.genreDiversity,
      color: 'var(--accent-purple)',
      icon: '🎸',
      summary:
        dna.genreDiversity > 70
          ? 'Expansive multi-genre listener with eclectic taste.'
          : dna.genreDiversity > 40
          ? 'Healthy balance of 4–8 core genres with occasional exploration.'
          : 'Highly focused sonic palette centered around primary genres.',
      formula: 'Count and distribution spread of distinct artist genres.',
    },
    {
      id: 'discovery',
      label: 'Discovery Rate',
      score: dna.discoveryRate,
      color: 'var(--accent-blue)',
      icon: '✨',
      summary:
        dna.discoveryRate > 55
          ? 'Actively adopting new artists into your recent rotation.'
          : dna.discoveryRate > 25
          ? 'Moderate influx of new sounds alongside familiar favorites.'
          : 'Strongly anchored in established, familiar favorites.',
      formula: 'Ratio of 4-week short-term artists new to your all-time baseline.',
    },
    {
      id: 'loyalty',
      label: 'Loyalty Index',
      score: dna.loyaltyIndex,
      color: 'var(--accent-pink)',
      icon: '💎',
      summary:
        dna.loyaltyIndex > 65
          ? 'Deep dedication to your historical favorite artists.'
          : dna.loyaltyIndex > 35
          ? 'Steady blend of core anchors and new discoveries.'
          : 'Current listening has shifted away from historical staples.',
      formula: 'Overlap percentage between short-term and all-time top artists.',
    },
    {
      id: 'niche',
      label: 'Niche Affinity',
      score: dna.nicheAffinity,
      color: '#f59e0b',
      icon: '🔦',
      summary:
        dna.nicheAffinity > 60
          ? 'Strong inclination towards underground and indie releases.'
          : dna.nicheAffinity > 40
          ? 'Eclectic blend of popular anthems and hidden gems.'
          : 'Taste predominantly tracks mainstream releases and hits.',
      formula: '100 minus the average Spotify popularity index of your library.',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2
          className="text-xl font-bold flex items-center gap-2"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          <span>🧬</span> Music DNA Scorecard
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Five mathematical dimensions that define your sonic footprint.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {scoreItems.map((item, index) => {
          const circumference = 2 * Math.PI * 30;
          const strokeDashoffset = circumference * (1 - item.score / 100);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="p-5 rounded-2xl flex flex-col items-center text-center justify-between gap-3 group relative overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {/* Radial progress ring */}
              <div className="relative w-20 h-20 my-1">
                <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ delay: index * 0.08 + 0.2, duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold tabular-nums text-white">
                    {item.score}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">/ 100</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 mb-1">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </p>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {item.summary}
                </p>
              </div>

              <div className="w-full pt-2 border-t border-white/5">
                <span className="text-[10px] text-slate-500 block truncate" title={item.formula}>
                  Formula: {item.formula}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
