// Which sign-in methods this build offers.
//   Google  — needs VITE_GOOGLE_CLIENT_ID (the Himato Google OAuth client)
//   Email   — email + password, address confirmed by a code at sign-up.
//             On unless VITE_ENABLE_EMAIL_AUTH=false
//   Phone   — OTP via Fast2SMS. Off until the DLT template is approved;
//             set VITE_ENABLE_PHONE_AUTH=true (and ENABLE_PHONE_AUTH on the backend)
export const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const EMAIL_AUTH_ENABLED: boolean = import.meta.env.VITE_ENABLE_EMAIL_AUTH !== 'false';

export const PHONE_AUTH_ENABLED: boolean = import.meta.env.VITE_ENABLE_PHONE_AUTH === 'true';
