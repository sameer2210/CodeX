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
      <Toaster position="top-right" richColors />
    </>
  );
};

export default App;
