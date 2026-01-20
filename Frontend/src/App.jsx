//app.jsx
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import Routes from './routes/Routes';
import { useAppDispatch } from './store/hooks';

const App = () => {
  const dispatch = useAppDispatch();

  // one-time socket init
  useEffect(() => {
    dispatch({ type: 'socket/init' });
  }, [dispatch]);

  return (
    <>
      <Routes />
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#10120F',
            border: '1px solid rgba(194, 202, 187, 0.1)',
            color: '#C2CABB',
          },
        }}
        // richColors
      />
    </>
  );
};

export default App;
