// backend/controllers/pageViewController.js
// Public, anonymous website traffic tracking - no auth, no PII, no raw IP
// storage. Powers the admin "Website Traffic" analytics page.
import geoip from 'geoip-lite';
import { UAParser } from 'ua-parser-js';
import PageView from '../models/PageView.js';

// Reads the real client IP even behind nginx (X-Forwarded-For is trusted,
// server.js sets `app.set('trust proxy', ...)`, same pattern already used
// elsewhere in this app for rate limiting).
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || req.ip;
};

// POST /api/track/pageview - fired once per page/route the visitor opens
export const recordPageView = async (req, res) => {
  try {
    const { path, sessionId, referrer } = req.body || {};
    if (!path || !sessionId) {
      return res.status(400).json({ success: false, message: 'path and sessionId are required.' });
    }

    const ip = getClientIp(req);
    const geo = ip ? geoip.lookup(ip) : null;

    const ua = new UAParser(req.headers['user-agent'] || '').getResult();
    const device = ua.device.type === 'mobile' ? 'mobile'
      : ua.device.type === 'tablet' ? 'tablet'
      : 'desktop';

    const view = await PageView.create({
      path:         String(path).slice(0, 300),
      sessionId:    String(sessionId).slice(0, 100),
      country:      geo?.country || 'Unknown',
      countryName:  geo?.country ? (COUNTRY_NAMES[geo.country] || geo.country) : 'Unknown',
      device,
      browser:      ua.browser.name || 'Unknown',
      os:           ua.os.name || 'Unknown',
      referrer:     (referrer || '').slice(0, 300),
    });

    res.json({ success: true, id: view._id });
  } catch (error) {
    // Never let a tracking failure show up to a real visitor
    res.status(200).json({ success: false });
  }
};

// POST /api/track/pageview/duration - fired via navigator.sendBeacon when the
// visitor leaves the page, so we know roughly how long they stayed.
export const recordPageDuration = async (req, res) => {
  try {
    const { id, durationSeconds } = req.body || {};
    if (!id || typeof durationSeconds !== 'number') return res.status(200).json({ success: false });

    // Sanity cap - a stale tab left open for hours shouldn't skew "avg time on page"
    const capped = Math.max(0, Math.min(durationSeconds, 30 * 60));
    await PageView.updateOne({ _id: id }, { $set: { durationSeconds: capped } });
    res.json({ success: true });
  } catch (error) {
    res.status(200).json({ success: false });
  }
};

// Minimal ISO-code → name map for the handful of countries that matter for
// display; unmapped codes just show the raw ISO code, which is still useful.
const COUNTRY_NAMES = {
  US: 'United States', CA: 'Canada', GB: 'United Kingdom', AU: 'Australia',
  DE: 'Germany', FR: 'France', IN: 'India', PK: 'Pakistan', PH: 'Philippines',
  NG: 'Nigeria', BR: 'Brazil', MX: 'Mexico', ES: 'Spain', IT: 'Italy',
  NL: 'Netherlands', SG: 'Singapore', AE: 'United Arab Emirates', ZA: 'South Africa',
  JP: 'Japan', KR: 'South Korea', CN: 'China', RU: 'Russia', UA: 'Ukraine',
  PL: 'Poland', SE: 'Sweden', IE: 'Ireland', NZ: 'New Zealand', IL: 'Israel',
  EG: 'Egypt', BD: 'Bangladesh', ID: 'Indonesia', VN: 'Vietnam', TR: 'Turkey',
};
