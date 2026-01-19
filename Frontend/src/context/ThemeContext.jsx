// import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// const ThemeContext = createContext(null);

// export const useTheme = () => {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
//   return ctx;
// };

// export const ThemeProvider = ({ children }) => {
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem('codex_theme')) ?? true;
//     } catch {
//       return true;
//     }
//   });

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', isDarkMode);
//     localStorage.setItem('codex_theme', JSON.stringify(isDarkMode));
//   }, [isDarkMode]);

//   const value = useMemo(
//     () => ({ isDarkMode, useTheme: () => setIsDarkMode(p => !p) }),
//     [isDarkMode]
//   );

//   return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
// };



// // import { useTheme } from '../../context/ThemeContext';


import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('codex_theme')) ?? true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('codex_theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(p => !p);

  const value = useMemo(() => ({ isDarkMode, toggleTheme }), [isDarkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
