import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { track } from '../utils/analytics';
import { GoogleSignInButton } from './auth/GoogleSignInButton';
import { PhoneLogin } from './auth/PhoneLogin';
import { EMAIL_AUTH_ENABLED, PHONE_AUTH_ENABLED } from '../utils/authMethods';

interface LoginProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  // Render as a card only (no full-page wrapper) — used inside AuthModal
  embedded?: boolean;
  initialEmail?: string;
  subtitle?: string;
}

export const Login = ({ onSuccess, onSwitchToRegister, embedded = false, initialEmail = '', subtitle = 'Sign in to plan and save your trips' }: LoginProps) => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Pre-fill email if coming from (dev) registration
  const stateEmail = (location.state as { email?: string } | null)?.email;
  const [email, setEmail] = useState(stateEmail || initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const finish = useCallback(() => {
    if (onSuccess) {
      onSuccess();
    } else {
      navigate('/');
    }
  }, [onSuccess, navigate]);

  const handleGoogle = useCallback(async (credential: string) => {
    setError('');
    track('auth_started', { method: 'google' });
    setIsLoading(true);
    try {
      await loginWithGoogle(credential);
      finish();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [loginWithGoogle, finish]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    track('auth_started', { method: 'email' });
    setIsLoading(true);

    try {
      await login({ email, password });
      track('login_completed', { method: 'email' });
      finish();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'min-h-screen flex items-center justify-center px-4 py-12 bg-ai-dark'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className={embedded ? 'p-8' : 'glass rounded-2xl p-8'}>
          <div className="text-center mb-7">
            <Link to="/" aria-label="Himato home" className="inline-block mb-1">
              <img src="/logo-mark.webp" alt="Himato" className="h-20 w-auto mx-auto" />
            </Link>
            <h1 className="text-2xl font-bold text-ai-text">Welcome to Himato</h1>
            <p className="text-ai-muted text-sm mt-1.5">{subtitle}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Google */}
          <GoogleSignInButton onCredential={handleGoogle} disabled={isLoading} />

          {/* Email + password */}
          {EMAIL_AUTH_ENABLED && (
            <>
              <div className="flex items-center gap-3 my-5">
                <span className="h-px flex-1 bg-black/10" />
                <span className="text-xs font-medium uppercase tracking-wider text-ai-muted">or sign in with email</span>
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-ai-text mb-1.5">
                    Email <span className="text-ai-warm">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ai-muted" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      id="login-email"
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 bg-ai-card/50 border border-black/10 rounded-xl text-ai-text placeholder:text-ai-muted/70 focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-ai-text mb-1.5">
                    Password <span className="text-ai-warm">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ai-muted" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      id="login-password"
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-11 py-3 bg-ai-card/50 border border-black/10 rounded-xl text-ai-text placeholder:text-ai-muted/70 focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ai-muted hover:text-ai-text"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <LogIn className="w-4 h-4" />}
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-ai-muted">
                New to Himato?{' '}
                {onSwitchToRegister ? (
                  <button type="button" onClick={onSwitchToRegister} className="text-ai-accent font-semibold hover:underline">Create an account</button>
                ) : (
                  <Link to="/register" className="text-ai-accent font-semibold hover:underline">Create an account</Link>
                )}
              </p>
            </>
          )}

          {/* Phone OTP — enabled once Fast2SMS is approved (VITE_ENABLE_PHONE_AUTH) */}
          {PHONE_AUTH_ENABLED && (
            <>
              <div className="flex items-center gap-3 my-5">
                <span className="h-px flex-1 bg-black/10" />
                <span className="text-xs font-medium uppercase tracking-wider text-ai-muted">or use your phone</span>
                <span className="h-px flex-1 bg-black/10" />
              </div>
              <PhoneLogin onSuccess={finish} onError={setError} />
            </>
          )}

          <p className="mt-6 text-center text-xs text-ai-muted leading-relaxed">
            By continuing, you agree to our{' '}
            <Link to="/terms" target="_blank" className="text-ai-accent hover:underline">Terms and Conditions</Link>.
          </p>

          {!embedded && (
            <div className="mt-3 text-center">
              <Link to="/" className="text-ai-muted hover:text-ai-text text-sm transition-colors">
                ← Back to Himato
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
