import { motion } from 'framer-motion';
import type { MusicDNA } from '../types';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/ErrorState';

interface ScoreRingProps {
  score: number;
  label: string;
  color: string;
  description: string;
  index: number;
}

function ScoreRing({ score, label, color, description, index }: ScoreRingProps) {
  const pct = Math.round(score * 100);
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference * (1 - score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col items-center gap-3 p-5 rounded-2xl"
      style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Ring */}
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(148,163,184,0.1)" strokeWidth="6" />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-sm font-bold"
          style={{ color }}
        >
          {pct}
        </span>
      </div>
      <p className="text-xs font-semibold text-center uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </motion.div>
  );
}

interface MusicDNAProps {
  dna: MusicDNA | undefined;
  isLoading: boolean;
}

export function MusicDNASection({ dna, isLoading }: MusicDNAProps) {
  return (
    <section>
      <div className="mb-5">
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
        >
          Your Music Profile
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Calculated from your real Spotify data — no invented scores
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl" style={{ background: 'var(--bg-card)' }}>
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !dna && (
        <EmptyState
          icon="🧬"
          title="Profile building..."
          message="Load your top artists and tracks to generate your music profile."
        />
      )}

      {!isLoading && dna && (
        <>
          {/* Archetype card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(59,130,246,0.1) 100%)',
              border: '1px solid rgba(124,58,237,0.25)',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--accent-purple)' }}>
              Your Listener Archetype
            </p>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              {dna.archetype}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {dna.archetypeDescription}
            </p>

            {/* Dominant genres */}
            {dna.dominantGenres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {dna.dominantGenres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(124,58,237,0.2)',
                      color: '#a78bfa',
                      border: '1px solid rgba(124,58,237,0.3)',
                    }}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Score rings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <ScoreRing
              score={dna.artistDiversity.score}
              label="Artist Diversity"
              color="var(--accent-green)"
              description={dna.artistDiversity.description}
              index={0}
            />
            <ScoreRing
              score={dna.genreDiversity.score}
              label="Genre Diversity"
              color="var(--accent-purple)"
              description={dna.genreDiversity.description}
              index={1}
            />
            <ScoreRing
              score={dna.discoveryScore.score}
              label="Discovery"
              color="var(--accent-blue)"
              description={dna.discoveryScore.dataAvailable
                ? dna.discoveryScore.description
                : 'More data needed for discovery analysis.'}
              index={2}
            />
            <ScoreRing
              score={dna.loyaltyScore.score}
              label="Loyalty"
              color="var(--accent-pink)"
              description={dna.loyaltyScore.description}
              index={3}
            />
          </div>

          {/* Loyalty recurring artists */}
          {dna.loyaltyScore.topRecurringArtists.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Your returning favorites: </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {dna.loyaltyScore.topRecurringArtists.join(', ')}
              </span>
            </motion.div>
          )}

          {/* Transparency note */}
          <p className="text-xs mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
            ℹ️ {dna.calculationNote}
          </p>
        </>
      )}
    </section>
  );
}
