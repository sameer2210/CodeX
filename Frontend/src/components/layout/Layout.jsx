import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navigation from './Navigation';

const Layout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen transition-colors duration-300
        ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}
    >
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
