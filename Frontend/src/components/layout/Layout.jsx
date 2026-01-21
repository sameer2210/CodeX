import { Outlet } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import Navigation from './Navigation';

const Layout = () => {
  const { isDarkMode } = useTheme();
  return (
    <div className="min-h-screen bg-[#10120F] text-[#C2CABB] selection:bg-[#C2CABB] selection:text-[#10120F] font-sans antialiased">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-white/[0.02] blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-white/[0.01] blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Navigation />
        {/* <main className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </main> */}

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
