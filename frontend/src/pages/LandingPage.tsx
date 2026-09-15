import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

export function LandingPage() {
  const { connectSpotify, isLoading } = useAuth();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Background gradient orbs */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--accent-green), transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--accent-purple), transparent 70%)' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--accent-blue), transparent 70%)' }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg gap-8"
      >
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl"
          style={{
            background: 'linear-gradient(135deg, var(--accent-green), #15803d)',
            boxShadow: '0 0 60px rgba(29,185,84,0.3)',
          }}
        >
          ♫
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col gap-3"
        >
          <h1
            className="text-5xl sm:text-6xl font-black leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)' }}
          >
            Your music<br />
            <span className="gradient-text-green">has a story.</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Connect Spotify and let's discover yours.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your real listening data · Beautiful insights · No fake stats
          </p>
        </motion.div>

        {/* Connect button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button
            id="connect-spotify-btn"
            onClick={connectSpotify}
            disabled={isLoading}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95"
            style={{
              background: 'var(--accent-green)',
              color: '#000',
              boxShadow: '0 0 40px rgba(29,185,84,0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 60px rgba(29,185,84,0.5)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(29,185,84,0.3)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Connect Spotify
          </button>
        </motion.div>

        {/* Feature preview pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {['Top Artists', 'Top Tracks', 'Recently Played', 'Genre Analysis', 'Music Profile'].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-secondary)',
              }}
            >
              {feat}
            </span>
          ))}
        </motion.div>

        {/* Security note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          🔒 No Spotify password stored. Secured with OAuth. Only reads your listening data.
        </motion.p>
      </motion.div>
    </div>
  );
}
