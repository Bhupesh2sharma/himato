import { useEffect, useRef, useState } from 'react';
import { GOOGLE_CLIENT_ID } from '../../utils/authMethods';

// Minimal typings for Google Identity Services (https://accounts.google.com/gsi/client)
type GsiCredentialResponse = { credential: string };
type Gsi = {
    accounts: {
        id: {
            initialize: (config: { client_id: string; callback: (r: GsiCredentialResponse) => void; ux_mode?: 'popup' }) => void;
            renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
        };
    };
};
declare global {
    interface Window { google?: Gsi }
}

let gsiScript: Promise<Gsi> | null = null;
const loadGsi = (): Promise<Gsi> => {
    if (window.google?.accounts?.id) return Promise.resolve(window.google);
    if (!gsiScript) {
        gsiScript = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.onload = () => (window.google ? resolve(window.google) : reject(new Error('Google sign-in failed to load')));
            script.onerror = () => {
                gsiScript = null;
                reject(new Error('Google sign-in failed to load'));
            };
            document.head.appendChild(script);
        });
    }
    return gsiScript;
};

interface GoogleSignInButtonProps {
    onCredential: (credential: string) => void;
    disabled?: boolean;
}

/** Google's official "Continue with Google" button (renders nothing if not configured). */
export function GoogleSignInButton({ onCredential, disabled }: GoogleSignInButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const callbackRef = useRef(onCredential);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        callbackRef.current = onCredential;
    }, [onCredential]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;
        let cancelled = false;
        loadGsi()
            .then((google) => {
                const el = containerRef.current;
                if (cancelled || !el) return;
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => callbackRef.current(response.credential),
                    ux_mode: 'popup',
                });
                google.accounts.id.renderButton(el, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    shape: 'pill',
                    text: 'continue_with',
                    logo_alignment: 'center',
                    width: Math.min(400, Math.max(200, el.offsetWidth)),
                });
            })
            .catch(() => !cancelled && setFailed(true));
        return () => {
            cancelled = true;
        };
    }, []);

    if (!GOOGLE_CLIENT_ID) {
        return import.meta.env.DEV ? (
            <p className="text-xs text-center text-ai-muted rounded-xl border border-dashed border-black/15 py-3">
                Google sign-in: set <code>VITE_GOOGLE_CLIENT_ID</code> to enable
            </p>
        ) : null;
    }
    if (failed) {
        return <p className="text-xs text-center text-red-600">Couldn't load Google sign-in. Check your connection and refresh.</p>;
    }
    return (
        <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
            <div ref={containerRef} className="w-full flex justify-center min-h-[44px]" />
        </div>
    );
}
