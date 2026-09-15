
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load this section. Please try again.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm"
        style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
      >
        <span style={{ color: '#fca5a5' }}>{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs px-3 py-1 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12 px-6 rounded-2xl text-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="text-4xl">⚠️</div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-6 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 active:scale-95"
          style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon = '🎵',
  title,
  message,
}: {
  icon?: string;
  title: string;
  message: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-2xl text-center"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="text-3xl opacity-50">{icon}</div>
      <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{title}</p>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

export function RateLimitState({ retryAfter }: { retryAfter?: number }) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-8 px-6 rounded-2xl text-center"
      style={{ background: 'rgba(251, 191, 36, 0.06)', border: '1px solid rgba(251, 191, 36, 0.2)' }}
    >
      <div className="text-3xl">⏱️</div>
      <p className="font-medium" style={{ color: '#fde68a' }}>Spotify rate limit reached</p>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {retryAfter
          ? `Please wait ${retryAfter} seconds before refreshing.`
          : 'Please wait a moment before refreshing.'}
      </p>
    </div>
  );
}
