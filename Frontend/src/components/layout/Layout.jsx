import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import Navigation from './Navigation';

const Layout = () => {
  const { isDarkMode } = useAppSelector(state => state.ui);

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
