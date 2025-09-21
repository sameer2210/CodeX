import { useEffect } from 'react';
import Routes from './routes/Routes';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setTheme } from './store/slices/uiSlice';

const App = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(state => state.ui);

  useEffect(() => {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('codex_theme');
    if (savedTheme) {
      const theme = JSON.parse(savedTheme);
      dispatch(setTheme(theme));
    }

    // Apply initial theme class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dispatch, isDarkMode]);

  // Initialize socket connection once
  useEffect(() => {
    dispatch({ type: 'socket/init' });
  }, [dispatch]);

  return <Routes />;
};

export default App;
