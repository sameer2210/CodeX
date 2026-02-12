import { useEffect, useMemo } from 'react';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Routes from './routes/Routes';
import { useTheme } from './context/ThemeContext';
import { useAppDispatch, useAppSelector } from './store/hooks';

const App = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useTheme();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const authToken = useAppSelector(state => state.auth.token);
  const authUser = useAppSelector(state => state.auth.user);
  const socketConnected = useAppSelector(state => state.socket.connected);
  const socketConnecting = useAppSelector(state => state.socket.isConnecting);

  // Initialize socket connection once on mount
  useEffect(() => {
    if (isAuthenticated && authToken) {
      dispatch({ type: 'socket/init' });
    }
  }, [dispatch, isAuthenticated, authToken]);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('codex_token', authToken);
    }
  }, [authToken]);

  useEffect(() => {
    if (authUser?.teamName) {
      localStorage.setItem('codex_team', authUser.teamName);
    }
    if (authUser?.username) {
      localStorage.setItem('codex_username', authUser.username);
    }
  }, [authUser]);

  useEffect(() => {
    const tryReconnect = () => {
      if (!isAuthenticated) return;
      if (socketConnected || socketConnecting) return;
      dispatch({ type: 'socket/init' });
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        tryReconnect();
      }
    };

    window.addEventListener('focus', tryReconnect);
    window.addEventListener('online', tryReconnect);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', tryReconnect);
      window.removeEventListener('online', tryReconnect);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [dispatch, isAuthenticated, socketConnected, socketConnecting]);

  const toastStyle = useMemo(
    () => ({
      background: isDarkMode ? 'rgba(12, 14, 17, 0.96)' : 'rgba(255, 255, 255, 0.96)',
      color: isDarkMode ? '#E6E8E5' : '#0B0E11',
      boxShadow: isDarkMode
        ? '0 20px 50px rgba(0, 0, 0, 0.45)'
        : '0 16px 40px rgba(11, 14, 17, 0.12)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '14px',
      padding: '12px 14px',
    }),
    [isDarkMode]
  );

  const toastClassName = useMemo(
    () =>
      [
        'font-sans',
        'text-[13px]',
        'leading-snug',
        'tracking-[0.01em]',
        'rounded-xl',
        'border',
        isDarkMode ? 'border-white/10' : 'border-black/15',
        'data-[type=success]:border-emerald-500/40',
        'data-[type=error]:border-rose-500/40',
        'data-[type=warning]:border-amber-500/40',
        'data-[type=info]:border-sky-500/40',
      ].join(' '),
    [isDarkMode]
  );

  return (
    <ErrorBoundary>
      <Routes />
      <Toaster
        position="top-right"
        theme={isDarkMode ? 'dark' : 'light'}
        richColors
        duration={4500}
        closeButton
        expand={false}
        visibleToasts={3}
        gap={10}
        offset={16}
        toastOptions={{
          style: toastStyle,
          className: toastClassName,
          descriptionClassName: isDarkMode ? 'text-[12px] text-white/60' : 'text-[12px] text-black/60',
        }}
      />
    </ErrorBoundary>
  );
};

export default App;

