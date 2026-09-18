import React from 'react';
import { motion } from 'framer-motion';

interface RecommendationSectionProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'green' | 'purple' | 'cyan' | 'amber' | 'slate';
  count?: number;
  children: React.ReactNode;
}

const BADGE_STYLES = {
  green: {
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
  },
  purple: {
    bg: 'rgba(124, 58, 237, 0.12)',
    border: 'rgba(124, 58, 237, 0.3)',
    text: '#a78bfa',
  },
  cyan: {
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.3)',
    text: '#22d3ee',
  },
  amber: {
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#fbbf24',
  },
  slate: {
    bg: 'rgba(148, 163, 184, 0.1)',
    border: 'rgba(148, 163, 184, 0.2)',
    text: 'var(--text-secondary)',
  },
};

export function RecommendationSection({
  icon,
  title,
  subtitle,
  badge,
  badgeColor = 'slate',
  count,
  children,
}: RecommendationSectionProps) {
  const badgeStyle = BADGE_STYLES[badgeColor];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-5"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-inner"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
              >
                {title}
              </h2>
              {badge && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
                  style={{
                    background: badgeStyle.bg,
                    border: `1px solid ${badgeStyle.border}`,
                    color: badgeStyle.text,
                  }}
                >
                  {badge}
                </span>
              )}
              {count !== undefined && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
                >
                  {count}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {children}
    </motion.section>
  );
}
