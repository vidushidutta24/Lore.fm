import { motion } from 'framer-motion';

interface PlaceholderPageProps {
  icon: string;
  title: string;
  description: string;
  phase: string;
}

function PlaceholderPage({ icon, title, description, phase }: PlaceholderPageProps) {
  return (
    <div className="flex-1 min-w-0 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center gap-5 max-w-sm"
      >
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          {icon}
        </div>
        <div className="flex flex-col gap-2">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            {title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        </div>
        <span
          className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
          style={{
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.3)',
            color: '#a78bfa',
          }}
        >
          Coming in {phase}
        </span>
      </motion.div>
    </div>
  );
}

export function DiscoverPage() {
  return (
    <PlaceholderPage
      icon="🔮"
      title="Discover"
      description="Personalized recommendations that explain why each artist or track was suggested, based on your actual listening patterns."
      phase="Phase 3"
    />
  );
}

export function StoryPage() {
  return (
    <PlaceholderPage
      icon="📖"
      title="Music Story"
      description="A playful narrative interpretation of your musical life chapter — built from detected patterns in your listening history."
      phase="Phase 3"
    />
  );
}

export function AssistantPage() {
  return (
    <PlaceholderPage
      icon="🤖"
      title="Music Assistant"
      description="A conversational layer that makes observations about your listening patterns — backed by real data, never invented statistics."
      phase="Phase 4"
    />
  );
}
