import { motion } from 'framer-motion';
import type { LoyaltyDiscoveryInsight } from '../../types';

interface LoyaltyAndDiscoveryCardProps {
  data: LoyaltyDiscoveryInsight;
}

export function LoyaltyAndDiscoveryCard({ data }: LoyaltyAndDiscoveryCardProps) {
  return (
    <div
      className="p-6 rounded-3xl flex flex-col justify-between gap-6"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Loyalty vs. Discovery Dynamics
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/30">
            {data.retentionRate}% Long-Term Retention
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Comparing lifelong anchors against fresh artists entering your rotation.
        </p>
      </div>

      {/* Split Grid: Loyal Anchors vs Fresh Discoveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Loyal Anchors */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <span>💎</span> Loyal Anchors
              </span>
              <span className="text-xs font-bold text-slate-300">
                Score: {data.loyaltyScore}/100
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{data.loyaltySummary}</p>

            <div className="space-y-2">
              {data.loyalAnchors.slice(0, 4).map((artist, idx) => (
                <motion.div
                  key={artist.id || idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02]"
                >
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                      👑
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{artist.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {artist.genres.slice(0, 2).join(', ') || 'Core Favorite'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-pink-400/80 bg-pink-500/10 px-2 py-0.5 rounded-full">
                    Anchor
                  </span>
                </motion.div>
              ))}
              {data.loyalAnchors.length === 0 && (
                <p className="text-xs text-slate-500 italic py-2">
                  Building long-term history to identify permanent anchors.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Fresh Discoveries */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/5 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <span>✨</span> Fresh Discoveries
              </span>
              <span className="text-xs font-bold text-slate-300">
                Score: {data.discoveryScore}/100
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{data.discoverySummary}</p>

            <div className="space-y-2">
              {data.freshDiscoveries.slice(0, 4).map((artist, idx) => (
                <motion.div
                  key={artist.id || idx}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02]"
                >
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs">
                      🌟
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{artist.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {artist.genres.slice(0, 2).join(', ') || 'New Addition'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-400/80 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    New in 4w
                  </span>
                </motion.div>
              ))}
              {data.freshDiscoveries.length === 0 && (
                <p className="text-xs text-slate-500 italic py-2">
                  No newly introduced artists in recent rotation.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
