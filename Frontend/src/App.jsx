import { useEffect } from 'react';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import Routes from './routes/Routes';
import { useAppDispatch } from './store/hooks';

const App = () => {
  const dispatch = useAppDispatch();

  // Initialize socket connection once on mount
  useEffect(() => {
    dispatch({ type: 'socket/init' });

    // Cleanup on unmount (if your socket middleware supports it)
    // return () => {
    //   dispatch({ type: 'socket/disconnect' });
    // };
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Routes />
      <Toaster
        position="top-right"
        // theme="dark"
        duration={4000}
        closeButton
        toastOptions={{
          style: {
            background: '#10120F',
            border: '1px solid rgba(194, 202, 187, 0.1)',
            color: '#C2CABB',
          },
          className: 'font-mono text-sm',
        }}
      />
    </ErrorBoundary>
  );
};

export default App;
