import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { Nav } from './components/Nav';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { ListeningPage } from './pages/ListeningPage';
import { TastePage } from './pages/TastePage';
import { TimelinePage } from './pages/TimelinePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { StoryPage } from './pages/StoryPage';
import {
  AssistantPage,
} from './pages/PlaceholderPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry auth errors or rate limits
        const err = error as { code?: string };
        if (err?.code === 'UNAUTHORIZED' || err?.code === 'RATE_LIMITED') return false;
        return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000,
    },
  },
});

// ─── Protected layout ─────────────────────────────────────────────
function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            ♫
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="w-full"
        >
          <LandingPage />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <Nav />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="flex-1 min-w-0"
        >
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/taste" element={<TastePage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
