import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Twitter, Linkedin, Facebook, Youtube, Instagram, Music2, ChevronDown, Mail } from 'lucide-react';
import api from '../services/api';

const sections = [
  {
    key: 'platform',
    title: 'Platform',
    links: [
      { label: 'Dashboard',        to: '/dashboard' },
      { label: 'Opportunities',    to: '/opportunities' },
      { label: 'Saved Contracts',  to: '/saved' },
      { label: 'Smart Alerts',     to: '/alerts' },
      { label: 'Bid Pipeline',     to: '/pipeline' },
      { label: 'Deadline Calendar',to: '/calendar' },
    ],
  },
  {
    key: 'ai',
    title: 'AI Tools',
    links: [
      { label: 'AI Predictions',       to: '/ai-predictions' },
      { label: 'Proposal Builder',     to: '/proposal-builder' },
      { label: 'RFP Analyzer',         to: '/rfp-analyzer' },
      { label: 'Go / No-Go',           to: '/go-no-go' },
      { label: 'Capability Statement', to: '/capability-statement' },
      { label: 'Teaming Finder',       to: '/teaming-finder' },
    ],
  },
  {
    key: 'company',
    title: 'Company',
    links: [
      { label: 'About Us',      to: '/about' },
      { label: 'How It Works',  to: '/how-it-works' },
      { label: 'Features',      to: '/features' },
      { label: 'Pricing',       to: '/pricing' },
      { label: 'FAQ',           to: '/faq' },
      { label: 'Contact',       to: '/contact' },
    ],
  },
];

const contactItems = [
  { icon: Mail, text: 'support@sambid.co' },
];

// Default texts — used until (or unless) the admin sets custom ones in
// Admin → Settings → "Footer & Social Links".
const DEFAULT_DESCRIPTION = 'AI-powered federal contract discovery platform. Helping small businesses find, track, and win government opportunities.';
const DEFAULT_TAGLINE = '"Never miss a federal contract again."';

// Order + icon for each admin-managed social link. An icon shows only when
// its URL is set AND its toggle (and the master toggle) is on in the admin panel.
const SOCIAL_DEFS = [
  { key: 'footerYoutube',   enKey: 'footerYoutubeEnabled',   icon: Youtube,   label: 'YouTube'   },
  { key: 'footerInstagram', enKey: 'footerInstagramEnabled', icon: Instagram, label: 'Instagram' },
  { key: 'footerLinkedin',  enKey: 'footerLinkedinEnabled',  icon: Linkedin,  label: 'LinkedIn'  },
  { key: 'footerTwitter',   enKey: 'footerTwitterEnabled',   icon: Twitter,   label: 'X / Twitter' },
  { key: 'footerFacebook',  enKey: 'footerFacebookEnabled',  icon: Facebook,  label: 'Facebook'  },
  { key: 'footerTiktok',    enKey: 'footerTiktokEnabled',    icon: Music2,    label: 'TikTok'    },
];

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const [footerData, setFooterData] = useState({});
  const toggle = key => setOpenSection(prev => prev === key ? null : key);

  // Load admin-managed footer content (social links, description, tagline)
  useEffect(() => {
    api.get('/footer')
      .then(r => { if (r.data?.success) setFooterData(r.data.data || {}); })
      .catch(() => {}); // fall back to defaults silently
  }, []);

  const socialsHidden = footerData.footerSocialsEnabled === 'false'; // admin master switch
  const socials = socialsHidden ? [] : SOCIAL_DEFS
    .filter(s => footerData[s.key] && String(footerData[s.key]).trim() !== '' && footerData[s.enKey] !== 'false')
    .map(s => ({ icon: s.icon, href: footerData[s.key], label: s.label }));

  const description = footerData.footerDescription?.trim() || DEFAULT_DESCRIPTION;
  const tagline     = footerData.footerTagline?.trim()     || DEFAULT_TAGLINE;

  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-10 sm:mb-12">

          {/* Brand column */}
          <div className="sm:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 sm:mb-5 w-fit">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-base">S</span>
              </div>
              <span className="text-xl font-bold text-white">Sambid</span>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
              {description}
            </p>

            <p className="text-indigo-300 text-sm font-medium italic border-l-2 border-indigo-500 pl-3 mb-5">
              {tagline}
            </p>

            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="w-9 h-9 bg-white/10 hover:bg-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav sections - desktop */}
          {sections.map(sec => (
            <div key={sec.key} className="hidden sm:block">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {sec.title}
              </h4>
              <ul className="space-y-2.5">
                {sec.links.map(lnk => (
                  <li key={lnk.to}>
                    <Link
                      to={lnk.to}
                      className="text-sm text-gray-400 hover:text-indigo-300 transition-colors duration-200"
                    >
                      {lnk.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Mobile accordion nav ── */}
        <div className="sm:hidden space-y-1 mb-8 border-t border-white/10 pt-6">
          {sections.map(sec => (
            <div key={sec.key} className="border-b border-white/10 last:border-b-0">
              <button
                onClick={() => toggle(sec.key)}
                className="flex items-center justify-between w-full py-3.5 text-sm font-medium text-white"
              >
                {sec.title}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openSection === sec.key ? 'rotate-180' : ''}`} />
              </button>
              {openSection === sec.key && (
                <ul className="pb-3 pl-2 space-y-2.5">
                  {sec.links.map(lnk => (
                    <li key={lnk.to}>
                      <Link
                        to={lnk.to}
                        className="text-sm text-gray-400 hover:text-indigo-300 transition-colors"
                      >
                        {lnk.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* ── Contact bar ── */}
        <div className="flex justify-center py-6 sm:py-8 border-t border-b border-white/10 mb-8">
          {contactItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-gray-400">
              <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-xs sm:text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} Sambid. All rights reserved. Data sourced from SAM.gov (official US federal database).
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center sm:justify-end">
            <Link to="/privacy"  className="hover:text-indigo-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms"    className="hover:text-indigo-300 transition-colors">Terms of Service</Link>
            <Link to="/dpa"      className="hover:text-indigo-300 transition-colors">DPA</Link>
            <Link to="/security" className="hover:text-indigo-300 transition-colors">Security</Link>
            <Link to="/status"   className="hover:text-indigo-300 transition-colors">Status</Link>
            <Link to="/nda"      className="hover:text-indigo-300 transition-colors">NDA</Link>
            <Link to="/faq"      className="hover:text-indigo-300 transition-colors">FAQ</Link>
            <Link to="/contact"  className="hover:text-indigo-300 transition-colors">Support</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
