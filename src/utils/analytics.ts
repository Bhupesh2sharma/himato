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
const VISITOR_KEY = 'himato_visitor_id';
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

/**
 * Anonymous, random per-browser id (no personal data). Lets admins connect a
 * guest's activity to the account they create later. Falls back to a
 * per-page-load id when storage is unavailable.
 */
let memoryVisitorId = '';
export const visitorId = (): string => {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    if (!memoryVisitorId) memoryVisitorId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return memoryVisitorId;
  }
};

/** Attribution in the shape the backend stores (LeadRequest / GenerationLog). */
export const requestContext = () => {
  const a = attribution();
  return {
    visitorId: visitorId(),
    attribution: { landingPage: a.landing_page, firstLandingPage: a.first_landing_page, referrer: a.landing_referrer },
  };
};

export const attribution = () => {
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

// ── First-party events (admin → Analytics). Batched and sent with
// sendBeacon as text/plain so there's no CORS preflight and nothing is lost
// when the tab closes. Never throws: analytics must not break the site.
const EVENTS_URL = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/events`;
const SESSION_ID_KEY = 'himato_session_id';
type QueuedEvent = { name: string; path: string; props?: Record<string, unknown>; ts: number };
const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const sessionId = (): string => {
  try {
    let id = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      window.sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return visitorId();
  }
};

// Only small primitive values are kept (the backend enforces the same).
const primitiveProps = (params: Record<string, unknown>) => {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
};

const flush = () => {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = null;
  if (!queue.length || !EVENTS_URL.startsWith('http')) return;
  const events = queue.splice(0, 25);
  try {
    const a = attribution();
    let token: string | null = null;
    try { token = window.localStorage.getItem('authToken'); } catch { /* storage unavailable */ }
    const body = JSON.stringify({
      visitorId: visitorId(),
      sessionId: sessionId(),
      landingPage: a.landing_page,
      referrer: a.landing_referrer,
      ...(token && { token }),
      events,
    });
    const blob = new Blob([body], { type: 'text/plain' });
    if (!navigator.sendBeacon?.(EVENTS_URL, blob)) {
      fetch(EVENTS_URL, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
    }
  } catch {
    /* never surface analytics errors */
  }
  if (queue.length) flushTimer = setTimeout(flush, 0);
};

const enqueue = (name: string, props?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  queue.push({ name, path: window.location.pathname, props: props && primitiveProps(props), ts: Date.now() });
  if (queue.length >= 10) flush();
  else if (!flushTimer) flushTimer = setTimeout(flush, 4000);
};

if (typeof window !== 'undefined') {
  // Send whatever is queued when the visitor leaves or backgrounds the tab
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

/** Record a page view (called on every route change). First-party only; GA4 tracks its own. */
export function trackPageView() {
  enqueue('page_view');
}

export function track(event: EventName, params: Record<string, any> = {}) {
  enqueue(event, params);
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', event, {
    ...params,
    ...attribution(),
    source: document.referrer || 'direct',
    path: window.location.pathname,
  });
}
