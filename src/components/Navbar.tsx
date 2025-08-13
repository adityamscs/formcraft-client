import { Link, useLocation } from "react-router-dom";
import { Plus, Sparkles, Home } from "lucide-react";
import { useEffect, useState } from "react";

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check if dark class is already applied to document
    return document.documentElement.classList.contains('dark');
  });

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    const root = document.documentElement;
    if (newIsDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      localStorage.setItem('darkMode', 'true');
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't manually set a preference
      if (localStorage.getItem('darkMode') === null) {
        const newIsDark = e.matches;
        setIsDark(newIsDark);
        
        const root = document.documentElement;
        if (newIsDark) {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <nav className="glass px-6 py-5 flex items-center justify-between border-b border-gray-200 dark:border-slate-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-18">
          <Link
            to="/"
            className="flex items-center space-x-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block">FormCraft</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-blue-100/80 text-blue-700 shadow-sm dark:bg-blue-500/20 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60"
              }`}
            >
              <Home size={18} />
              <span className="hidden sm:block">Dashboard</span>
            </Link>

            <Link
              to="/builder"
              className="btn-primary flex items-center space-x-2 text-sm"
            >
              <Plus size={18} />
              <span>Create Form</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="btn-secondary ml-2 text-sm"
              title={isDark ? 'Switch to light' : 'Switch to dark'}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
