import { motion } from 'framer-motion';
import type { AIInterpretation, TasteAnalysisContext } from '../../types';

interface MusicalMoodCardProps {
  moodData: AIInterpretation['musicalMoodAndTone'];
  context: TasteAnalysisContext;
}

export function MusicalMoodCard({ moodData, context }: MusicalMoodCardProps) {
  const { current, recent, yearly } = context;

  const audioCharacteristics = [
    {
      name: 'Energy',
      y: yearly.musicalCharacteristics.energy,
      r: recent.musicalCharacteristics.energy,
      c: current.musicalCharacteristics.energy,
      unit: '%',
      color: '#ec4899',
    },
    {
      name: 'Tempo',
      y: yearly.musicalCharacteristics.tempo,
      r: recent.musicalCharacteristics.tempo,
      c: current.musicalCharacteristics.tempo,
      unit: ' BPM',
      color: '#8b5cf6',
    },
    {
      name: 'Acousticness',
      y: yearly.musicalCharacteristics.acousticness,
      r: recent.musicalCharacteristics.acousticness,
      c: current.musicalCharacteristics.acousticness,
      unit: '%',
      color: '#10b981',
    },
    {
      name: 'Danceability',
      y: yearly.musicalCharacteristics.danceability,
      r: recent.musicalCharacteristics.danceability,
      c: current.musicalCharacteristics.danceability,
      unit: '%',
      color: '#f59e0b',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 sm:p-8 rounded-3xl relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top right, rgba(168, 85, 247, 0.12) 0%, var(--bg-card) 75%)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            🎭
          </span>
          <div>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
            >
              Musical Mood & Tone
            </h3>
            <p className="text-xs text-slate-400">
              Audio characteristics & sonic textures derived from your track catalog
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold text-purple-300"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
            }}
          >
            {current.musicalCharacteristics.atmosphere}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left column: AI Musical Interpretation */}
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Sonic Atmosphere Interpretation
            </h4>
            <p className="text-sm leading-relaxed text-slate-200">
              {moodData.toneShiftExplanation}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200/90 leading-relaxed">
            🎵 <strong>Current Soundscape:</strong> {moodData.currentSoundscape}
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Note: Lore.fm analyzes musical arrangement and audio production textures, never personal or psychological states.
          </p>
        </div>

        {/* Right column: 4-Way Audio Characteristic Table & Meters */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/5">
            <span>Characteristic</span>
            <span className="font-mono">1-Year → 6-Months → 4-Weeks</span>
          </div>

          {audioCharacteristics.map((char) => (
            <div
              key={char.name}
              className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200">{char.name}</span>
                <span className="font-mono text-xs">
                  <span className="text-slate-500">{char.y}{char.unit}</span>
                  <span className="text-slate-600 mx-1.5">→</span>
                  <span className="text-slate-400">{char.r}{char.unit}</span>
                  <span className="text-slate-600 mx-1.5">→</span>
                  <span className="text-white font-bold">{char.c}{char.unit}</span>
                </span>
              </div>

              {/* Progress bar representing current 4-week value */}
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, char.name === 'Tempo' ? (char.c / 180) * 100 : char.c)}%`,
                    backgroundColor: char.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
