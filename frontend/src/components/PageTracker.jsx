// frontend/src/components/PageTracker.jsx
// Anonymous, cookie-free website traffic tracking. Fires once per route
// change; reports time-on-page via sendBeacon when the visitor navigates
// away or closes the tab. No PII is ever sent — just the path, an anonymous
// client-generated id, and the referrer.
import { useEffect, useRef } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const TRACK_URL = `${BASE_URL}/track/pageview`;
const DURATION_URL = `${BASE_URL}/track/pageview/duration`;

function getVisitorId() {
  let id = localStorage.getItem('sambid_vid');
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('sambid_vid', id);
  }
  return id;
}

export default function PageTracker({ path }) {
  const currentViewId = useRef(null);
  const enteredAt = useRef(null);

  useEffect(() => {
    // Skip the admin panel — this tracks customer/visitor traffic, not internal usage
    if (path.startsWith('/admin')) return;

    const sendDuration = () => {
      if (!currentViewId.current || !enteredAt.current) return;
      const durationSeconds = Math.round((Date.now() - enteredAt.current) / 1000);
      const payload = JSON.stringify({ id: currentViewId.current, durationSeconds });
      navigator.sendBeacon?.(DURATION_URL, new Blob([payload], { type: 'application/json' }));
    };

    // Report the previous page's time-on-page before recording the new one
    sendDuration();

    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        sessionId: getVisitorId(),
        referrer: document.referrer || '',
      }),
    })
      .then(res => res.json())
      .then(json => {
        currentViewId.current = json.id || null;
        enteredAt.current = Date.now();
      })
      .catch(() => {}); // tracking must never disrupt the actual visitor experience

    const handleUnload = () => sendDuration();
    const handleVisibility = () => { if (document.visibilityState === 'hidden') sendDuration(); };
    window.addEventListener('beforeunload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [path]);

  return null;
}
