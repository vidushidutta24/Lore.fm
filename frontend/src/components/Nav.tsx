import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  active: boolean;
}

const NAV_ITEMS: Omit<NavItem, 'active'>[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '◉' },
  { path: '/listening', label: 'Listening', icon: '♪' },
  { path: '/taste', label: 'Taste', icon: '🧬' },
  { path: '/timeline', label: 'Timeline', icon: '📅' },
  { path: '/discover', label: 'Discover', icon: '🔮' },
  { path: '/story', label: 'Story', icon: '📖' },
  { path: '/assistant', label: 'Assistant', icon: '🤖' },
];

const PLACEHOLDER_PATHS = ['/timeline', '/discover', '/story', '/assistant'];

export function Nav() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className="hidden lg:flex flex-col w-56 flex-shrink-0 py-6 px-4 h-screen sticky top-0"
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Logo */}
        <div className="px-3 mb-8">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{ background: 'var(--accent-green)', color: '#000' }}
            >
              ♫
            </div>
            <div>
              <p className="text-xs font-bold leading-none" style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                Lore
              </p>
              <p className="text-xs font-bold leading-none" style={{ color: 'var(--accent-green)', fontFamily: 'Outfit, sans-serif' }}>
                .fm
              </p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const isPlaceholder = PLACEHOLDER_PATHS.includes(item.path);
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={{
                  color: isActive ? '#000' : isPlaceholder ? 'var(--text-muted)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-green)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-card)';
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                    (e.currentTarget as HTMLAnchorElement).style.color = isPlaceholder ? 'var(--text-muted)' : 'var(--text-secondary)';
                  }
                }}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
                {isPlaceholder && (
                  <span
                    className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                    style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-muted)' }}
                  >
                    Soon
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* User profile at bottom */}
        {user && (
          <div
            className="pt-4 mt-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--accent-green)', color: '#000' }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.displayName}
                </p>
                {user.product === 'premium' && (
                  <p className="text-[10px]" style={{ color: 'var(--accent-green)' }}>Premium</p>
                )}
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded-xl text-xs transition-all hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)';
                (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              }}
            >
              Disconnect Spotify
            </button>
          </div>
        )}
      </nav>

      {/* Mobile bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around py-2 px-2"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-0"
              style={{ color: isActive ? 'var(--accent-green)' : 'var(--text-muted)' }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[9px] font-medium truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
