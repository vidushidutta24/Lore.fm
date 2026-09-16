import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ArtistJourney } from '../../types';
import { ArtistJourneyCard } from './ArtistJourneyCard';

interface Top5ArtistJourneysProps {
  artists: ArtistJourney[];
}

export const Top5ArtistJourneys: React.FC<Top5ArtistJourneysProps> = ({ artists }) => {
  const [selectedArtistId, setSelectedArtistId] = useState<string>(
    artists[0]?.id || ''
  );

  const selectedJourney =
    artists.find((a) => a.id === selectedArtistId) || artists[0];

  if (!selectedJourney) {
    return (
      <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
        <p className="text-slate-400">No artist journey data available yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ─── Top 5 Selector Tab Strip ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Select an Artist to Explore Their Personal Journey
          </span>
          <span className="text-xs text-purple-400 font-medium hidden sm:inline-block">
            {artists.length} Top Artists Analyzed
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {artists.map((artist, index) => {
            const isSelected = artist.id === selectedJourney.id;

            return (
              <motion.button
                key={artist.id}
                onClick={() => setSelectedArtistId(artist.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-3.5 rounded-2xl flex items-center gap-3 transition-all text-left overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 bg-gradient-to-b from-slate-800/90 to-slate-900/90 shadow-xl shadow-emerald-950/20'
                    : 'bg-slate-900/60 hover:bg-slate-800/50 border border-slate-800/70'
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-purple-500"
                  />
                )}

                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shadow-md">
                    {artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-sm">
                        {artist.name[0]}
                      </div>
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Name & Trajectory */}
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-sm font-bold truncate ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {artist.name}
                  </h4>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {artist.trajectoryLabel}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Selected Artist Detail View ──────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <ArtistJourneyCard key={selectedJourney.id} journey={selectedJourney} />
      </AnimatePresence>
    </div>
  );
};
