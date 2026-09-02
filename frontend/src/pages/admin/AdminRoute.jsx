// Guard: redirects to /admin/login (or /support/login for support members) if no valid adminToken.
// Remember-me handling: sessions saved with "Remember me" survive browser
// restarts (30-day token). Sessions WITHOUT it carry a sessionStorage marker
// that vanishes when the browser closes - reopening then requires a fresh login.
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken');
  const role  = localStorage.getItem('adminRole');

  if (token && localStorage.getItem('adminRemember') === 'false' && !sessionStorage.getItem('adminSessionLive')) {
    // Browser was closed on a non-remembered session - end it.
    ['adminToken', 'adminName', 'adminEmail', 'adminRole', 'adminPermissions', 'adminRemember']
      .forEach(k => localStorage.removeItem(k));
    const loginPath = role === 'support' ? '/support/login' : '/admin/login';
    return <Navigate to={loginPath} replace />;
  }

  if (!token) {
    const loginPath = role === 'support' ? '/support/login' : '/admin/login';
    return <Navigate to={loginPath} replace />;
  }

  // keep the marker alive for this browser session (covers page refreshes)
  sessionStorage.setItem('adminSessionLive', '1');
  return children;
}
