type EventName =
  | 'itinerary_generated'
  | 'share_link_copied'
  | 'pdf_email_requested'
  | 'signup_started'
  | 'signup_completed'
  | 'lead_magnet_downloaded';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function track(event: EventName, params: Record<string, any> = {}) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', event, {
    ...params,
    source: document.referrer || 'direct',
    path: window.location.pathname,
  });
}