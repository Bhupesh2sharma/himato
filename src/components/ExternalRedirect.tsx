import { useEffect } from 'react';

/** Full-page redirect to another app (e.g. the agent workspace). */
export function ExternalRedirect({ to }: { to: string }) {
    useEffect(() => {
        window.location.replace(to);
    }, [to]);
    return null;
}
