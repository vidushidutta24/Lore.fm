import { motion } from 'framer-motion';
import type { OverviewStats } from '../types';
import { StatsSkeleton } from './ui/Skeleton';

interface QuickStatsProps {
  stats: OverviewStats | undefined;
  isLoading: boolean;
}

interface StatItemProps {
  label: string;
  value: string | number | null;
  sub?: string;
  imageUrl?: string | null;
  index: number;
}

function StatItem({ label, value, sub, imageUrl, index }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col gap-1.5 p-4 rounded-2xl hover-lift"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-2">
        {imageUrl && (
          <img src={imageUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
        )}
        <span
          className="text-base font-bold truncate leading-tight"
          style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}
        >
          {value ?? '—'}
        </span>
      </div>
      {sub && (
        <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
          {sub}
        </span>
      )}
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
    </motion.div>
  );
}

export function QuickStats({ stats, isLoading }: QuickStatsProps) {
  if (isLoading) return <StatsSkeleton />;

  const items: StatItemProps[] = [
    {
      index: 0,
      label: 'Top Artist',
      value: stats?.topArtist?.name ?? null,
      imageUrl: stats?.topArtist?.imageUrl,
    },
    {
      index: 1,
      label: 'Top Track',
      value: stats?.topTrack?.name ?? null,
      sub: stats?.topTrack?.artistName,
      imageUrl: stats?.topTrack?.imageUrl,
    },
    {
      index: 2,
      label: 'Top Genre',
      value: stats?.dominantGenre
        ? stats.dominantGenre.charAt(0).toUpperCase() + stats.dominantGenre.slice(1)
        : null,
    },
    {
      index: 3,
      label: 'Tracks This Week',
      value: stats?.recentlyPlayedCount ?? null,
    },
    {
      index: 4,
      label: 'Unique Artists',
      value: stats?.uniqueArtistCount ?? null,
    },
    {
      index: 5,
      label: 'Unique Genres',
      value: stats?.uniqueGenreCount ?? null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <StatItem key={item.label} {...item} />
      ))}
    </div>
  );
}
