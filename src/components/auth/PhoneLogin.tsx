import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Phone, ArrowRight, Loader2, User, Building2 } from 'lucide-react';
import { apiClient } from '../../services/api';
import type { SignupExtras } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface PhoneLoginProps {
    onSuccess: () => void;
    onError: (message: string) => void;
    /** Agent app: new accounts are agencies and must give an agency name. */
    asBusiness?: boolean;
}

const inputCls = 'w-full py-3 bg-ai-card/50 border border-black/10 rounded-xl text-ai-text placeholder-ai-muted focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all disabled:opacity-60';

/** Two-step phone sign-in: number → OTP (+ name for first-time users). */
export function PhoneLogin({ onSuccess, onError, asBusiness = false }: PhoneLoginProps) {
    const { verifyPhoneOtp } = useAuth();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [busy, setBusy] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const otpRef = useRef<HTMLInputElement>(null);

    // Resend countdown
    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    const validPhone = /^[6-9]\d{9}$/.test(phone);

    const requestOtp = async () => {
        if (!validPhone || busy) return;
        setBusy(true);
        onError('');
        try {
            const res = await apiClient.sendOtp(phone);
            setIsNewUser(res.data.isNewUser);
            setResendIn(res.data.resendIn || 30);
            setStep('otp');
            setOtp('');
            requestAnimationFrame(() => otpRef.current?.focus());
        } catch (err: any) {
            onError(err.message || 'Could not send the OTP. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    const verify = async (e: FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6 || busy) return;
        if (isNewUser && !name.trim()) return onError('Please enter your name');
        if (isNewUser && asBusiness && !businessName.trim()) return onError('Please enter your agency name');
        setBusy(true);
        onError('');
        try {
            const extras: SignupExtras = asBusiness ? { asBusiness: true, businessName: businessName.trim() } : {};
            await verifyPhoneOtp({ phone, otp, ...(isNewUser && { name: name.trim() }), ...extras });
            onSuccess();
        } catch (err: any) {
            onError(err.message || 'Could not verify the OTP. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    if (step === 'phone') {
        return (
            <form onSubmit={(e) => { e.preventDefault(); requestOtp(); }} className="space-y-3">
                <label htmlFor="phone" className="block text-sm font-medium text-ai-muted">Mobile number</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-ai-muted text-sm">
                        <Phone className="w-4 h-4" />+91
                    </span>
                    <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(-10))}
                        placeholder="98765 43210"
                        className={`${inputCls} pl-[4.5rem] pr-4 tracking-wide`}
                        disabled={busy}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!validPhone || busy}
                    className="w-full py-3 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    {busy ? 'Sending OTP…' : 'Send OTP'}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={verify} className="space-y-3">
            <div className="flex items-center justify-between text-sm">
                <span className="text-ai-muted">
                    Code sent to <span className="font-medium text-ai-text">+91 {phone.slice(0, 5)} {phone.slice(5)}</span>
                </span>
                <button type="button" onClick={() => { setStep('phone'); onError(''); }} className="text-ai-accent font-medium hover:underline">
                    Change
                </button>
            </div>

            <input
                ref={otpRef}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                aria-label="6-digit OTP"
                className={`${inputCls} px-4 text-center text-xl font-semibold tracking-[0.5em]`}
                disabled={busy}
            />

            {isNewUser && (
                <>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ai-muted" />
                        <input
                            type="text"
                            autoComplete="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className={`${inputCls} pl-10 pr-4`}
                            disabled={busy}
                        />
                    </div>
                    {asBusiness && (
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ai-muted" />
                            <input
                                type="text"
                                autoComplete="organization"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                placeholder="Your agency name"
                                className={`${inputCls} pl-10 pr-4`}
                                disabled={busy}
                            />
                        </div>
                    )}
                </>
            )}

            <button
                type="submit"
                disabled={otp.length !== 6 || busy}
                className="w-full py-3 rounded-xl bg-ai-accent hover:bg-ai-secondary text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                {busy ? 'Verifying…' : isNewUser ? 'Verify & create account' : 'Verify & continue'}
            </button>

            <p className="text-center text-xs text-ai-muted">
                {resendIn > 0 ? (
                    <>Resend code in {resendIn}s</>
                ) : (
                    <button type="button" onClick={requestOtp} disabled={busy} className="text-ai-accent font-medium hover:underline">
                        Resend code
                    </button>
                )}
            </p>
        </form>
    );
}
