// After sign-up we ask travellers three quick trip questions once
// (components/TripProfileModal.tsx). Skipping is remembered per account on
// this device so we don't nag.
const SKIP_KEY = 'himato_trip_profile_skipped';

const skippedFor = (userId: string) => {
  try {
    return localStorage.getItem(SKIP_KEY) === userId;
  } catch {
    return false;
  }
};

export const markTripProfileSkipped = (userId: string) => {
  try {
    localStorage.setItem(SKIP_KEY, userId);
  } catch {
    /* storage unavailable */
  }
};

/** Whether to ask this signed-in traveller about their trip. Agents are never asked. */
export const shouldAskTripProfile = (
  user: { id: string; business?: boolean; travelProfile?: { travelMonth?: string } } | null,
) => Boolean(user && !user.business && !user.travelProfile?.travelMonth && !skippedFor(user.id));
