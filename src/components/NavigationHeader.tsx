import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, ChevronDown, Building2, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const NavigationHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const onDark = location.pathname === '/';

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
            className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            <Sparkles className={`w-5 h-5 ${onDark ? 'text-white/80' : 'text-ai-accent'}`} />
            <span className={onDark ? 'text-white' : 'text-ai-accent'}>Himato</span>
          </Link>

          {/* Auth Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${onDark ? 'hover:bg-white/10' : 'glass hover:bg-white/90'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${onDark ? 'bg-white/20' : 'bg-ai-accent/20'}`}>
                    <User className={`w-4 h-4 ${onDark ? 'text-white' : 'text-ai-accent'}`} />
                  </div>
                  <span className={`text-sm hidden sm:block ${onDark ? 'text-white/90' : 'text-ai-text'}`}>
                    {user?.name.split(' ')[0] || 'User'}
                  </span>
                  {user?.business && (
                    <Building2 className={`w-4 h-4 hidden sm:block ${onDark ? 'text-white/70' : 'text-ai-accent'}`} />
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${onDark ? 'text-white/60' : 'text-ai-muted'} ${showUserMenu ? 'rotate-180' : ''}`} />
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
                        className="absolute right-0 mt-2 w-64 glass rounded-xl border border-black/10 p-2 z-20"
                      >
                        <div className="px-4 py-3 border-b border-black/10">
                          <p className="text-ai-text font-medium text-sm">{user?.name}</p>
                          <p className="text-ai-muted text-xs mt-1">{user?.email}</p>
                          {user?.business && user?.businessName && (
                            <div className="flex items-center gap-2 mt-2">
                              <Building2 className="w-3 h-3 text-ai-accent" />
                              <p className="text-ai-accent text-xs">{user.businessName}</p>
                            </div>
                          )}
                        </div>
                        {user?.business && (
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-ai-accent hover:bg-ai-accent/10 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Building2 className="w-4 h-4" />
                            B2B Dashboard
                          </Link>
                        )}
                        <Link
                          to="/history"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-ai-text hover:bg-black/5 rounded-lg transition-colors text-sm"
                        >
                          <Clock className="w-4 h-4" />
                          My Itineraries
                        </Link>
                        {user?.isAdmin && (
                          <>
                            <div className="my-1 border-t border-black/8" />
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-ai-accent hover:bg-ai-accent/10 rounded-lg transition-colors text-sm font-medium"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/guides"
                              onClick={() => setShowUserMenu(false)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left text-ai-accent hover:bg-ai-accent/10 rounded-lg transition-colors text-sm font-medium"
                            >
                              <ShieldCheck className="w-4 h-4 opacity-60" />
                              Admin: Guides
                            </Link>
                          </>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
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
                  className={`px-4 py-2 text-sm transition-colors ${onDark ? 'text-white/70 hover:text-white' : 'text-ai-muted hover:text-ai-text'}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 text-sm rounded-xl transition-all ${onDark ? 'bg-white/15 hover:bg-white/25 border border-white/30 text-white' : 'bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 text-ai-accent'}`}
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

