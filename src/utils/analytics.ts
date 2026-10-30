type EventName =
  | 'itinerary_generated'
  | 'share_link_copied'
  | 'pdf_email_requested'
  | 'pdf_downloaded'
  | 'auth_started'
  | 'signup_started'
  | 'signup_completed'
  | 'login_completed'
  | 'lead_sent_to_agent'
  | 'guide_plan_clicked'
  | 'preview_unlock_clicked'
  | 'trip_profile_completed'
  | 'trip_profile_skipped'
  | 'lead_magnet_downloaded';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Attribution: which page brought this visitor in. `landing_page` is the
// first page of this visit; `first_landing_page` is the first page we ever
// saw them on (survives return visits), so a sign-up next week can still be
// credited to the guide that found them. Storage can be unavailable (private
// mode, blocked site data) — attribution then falls back to the current page.
const SESSION_KEY = 'himato_landing';
const FIRST_KEY = 'himato_first_landing';

type Landing = { page: string; referrer: string };

const readLanding = (store: Storage, key: string): Landing | null => {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as Landing) : null;
  } catch {
    return null;
  }
};

const rememberLanding = (store: Storage, key: string, value: Landing) => {
  try {
    if (!store.getItem(key)) store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

if (typeof window !== 'undefined') {
  const here: Landing = {
    page: window.location.pathname + window.location.search,
    referrer: document.referrer || 'direct',
  };
  try {
    rememberLanding(window.sessionStorage, SESSION_KEY, here);
    rememberLanding(window.localStorage, FIRST_KEY, here);
  } catch {
    /* storage unavailable */
  }
}

const attribution = () => {
  let session: Landing | null = null;
  let first: Landing | null = null;
  try {
    session = readLanding(window.sessionStorage, SESSION_KEY);
    first = readLanding(window.localStorage, FIRST_KEY);
  } catch {
    /* storage unavailable */
  }
  return {
    landing_page: session?.page ?? window.location.pathname,
    landing_referrer: session?.referrer ?? (document.referrer || 'direct'),
    first_landing_page: first?.page ?? session?.page ?? window.location.pathname,
  };
};

export function track(event: EventName, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', event, {
    ...params,
    ...attribution(),
    source: document.referrer || 'direct',
    path: window.location.pathname,
  });
}
