// Public footer content — social links, description, tagline.
// Managed from Admin → Settings → "Footer & Social Links"; the site footer
// fetches this on load so changes apply without a rebuild.
import express from 'express';
import AdminSetting from '../models/admin/AdminSetting.js';

const router = express.Router();

const FOOTER_KEYS = [
  'footerDescription',
  'footerTagline',
  'footerYoutube',
  'footerInstagram',
  'footerLinkedin',
  'footerTwitter',
  'footerFacebook',
  'footerTiktok',
  // visibility controls — 'false' hides without losing the saved URL
  'footerSocialsEnabled',
  'footerYoutubeEnabled',
  'footerInstagramEnabled',
  'footerLinkedinEnabled',
  'footerTwitterEnabled',
  'footerFacebookEnabled',
  'footerTiktokEnabled',
];

// GET /api/footer  (public, no auth)
router.get('/', async (req, res) => {
  try {
    const rows = await AdminSetting.find({ group: 'general', key: { $in: FOOTER_KEYS } });
    const data = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
