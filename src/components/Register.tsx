import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, Building2, Check, AlertCircle, Eye, EyeOff, CheckCircle2, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface RegisterProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const Register = ({ onSuccess, onSwitchToLogin }: RegisterProps) => {
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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

    if (!formData.acceptTermsAndConditions) {
      setError('Please accept the Terms and Conditions to continue.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        ...formData,
        businessName: formData.business ? formData.businessName : '',
      });
      // Show success message
      setRegisteredEmail(formData.email);
      setShowSuccess(true);
      // Clear form
      setFormData({
        name: '',
        email: '',
        phoneNo: '',
        password: '',
        acceptTermsAndConditions: false,
        business: false,
        businessName: '',
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    if (onSwitchToLogin) {
      onSwitchToLogin();
    } else {
      // Navigate to login page with email pre-filled if possible
      navigate('/login', { state: { email: registeredEmail } });
    }
  };

  // Show success message and login form
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-ai-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-8">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-muted">
                  Registration Successful!
                </h2>
                <p className="text-ai-muted mb-6">
                  Your account has been created successfully. Please sign in to continue.
                </p>
                <button
                  onClick={handleGoToLogin}
                  className="w-full py-3 bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 hover:border-ai-accent/50 text-ai-accent font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  Go to Sign In
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-ai-dark">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-ai-text to-ai-muted">
              Create Account
            </h1>
            <p className="text-ai-muted">Join us and start planning your journey</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ai-muted mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ai-muted" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-ai-card/50 border border-white/10 rounded-xl text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ai-muted mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ai-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-ai-card/50 border border-white/10 rounded-xl text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNo" className="block text-sm font-medium text-ai-muted mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ai-muted" />
                <input
                  id="phoneNo"
                  name="phoneNo"
                  type="tel"
                  value={formData.phoneNo}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-ai-card/50 border border-white/10 rounded-xl text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                  placeholder="+91 9876543210"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ai-muted mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ai-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-ai-card/50 border border-white/10 rounded-xl text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                  placeholder="Create a password (min. 6 characters)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ai-muted hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors mt-0.5 flex-shrink-0 ${formData.business ? 'bg-ai-accent border-ai-accent' : 'border-ai-muted group-hover:border-ai-accent'}`}>
                  {formData.business && <Check className="w-3 h-3 text-ai-dark" />}
                </div>
                <input
                  name="business"
                  type="checkbox"
                  checked={formData.business}
                  onChange={handleChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <span className={`text-sm ${formData.business ? 'text-ai-accent' : 'text-ai-muted group-hover:text-white'} transition-colors`}>
                  I am a Business / Travel Agent
                </span>
              </label>
            </div>

            {formData.business && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label htmlFor="businessName" className="block text-sm font-medium text-ai-muted mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ai-muted" />
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-ai-card/50 border border-white/10 rounded-xl text-white placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all"
                    placeholder="Your Business Name"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
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
                <span className={`text-sm ${formData.acceptTermsAndConditions ? 'text-ai-accent' : 'text-ai-muted group-hover:text-white'} transition-colors`}>
                  I accept the{' '}
                  <Link
                    to="/terms"
                    target="_blank"
                    className="text-ai-accent hover:underline font-medium"
                  >
                    Terms and Conditions
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-ai-accent/10 hover:bg-ai-accent/20 border border-ai-accent/30 hover:border-ai-accent/50 text-ai-accent font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-ai-accent border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-ai-muted text-sm">
              Already have an account?{' '}
              {onSwitchToLogin ? (
                <button
                  onClick={onSwitchToLogin}
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

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-ai-muted hover:text-white text-sm transition-colors"
            >
              ← Continue as Guest
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

