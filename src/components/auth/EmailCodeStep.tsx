import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MailCheck, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface EmailCodeStepProps {
    email: string;
    resendIn?: number;
    onVerified: () => void;
    onBack: () => void;
}

/** Sign-up step 2: enter the 6-digit code we emailed; confirms the address and signs in. */
export function EmailCodeStep({ email, resendIn: initialResendIn = 30, onVerified, onBack }: EmailCodeStepProps) {
    const { verifyRegistration } = useAuth();
    const [code, setCode] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [resendIn, setResendIn] = useState(initialResendIn);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const verify = async (e: FormEvent) => {
        e.preventDefault();
        if (code.length !== 6 || busy) return;
        setBusy(true);
        setError('');
        setNotice('');
        try {
            await verifyRegistration(email, code);
            onVerified();
        } catch (err: any) {
            setError(err.message || 'Could not verify the code. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const resend = async () => {
        setError('');
        setNotice('');
        try {
            const res = await apiClient.resendRegistrationCode(email);
            setResendIn(res.data.resendIn || 30);
            setCode('');
            setNotice('We sent a new code.');
        } catch (err: any) {
            setError(err.message || 'Could not send a new code.');
        }
    };

    return (
        <form onSubmit={verify}>
            <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-ai-accent/10 text-ai-accent flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-ai-text mb-2">Check your email</h1>
                <p className="text-ai-muted text-sm">
                    We sent a 6-digit code to <span className="font-medium text-ai-text break-all">{email}</span>.
                    Enter it to finish creating your account.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
                </div>
            )}
            {notice && !error && <p className="mb-4 text-center text-sm text-ai-accent">{notice}</p>}

            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                aria-label="6-digit code"
                className="w-full px-4 py-3 bg-ai-card/50 border border-black/10 rounded-xl text-ai-text text-center text-xl font-semibold tracking-[0.5em] placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 disabled:opacity-60"
                disabled={busy}
            />

            <button
                type="submit"
                disabled={code.length !== 6 || busy}
                className="mt-3 w-full py-3 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {busy ? 'Verifying…' : 'Verify & create account'}
            </button>

            <div className="mt-4 flex items-center justify-between text-xs text-ai-muted">
                <button type="button" onClick={onBack} className="hover:text-ai-text">← Change details</button>
                {resendIn > 0 ? (
                    <span>Resend code in {resendIn}s</span>
                ) : (
                    <button type="button" onClick={resend} className="text-ai-accent font-medium hover:underline">Resend code</button>
                )}
            </div>
            <p className="mt-3 text-center text-[11px] text-ai-muted">Can't find it? Check your spam or promotions folder.</p>
        </form>
    );
}
