// Lets code outside the React tree (axios interceptors) trigger client-side
// navigation instead of a full page reload. Wired up once from inside
// <BrowserRouter> - see the useEffect in App.jsx.
let navigator = null;

export function setNavigator(fn) {
  navigator = fn;
}

export function redirectTo(path) {
  if (navigator) {
    navigator(path, { replace: true });
  } else {
    // Router hasn't mounted yet (e.g. error during initial load) - fall back
    window.location.href = path;
  }
}
