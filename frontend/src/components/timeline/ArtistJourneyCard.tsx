import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { ArtistJourney } from '../../types';
import { formatDuration } from '../../services/api';

interface ArtistJourneyCardProps {
  journey: ArtistJourney;
}

export const ArtistJourneyCard: React.FC<ArtistJourneyCardProps> = ({ journey }) => {
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const toggleAudio = (songId: string, previewUrl: string | null) => {
    if (!previewUrl) return;
    const existingAudio = document.getElementById(`audio-${songId}`) as HTMLAudioElement;

    if (playingAudioId === songId) {
      if (existingAudio) existingAudio.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any currently playing audio
      if (playingAudioId) {
        const prevAudio = document.getElementById(`audio-${playingAudioId}`) as HTMLAudioElement;
        if (prevAudio) prevAudio.pause();
      }
      if (existingAudio) {
        existingAudio.play();
        setPlayingAudioId(songId);
      }
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Core Musical Pillar':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.35)',
          text: '#facc15',
        };
      case 'Era Defining':
        return {
          bg: 'rgba(168, 85, 247, 0.15)',
          border: 'rgba(168, 85, 247, 0.35)',
          text: '#c084fc',
        };
      case 'Heavy Rotation Staple':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.35)',
          text: '#60a5fa',
        };
      case 'Breakout Star':
        return {
          bg: 'rgba(236, 72, 153, 0.15)',
          border: 'rgba(236, 72, 153, 0.35)',
          text: '#f472b6',
        };
      default:
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          border: 'rgba(34, 197, 94, 0.35)',
          text: '#4ade80',
        };
    }
  };

  const tierColors = getTierColor(journey.historicalImportance.tier);

  return (
    <motion.div
      key={journey.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6"
    >
      {/* ─── Hero Header & Status ────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(24, 24, 40, 0.95) 0%, rgba(16, 16, 28, 0.98) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
          {/* Left: Avatar & Identity */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-xl"
                style={{ border: '2px solid rgba(255,255,255,0.1)' }}
              >
                {journey.imageUrl ? (
                  <img
                    src={journey.imageUrl}
                    alt={journey.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500">
                    {journey.name[0]}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950 shadow-md">
                #{journey.currentRank}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: tierColors.bg,
                    border: `1px solid ${tierColors.border}`,
                    color: tierColors.text,
                  }}
                >
                  {journey.historicalImportance.tier}
                </span>

                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {journey.trajectoryLabel}
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {journey.name}
                {journey.spotifyUrl && (
                  <a
                    href={journey.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Open on Spotify"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.216.353-.674.467-1.026.252-2.813-1.718-6.354-2.106-10.523-1.154-.403.092-.803-.162-.895-.565-.092-.403.162-.803.565-.895 4.567-1.042 8.497-.601 11.627 1.336.353.216.467.674.252 1.026zm1.464-3.26c-.272.441-.849.582-1.29.31-3.22-1.979-8.127-2.55-11.933-1.394-.497.151-1.023-.134-1.174-.631-.151-.497.134-1.023.631-1.174 4.356-1.321 9.771-.684 13.456 1.58.441.272.582.849.31 1.29zm.126-3.41c-3.861-2.293-10.228-2.505-13.908-1.388-.592.18-1.218-.16-1.398-.752-.18-.592.16-1.218.752-1.398 4.229-1.284 11.267-1.036 15.717 1.606.532.316.706 1.008.39 1.54-.316.532-1.008.706-1.54.39z" />
                    </svg>
                  </a>
                )}
              </h2>

              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {journey.genres.length > 0 ? journey.genres.slice(0, 3).join(' • ') : 'Eclectic Sound'}
              </p>
            </div>
          </div>

          {/* Right: Historical Importance Gauge */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl shrink-0"
            style={{
              background: 'rgba(10, 10, 20, 0.7)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Historical Importance
              </span>
              <span className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {journey.historicalImportance.score}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </span>
              <span className="text-xs text-slate-400">
                {journey.historicalImportance.erasPresentCount} of 3 Eras Tracked
              </span>
            </div>

            {/* Circular Gauge Miniature */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke={tierColors.text}
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - journey.historicalImportance.score / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">
                {journey.historicalImportance.score}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Story Narrative Card ────────────────────────────────────────── */}
      <div
        className="rounded-3xl p-6 sm:p-7 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 20, 35, 0.8) 0%, rgba(15, 15, 26, 0.9) 100%)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">
            {journey.storyNarrative.chapterTitle}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
            Personal Listening Narrative
          </span>
        </div>

        <h3
          className="text-xl sm:text-2xl font-bold text-white mb-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {journey.storyNarrative.headline}
        </h3>

        <p className="text-sm sm:text-base leading-relaxed text-slate-300 mb-4">
          {journey.storyNarrative.narrative}
        </p>

        <div
          className="p-3.5 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
        >
          <span className="text-lg">✨</span>
          <span className="text-xs sm:text-sm font-medium text-purple-200">
            {journey.storyNarrative.keyHighlight}
          </span>
        </div>
      </div>

      {/* ─── 3 Key Milestone Cards (Prominence, Trend, Peak Day) ──────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Prominence Milestone */}
        <div
          className="rounded-3xl p-5 flex flex-col justify-between"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="text-base">📍</span> Prominence Milestone
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Peak #{journey.prominenceMilestone.peakRank}
              </span>
            </div>

            <h4 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {journey.prominenceMilestone.eraDetected}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {journey.prominenceMilestone.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>First Detected Rank: <strong className="text-slate-200">#{journey.prominenceMilestone.firstRecordedRank ?? '—'}</strong></span>
            <span>Peak Era: <strong className="text-slate-200">{journey.prominenceMilestone.peakEraLabel}</strong></span>
          </div>
        </div>

        {/* 2. Listening Trend Across Eras */}
        <div
          className="rounded-3xl p-5 flex flex-col justify-between"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="text-base">📈</span> Listening Trend
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  journey.listeningTrend.direction === 'rising'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : journey.listeningTrend.direction === 'cooling'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }`}
              >
                {journey.listeningTrend.directionLabel}
              </span>
            </div>

            <h4 className="text-base font-bold text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {journey.listeningTrend.summary}
            </h4>
          </div>

          {/* Visual Sparkline of Rank Nodes */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="grid grid-cols-3 gap-2 text-center">
              {journey.listeningTrend.rankNodes.map((node) => (
                <div
                  key={node.era}
                  className="p-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight block">
                    {node.era === '1_year' ? '1 Year' : node.era === '6_months' ? '6 Mos' : '4 Wks'}
                  </span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    {node.rank !== null ? `#${node.rank}` : 'Unranked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Highest Listening Day (From real ListeningEvents) */}
        <div
          className="rounded-3xl p-5 flex flex-col justify-between"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="text-base">🔥</span> Peak Listening Day
              </span>
              {journey.peakListeningDay.hasRecordedDay && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {journey.peakListeningDay.playCount} Plays Logged
                </span>
              )}
            </div>

            {journey.peakListeningDay.hasRecordedDay ? (
              <>
                <h4 className="text-base font-bold text-emerald-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {journey.peakListeningDay.dateFormatted}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  Highest recorded single-day listening session with{' '}
                  <strong className="text-white">{journey.peakListeningDay.playCount} tracks</strong> played.
                  {journey.peakListeningDay.topTrackName && (
                    <span> Top track on this day: <em>"{journey.peakListeningDay.topTrackName}"</em>.</span>
                  )}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-base font-semibold text-slate-300 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Awaiting Continuous Event History
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  Spotify API supplies top items and rolling batches of recent tracks. As you play music with Lore.fm active, your exact daily play spikes are timestamped here.
                </p>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-500 leading-tight block">
              ℹ️ {journey.peakListeningDay.transparencyNote}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Top 5 Most-Listened Songs from this Artist (All-Time History) ─── */}
      <div
        className="rounded-3xl p-6 sm:p-7"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                All-Time History
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                Ranked by Total Listens
              </span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-bold text-white mt-1"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Top 5 Songs by {journey.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Across all available historical data
          </span>
        </div>

        {journey.topSongs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-sm text-slate-400">
              {journey.name} ranks heavily in your artist rotation, though individual tracks are distributed across your albums and catalog rather than concentrated in a single top track slot.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {journey.topSongs.map((song, i) => (
              <div
                key={song.id}
                className="group p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-4 transition-all hover:bg-slate-800/40"
                style={{
                  background: 'rgba(15, 15, 26, 0.6)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {/* Left: Rank, Art, Title, Album */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="w-5 text-center text-sm font-bold text-slate-500 group-hover:text-emerald-400 shrink-0">
                    {song.allTimeRank ?? i + 1}
                  </span>

                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
                    {song.albumImageUrl ? (
                      <img
                        src={song.albumImageUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        ♫
                      </div>
                    )}

                    {song.previewUrl && (
                      <button
                        onClick={() => toggleAudio(song.id, song.previewUrl)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title={playingAudioId === song.id ? 'Pause Preview' : 'Play Preview'}
                      >
                        {playingAudioId === song.id ? '❚❚' : '▶'}
                      </button>
                    )}
                  </div>

                  {song.previewUrl && (
                    <audio id={`audio-${song.id}`} src={song.previewUrl} onEnded={() => setPlayingAudioId(null)} />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                        {song.title}
                      </h4>
                      {song.explicit && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-700 text-slate-300">
                          E
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {song.albumName} {song.releaseYear && `(${song.releaseYear})`}
                    </p>
                  </div>
                </div>

                {/* Right: All-time rank / recorded plays badge, Duration & Spotify Link */}
                <div className="flex items-center gap-3 shrink-0">
                  {song.recordedPlays > 0 ? (
                    <span
                      className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#6ee7b7',
                      }}
                    >
                      {song.recordedPlays} Logged Play{song.recordedPlays === 1 ? '' : 's'}
                    </span>
                  ) : song.userBestRank ? (
                    <span
                      className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: 'rgba(124, 58, 237, 0.12)',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                        color: '#c4b5fd',
                      }}
                    >
                      Top Track #{song.userBestRank.rank} ({song.userBestRank.periodLabel})
                    </span>
                  ) : null}

                  <span className="text-xs text-slate-500 font-mono">
                    {formatDuration(song.durationMs)}
                  </span>

                  {song.spotifyUrl && (
                    <a
                      href={song.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      title="Open song in Spotify"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.216.353-.674.467-1.026.252-2.813-1.718-6.354-2.106-10.523-1.154-.403.092-.803-.162-.895-.565-.092-.403.162-.803.565-.895 4.567-1.042 8.497-.601 11.627 1.336.353.216.467.674.252 1.026zm1.464-3.26c-.272.441-.849.582-1.29.31-3.22-1.979-8.127-2.55-11.933-1.394-.497.151-1.023-.134-1.174-.631-.151-.497.134-1.023.631-1.174 4.356-1.321 9.771-.684 13.456 1.58.441.272.582.849.31 1.29zm.126-3.41c-3.861-2.293-10.228-2.505-13.908-1.388-.592.18-1.218-.16-1.398-.752-.18-.592.16-1.218.752-1.398 4.229-1.284 11.267-1.036 15.717 1.606.532.316.706 1.008.39 1.54-.316.532-1.008.706-1.54.39z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Data Provenance Footnote ──────────────────────────────────────── */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>
          🔒 All timeline milestones and rankings are calculated strictly from your Spotify account endpoints.
        </span>
        <span className="font-semibold text-slate-400">Lore.fm Grounded Analytics</span>
      </div>
    </motion.div>
  );
};
