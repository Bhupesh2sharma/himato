import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { track } from '../utils/analytics';
import { AGENT_APP_URL } from '../utils/externalApps';
import { EmailCodeStep } from './auth/EmailCodeStep';

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: (email?: string) => void;
  // Render as a card only (no full-page wrapper) — used inside AuthModal
  embedded?: boolean;
}

const labelCls = 'block text-sm font-medium text-ai-text mb-1.5';
const inputCls = 'w-full pl-10 pr-4 py-3 bg-ai-card/50 border border-black/10 rounded-xl text-ai-text placeholder:text-ai-muted/70 focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all disabled:opacity-60';
const iconCls = 'absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ai-muted';
const hintCls = 'mt-1.5 text-xs text-ai-muted';

export const Register = ({ onSuccess, onSwitchToLogin, embedded = false }: RegisterProps) => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNo: '',
    password: '',
    acceptTermsAndConditions: false,
    business: false,
    businessName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Set once the code has been emailed → shows the code step
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendIn, setResendIn] = useState(30);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    track('signup_started');

    if (!formData.acceptTermsAndConditions) {
      setError('Please accept the Terms and Conditions to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const { email, resendIn: wait } = await register({
        ...formData,
        businessName: '',
      });
      // Keep the form filled in, so "Change details" can go back to it
      setResendIn(wait || 30);
      setPendingEmail(email);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Code confirmed → account created and signed in
  const handleVerified = () => {
    track('signup_completed', { method: 'email' });
    if (onSuccess) onSuccess();
    else navigate('/');
  };

  if (pendingEmail) {
    return (
      <div className={embedded ? '' : 'min-h-screen flex items-center justify-center px-4 py-12 bg-ai-dark'}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className={embedded ? 'p-8' : 'glass rounded-2xl p-8'}>
            <EmailCodeStep
              email={pendingEmail}
              resendIn={resendIn}
              onVerified={handleVerified}
              onBack={() => setPendingEmail('')}
            />
          </div>
        </motion.div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-ai-text">Create your account</h1>
            <p className="text-ai-muted text-sm mt-1.5">Plan your Sikkim trips and keep them in one place.</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>
                Name <span className="text-ai-warm">*</span>
              </label>
              <div className="relative">
                <User className={iconCls} />
                <input
                  id="name"
                  placeholder="Enter your full name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelCls}>
                Email <span className="text-ai-warm">*</span>
              </label>
              <div className="relative">
                <Mail className={iconCls} />
                <input
                  id="email"
                  placeholder="Enter your email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  disabled={isLoading}
                />
              </div>
              <p className={hintCls}>We'll email you a code to confirm it.</p>
            </div>

            <div>
              <label htmlFor="password" className={labelCls}>
                Password <span className="text-ai-warm">*</span>
              </label>
              <div className="relative">
                <Lock className={iconCls} />
                <input
                  id="password"
                  placeholder="Create a password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={`${inputCls} pr-11`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ai-muted hover:text-ai-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className={hintCls}>At least 6 characters.</p>
            </div>

            <div>
              <label htmlFor="phoneNo" className={labelCls}>
                Phone <span className="font-normal text-ai-muted">(optional)</span>
              </label>
              <div className="relative">
                <Phone className={iconCls} />
                <input
                  id="phoneNo"
                  placeholder="10-digit mobile number"
                  name="phoneNo"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  className={inputCls}
                  disabled={isLoading}
                />
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group pt-1">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 flex-shrink-0 ${formData.acceptTermsAndConditions ? 'bg-ai-accent border-ai-accent' : 'border-ai-muted group-hover:border-ai-accent'}`}>
                {formData.acceptTermsAndConditions && <Check className="w-3 h-3 text-ai-dark" />}
              </div>
              <input
                name="acceptTermsAndConditions"
                type="checkbox"
                checked={formData.acceptTermsAndConditions}
                onChange={handleChange}
                required
                className="hidden"
                disabled={isLoading}
              />
              <span className="text-sm text-ai-muted group-hover:text-ai-text transition-colors">
                I accept the{' '}
                <Link to="/terms" target="_blank" className="text-ai-accent hover:underline font-medium">
                  Terms and Conditions
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {isLoading ? 'Sending code…' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ai-muted text-sm">
              Already have an account?{' '}
              {onSwitchToLogin ? (
                <button
                  onClick={() => onSwitchToLogin()}
                  className="text-ai-accent hover:text-ai-accent/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-ai-accent hover:text-ai-accent/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              )}
            </p>
          </div>

          <p className="mt-3 text-center text-xs text-ai-muted">
            Travel agent?{' '}
            <a href={`${AGENT_APP_URL}/register`} className="text-ai-accent hover:text-ai-accent/80 font-medium transition-colors">
              Create an agency account
            </a>
          </p>

          {!embedded && (
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-ai-muted hover:text-ai-text text-sm transition-colors"
              >
                ← Back to Himato
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

