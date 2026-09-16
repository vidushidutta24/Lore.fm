import { motion } from 'framer-motion';
import type { ListeningTrendsInsight } from '../../types';

interface RecentTrendsCardProps {
  data: ListeningTrendsInsight;
}

export function RecentTrendsCard({ data }: RecentTrendsCardProps) {
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
            <span className="text-xl">🔥</span>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Recent Listening Momentum & Trends
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Live Rotation
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Heavy rotation artists and on-repeat track loops from your recent activity.
        </p>
      </div>

      {/* Observation Badges */}
      {data.observations.length > 0 && (
        <div className="space-y-2">
          {data.observations.map((obs, i) => {
            const isFact = obs.tag === 'Fact';
            const isTrend = obs.tag === 'Trend';

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-2xl flex items-start gap-2.5 bg-white/[0.02] border border-white/5"
              >
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5"
                  style={{
                    background: isFact
                      ? 'rgba(29, 185, 84, 0.15)'
                      : isTrend
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(124, 58, 237, 0.15)',
                    color: isFact
                      ? 'var(--accent-green)'
                      : isTrend
                      ? 'var(--accent-blue)'
                      : 'var(--accent-purple)',
                    border: '1px solid currentColor',
                  }}
                >
                  {obs.tag}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{obs.text}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Heavy Rotation Artists & Repeat Loops Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Heavy Rotation Artists */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            ⚡ Heavy Rotation Artists
          </span>
          {data.heavyRotationArtists.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No recent playback stream events logged.</p>
          ) : (
            <div className="space-y-2">
              {data.heavyRotationArtists.slice(0, 3).map((artist) => (
                <div key={artist.name} className="flex items-center gap-2.5">
                  {artist.imageUrl ? (
                    <img
                      src={artist.imageUrl}
                      alt={artist.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                      🎤
                    </div>
                  )}
                  <span className="text-xs font-medium text-slate-200 flex-1 truncate">
                    {artist.name}
                  </span>
                  <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                    {artist.recentTrackCount} plays
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* On-Repeat Tracks */}
        <div className="p-4 rounded-2xl bg-black/25 border border-white/5 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            🔁 On-Repeat Track Loops
          </span>
          {data.repeatTracks.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No duplicate loops detected in recent history.</p>
          ) : (
            <div className="space-y-2">
              {data.repeatTracks.slice(0, 3).map((track) => (
                <div key={track.id} className="flex items-center gap-2.5">
                  {track.imageUrl ? (
                    <img
                      src={track.imageUrl}
                      alt={track.name}
                      className="w-7 h-7 rounded-lg object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs">
                      🎵
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate">{track.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{track.artistName}</p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {track.playCount}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description Footer */}
      <p className="text-[11px] text-slate-400 text-center">
        {data.description}
      </p>
    </div>
  );
}
