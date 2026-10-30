import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Login } from './Login';
import { Register } from './Register';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    message?: string;
}

// Mounted only while the popup is open, so it always starts on sign-in.
function AuthForms({ message, onSuccess }: { message?: string; onSuccess: () => void }) {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');

    return (
        <>
            {mode === 'login' ? (
                <Login
                    key={email}
                    embedded
                    initialEmail={email}
                    subtitle={message}
                    onSuccess={onSuccess}
                    onSwitchToRegister={() => setMode('register')}
                />
            ) : (
                <Register
                    embedded
                    onSuccess={onSuccess}
                    onSwitchToLogin={(registeredEmail) => {
                        setEmail(registeredEmail || '');
                        setMode('login');
                    }}
                />
            )}
        </>
    );
}

/**
 * Login / sign-up popup. Opens on the sign-in view; sign-up switches back to
 * sign-in (email pre-filled) since registration doesn't auto-login.
 */
export const AuthModal = ({ isOpen, onClose, onSuccess, message }: AuthModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="relative min-h-full flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-ai-card border border-black/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <button
                                onClick={onClose}
                                aria-label="Close"
                                className="absolute top-3 right-3 z-10 p-2 rounded-full text-ai-muted hover:text-ai-text hover:bg-black/5 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <AuthForms message={message} onSuccess={onSuccess} />
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
