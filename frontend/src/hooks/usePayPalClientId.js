// Runtime PayPal client ID - fetched from the backend (/payment/gateways),
// which reads the credentials saved in Admin → Settings. This is what makes
// switching Sandbox → Live in the admin panel take effect immediately:
// the old approach baked VITE_PAYPAL_CLIENT_ID into the bundle at build time,
// so the frontend kept using the stale (sandbox) ID no matter what the admin
// panel said. The env var remains only as a fallback if the fetch fails.
import { useEffect, useState } from 'react';
import { paymentAPI } from '../services/api';

const FALLBACK_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

// one fetch per page load, shared by every component that needs the ID
let cachedPromise = null;
const fetchClientId = () => {
  if (!cachedPromise) {
    cachedPromise = paymentAPI
      .getGateways()
      .then((r) => r.data?.data?.paypalClientId || FALLBACK_ID)
      .catch(() => FALLBACK_ID);
  }
  return cachedPromise;
};

export default function usePayPalClientId() {
  const [clientId, setClientId] = useState(null); // null = still loading
  useEffect(() => {
    let alive = true;
    fetchClientId().then((id) => { if (alive) setClientId(id); });
    return () => { alive = false; };
  }, []);
  return { clientId, loading: clientId === null };
}
