import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const NavigationHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Don't show header on auth pages or terms page
  const hideHeader = location.pathname === '/login' || 
                     location.pathname === '/register' || 
                     location.pathname === '/terms';

  if (hideHeader) return null;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="absolute top-10 left-10 right-10 z-50 rounded-xl" style={{ border: 'none', outline: 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-accent hover:opacity-80 transition-opacity"
          >
            <span className="text-ai-accent">Himato</span>
          </Link>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-ai-card/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-ai-accent/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-ai-accent" />
                  </div>
                  <span className="text-sm text-white hidden sm:block">
                    {user?.name.split(' ')[0] || 'User'}
                  </span>
                  {user?.business && (
                    <Building2 className="w-4 h-4 text-ai-accent hidden sm:block" />
                  )}
                  <ChevronDown className={`w-4 h-4 text-ai-muted transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 glass rounded-xl border border-white/10 p-2 z-20"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white font-medium text-sm">{user?.name}</p>
                          <p className="text-ai-muted text-xs mt-1">{user?.email}</p>
                          {user?.business && user?.businessName && (
                            <div className="flex items-center gap-2 mt-2">
                              <Building2 className="w-3 h-3 text-ai-accent" />
                              <p className="text-ai-accent text-xs">{user.businessName}</p>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-200 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-ai-muted hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 hover:border-ai-accent/50 text-ai-accent rounded-xl transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

