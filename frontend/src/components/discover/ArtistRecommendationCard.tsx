import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MLArtistRecommendation } from '../../types';

interface ArtistRecommendationCardProps {
  artist: MLArtistRecommendation;
  index?: number;
}

const CATEGORY_CONFIG: Record<
  string,
  { label: string; bg: string; border: string; text: string; dotColor: string }
> = {
  SIMILAR: {
    label: 'Similar to Taste',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
    dotColor: '#10b981',
  },
  DISCOVER: {
    label: 'New Artist',
    bg: 'rgba(124, 58, 237, 0.12)',
    border: 'rgba(124, 58, 237, 0.3)',
    text: '#a78bfa',
    dotColor: '#7c3aed',
  },
  EXPLORE: {
    label: 'Taste Horizon',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: '#22d3ee',
    dotColor: '#06b6d4',
  },
  WILDCARD: {
    label: 'Wildcard',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#fbbf24',
    dotColor: '#f59e0b',
  },
};

export function ArtistRecommendationCard({ artist, index = 0 }: ArtistRecommendationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const matchPercent = Math.round((artist.recommendation_score || 0) * 100);
  const categoryMeta = CATEGORY_CONFIG[artist.category] || CATEGORY_CONFIG.DISCOVER;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover-lift p-5"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(148, 163, 184, 0.2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
      }}
    >
      {/* Top Header: Category & Match Score */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
          style={{
            background: categoryMeta.bg,
            border: `1px solid ${categoryMeta.border}`,
            color: categoryMeta.text,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: categoryMeta.dotColor }}
          />
          {categoryMeta.label}
        </span>

        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'var(--text-primary)',
          }}
        >
          {matchPercent}% Match
        </span>
      </div>

      {/* Artist Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-800/40">
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-slate-500">
              🎤
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-bold text-base line-clamp-1 group-hover:text-emerald-400 transition-colors"
            style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}
            title={artist.name}
          >
            {artist.name}
          </h3>

          {/* Genre tags */}
          {artist.genres && artist.genres.length > 0 && (
            <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {artist.genres.slice(0, 3).join(' · ')}
            </p>
          )}

          {artist.popularity !== null && artist.popularity !== undefined && (
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1 w-16 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${artist.popularity}%`,
                    background: 'var(--accent-green)',
                  }}
                />
              </div>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {artist.popularity}% pop
              </span>
            </div>
          )}
        </div>
      </div>

      {/* "Why This Artist?" Explanation */}
      {artist.explanation && (
        <div
          className="p-3 rounded-xl text-xs flex flex-col gap-1.5 mb-4"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-1.5 font-medium text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            <span>🧬</span>
            <span className="font-semibold text-slate-300">Why Lore picked this:</span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {artist.explanation}
          </p>

          {/* Matched Signal Tags */}
          {artist.matched_signals && artist.matched_signals.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-white/5">
              {artist.matched_signals.slice(0, 2).map((sig, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    background: 'rgba(148, 163, 184, 0.08)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {sig.description}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer: Signals toggle & Spotify Link */}
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[11px] flex items-center gap-1 transition-colors hover:text-white"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{showDetails ? 'Hide signals' : 'ML Signals'}</span>
          <span className="text-[10px]">{showDetails ? '▲' : '▼'}</span>
        </button>

        {artist.spotify_url && (
          <a
            href={artist.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-emerald-500/20 active:scale-95"
            style={{
              color: 'var(--accent-green)',
              background: 'rgba(29, 185, 84, 0.1)',
              border: '1px solid rgba(29, 185, 84, 0.25)',
            }}
            title="Open on Spotify"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span>Open Profile</span>
          </a>
        )}
      </div>

      {/* Metrics Breakdown */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 flex flex-col gap-1.5 overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="p-1.5 rounded bg-white/5">
                <div className="text-[10px] text-slate-400">Taste Sim</div>
                <div className="text-xs font-semibold text-slate-200">
                  {Math.round((artist.similarity_score || 0) * 100)}%
                </div>
              </div>
              <div className="p-1.5 rounded bg-white/5">
                <div className="text-[10px] text-slate-400">Novelty</div>
                <div className="text-xs font-semibold text-purple-300">
                  {Math.round((artist.novelty_score || 0) * 100)}%
                </div>
              </div>
              <div className="p-1.5 rounded bg-white/5">
                <div className="text-[10px] text-slate-400">Genre Aff</div>
                <div className="text-xs font-semibold text-emerald-300">
                  {Math.round((artist.genre_affinity_score || 0) * 100)}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
