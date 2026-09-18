import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryChapter, StoryTrackEvidence } from '../../types';

interface StoryChapterCardProps {
  chapter: StoryChapter;
  index: number;
}

const TYPE_THEMES: Record<
  string,
  {
    gradient: string;
    border: string;
    badgeBg: string;
    badgeText: string;
    accentGlow: string;
    roman: string;
  }
> = {
  TASTE_SHIFT: {
    gradient: 'from-purple-950/30 via-slate-900/90 to-indigo-950/40',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    badgeBg: 'bg-purple-500/15 border-purple-500/30',
    badgeText: 'text-purple-300',
    accentGlow: 'bg-purple-500/10',
    roman: 'I',
  },
  OBSESSION: {
    gradient: 'from-amber-950/30 via-slate-900/90 to-orange-950/40',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-300',
    accentGlow: 'bg-amber-500/10',
    roman: 'II',
  },
  NEW_ARRIVAL: {
    gradient: 'from-emerald-950/30 via-slate-900/90 to-teal-950/40',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-300',
    accentGlow: 'bg-emerald-500/10',
    roman: 'III',
  },
  THE_FADE: {
    gradient: 'from-rose-950/30 via-slate-900/90 to-orange-950/40',
    border: 'border-rose-500/20 hover:border-rose-500/40',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    badgeText: 'text-rose-300',
    accentGlow: 'bg-rose-500/10',
    roman: 'IV',
  },
  AFTER_MIDNIGHT: {
    gradient: 'from-blue-950/30 via-slate-900/90 to-indigo-950/40',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    badgeBg: 'bg-blue-500/15 border-blue-500/30',
    badgeText: 'text-blue-300',
    accentGlow: 'bg-blue-500/10',
    roman: 'V',
  },
  RABBIT_HOLE: {
    gradient: 'from-cyan-950/30 via-slate-900/90 to-violet-950/40',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30',
    badgeText: 'text-cyan-300',
    accentGlow: 'bg-cyan-500/10',
    roman: 'VI',
  },
};

export const StoryChapterCard: React.FC<StoryChapterCardProps> = ({ chapter, index }) => {
  const [showEvidence, setShowEvidence] = useState(true);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const theme = TYPE_THEMES[chapter.type] || TYPE_THEMES.TASTE_SHIFT;

  const handleTogglePlay = (track: StoryTrackEvidence) => {
    if (!track.previewUrl) return;

    if (playingTrackId === track.trackId) {
      audioRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(track.previewUrl);
      audio.onended = () => setPlayingTrackId(null);
      audio.play().catch(() => setPlayingTrackId(null));
      audioRef.current = audio;
      setPlayingTrackId(track.trackId);
    }
  };

  return (
    <motion.article
      id={chapter.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`relative rounded-3xl p-6 sm:p-10 border ${theme.border} bg-gradient-to-br ${theme.gradient} backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col gap-8 group`}
    >
      {/* Background Accent Glow */}
      <div
        className={`absolute -top-12 -right-12 w-64 h-64 ${theme.accentGlow} rounded-full blur-3xl pointer-events-none transition-all duration-500 group-hover:scale-110`}
      />

      {/* Chapter Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-2xl text-xl font-bold ${theme.badgeBg} ${theme.badgeText} shadow-inner`}
          >
            {chapter.emoji}
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400">
              Chapter {chapter.chapterNumber} • {chapter.type.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500 font-mono">{chapter.period.label}</span>
          </div>
        </div>

        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
            showEvidence
              ? `${theme.badgeBg} ${theme.badgeText}`
              : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
          }`}
        >
          <span>{showEvidence ? 'Hide Evidence' : 'Inspect Evidence'}</span>
          <span>{showEvidence ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Story Chapter Title & Subtitle */}
      <div className="flex flex-col gap-2">
        <h2
          className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {chapter.title}
        </h2>
        <p className="text-base sm:text-lg font-medium text-slate-300 italic">
          "{chapter.subtitle}"
        </p>
      </div>

      {/* Narrative Body / Storybook Paragraphs */}
      <div className="flex flex-col gap-4 text-slate-200 leading-relaxed text-base sm:text-lg font-normal">
        {chapter.paragraphs.map((paragraph, pIdx) => (
          <p key={pIdx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-white">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Moral Quote Box */}
      {chapter.moral && (
        <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3.5">
          <span className="text-2xl">✨</span>
          <p className="text-sm sm:text-base text-slate-300 italic font-serif leading-snug">
            {chapter.moral}
          </p>
        </div>
      )}

      {/* Factual Fact Chips */}
      {Object.keys(chapter.facts).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {Object.entries(chapter.facts).map(([key, value]) => {
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .toLowerCase();
            return (
              <div
                key={key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300"
              >
                <span className="text-slate-500 capitalize">{formattedKey}:</span>
                <span className="font-semibold text-slate-200">
                  {Array.isArray(value) ? value.join(', ') : String(value)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Expandable Evidence Drawer (Tracks & Artists) */}
      <AnimatePresence>
        {showEvidence && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-white/10 flex flex-col gap-5 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-semibold flex items-center gap-2">
                <span>🎵</span> Verified Supporting Evidence
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                From your Spotify playback stream & snapshots
              </span>
            </div>

            {/* Evidence Tracks Grid */}
            {chapter.evidenceTracks.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium text-slate-400">Key Track Evidence:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {chapter.evidenceTracks.map((track) => {
                    const isPlaying = playingTrackId === track.trackId;
                    return (
                      <div
                        key={track.trackId}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-black/50 border border-white/5 hover:border-white/20 transition-all group/track"
                      >
                        {/* Track Album Art */}
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                          {track.albumImageUrl ? (
                            <img
                              src={track.albumImageUrl}
                              alt={track.trackName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                              ♫
                            </div>
                          )}

                          {track.previewUrl && (
                            <button
                              onClick={() => handleTogglePlay(track)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/track:opacity-100 transition-opacity"
                              title={isPlaying ? 'Pause Preview' : 'Play 30s Preview'}
                            >
                              <span className="text-white text-sm">
                                {isPlaying ? '⏸' : '▶'}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Track Details */}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold text-white truncate">
                            {track.trackName}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            {track.artistName}
                          </span>
                          {track.roleDescription && (
                            <span className="text-[11px] text-purple-300/80 truncate mt-0.5">
                              {track.roleDescription}
                            </span>
                          )}
                        </div>

                        {/* Spotify Link Button */}
                        {track.spotifyUrl && (
                          <a
                            href={track.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs transition-colors flex-shrink-0"
                            title="Open in Spotify"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Evidence Artists */}
            {chapter.evidenceArtists.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-medium text-slate-400">Featured Artists:</span>
                <div className="flex flex-wrap items-center gap-3">
                  {chapter.evidenceArtists.map((artist) => (
                    <div
                      key={artist.artistId}
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-black/40 border border-white/5"
                    >
                      {artist.imageUrl && (
                        <img
                          src={artist.imageUrl}
                          alt={artist.artistName}
                          className="w-7 h-7 rounded-full object-cover border border-white/10"
                        />
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-200">
                          {artist.artistName}
                        </span>
                        {artist.roleDescription && (
                          <span className="text-[10px] text-slate-400">
                            {artist.roleDescription}
                          </span>
                        )}
                      </div>
                      {artist.spotifyUrl && (
                        <a
                          href={artist.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 text-xs hover:underline ml-1"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
