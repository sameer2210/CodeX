import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const { scrollY } = useScroll();
  const logoSrc = '/logo.png';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useMotionValueEvent(scrollY, 'change', latest => {
    setIsScrolled(latest > 20);
  });

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Login', path: '/login' },
    { label: 'Register', path: '/register' },
  ];

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.header
      variants={navbarVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-8 sm:px-22 py-3.5 ${
        isScrolled
          ? 'bg-[#10120F]/80 backdrop-blur-md border-b border-[#C2CABB]/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <motion.button
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
        >
          <div className="relative w-10 h-10 flex top-2.5 items-center justify-center bg-[#C2CABB]/5 rounded-full border border-[#C2CABB]/10 overflow-hidden group-hover:border-[#C2CABB]/30 transition-colors group-hover:shadow-[0_0_12px_rgba(194,202,187,0.2)]">
            {!logoFailed ? (
              <img
                src={logoSrc}
                alt="CodeX logo"
                className="w-10 h-10 object-contain rounded-xl relative z-10"
                onError={() => setLogoFailed(true)}
                draggable="false"
              />
            ) : (
              <Terminal className="w-5 h-5 text-[#C2CABB] relative z-10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </motion.button>

        <nav className="ml-auto flex items-center gap-8 sm:gap-16">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative group py-2"
                whileHover={{ y: -1 }}
              >
                <span
                  className={`text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-[#C2CABB] group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-[1px] bg-white"
                  />
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#C2CABB]/40 transition-all duration-300 group-hover:w-full" />
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.header>
  );
};

export default Navigation;
