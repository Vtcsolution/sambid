import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import heroCapitolImg from '../assets/images/hero-capitol.jpg';

const API = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

// Cloudinary uploads return a full URL already; anything uploaded before the
// Cloudinary migration still has an old relative "/uploads/..." path.
const resolveMediaUrl = (url) => url?.startsWith('http') ? url : `${API}${url}`;

import {
  ArrowRight, Search, Brain, TrendingUp, Shield, Clock,
  CheckCircle, Star, Users, Award, Target, FileText,
  Calendar, Trophy, Bookmark, Bell, Sparkles, ThumbsUp,
  ScanSearch, Kanban, Building2, FileEdit
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import GlowImageCard from '../components/GlowImageCard';

const HOME_JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sambid',
    url: 'https://sambid.co',
    logo: 'https://sambid.co/logo.png',
    description: 'Sambid delivers real-time federal contract opportunity alerts from SAM.gov, USASpending.gov, and FPDS directly to small and mid-size contractors.',
    sameAs: [
      'https://twitter.com/sambidco',
      'https://linkedin.com/company/sambid',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@sambid.co',
      url: 'https://sambid.co/contact',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Sambid',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://sambid.co',
    description: 'AI-powered federal contract opportunity discovery and alert platform for US government contractors.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '0',
      highPrice: '499',
      offerCount: '4',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sambid',
    url: 'https://sambid.co',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sambid.co/opportunities?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
];

const ANIM_CSS = `
@keyframes _fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-fade { animation: _fadeUp 0.75s ease-out both; }
.reveal {
  opacity: 0;
  transform: translateY(22px);
  transition: opacity 0.55s ease-out, transform 0.55s ease-out;
}
.reveal.in { opacity: 1; transform: translateY(0); }
`;

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.12 });
  return (
    <div
      ref={ref}
      className={`reveal${inView ? ' in' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

function usePageMedia(page) {
  const [media, setMedia] = useState({});
  useEffect(() => {
    fetch(`${API}/api/media/page/${page}`)
      .then(r => r.json())
      .then(d => { if (d.success) setMedia(d.media || {}); })
      .catch(() => {});
  }, [page]);
  return media;
}

const PHASES = [
  {
    phase: '01',
    icon: Search,
    label: 'Find Every Opportunity',
    headline: 'Find Every Government Opportunity',
    description:
      'Sambid scans SAM.gov, USASpending.gov, and FPDS around the clock, delivering matched federal contract opportunities directly to your dashboard, filtered by your NAICS codes, set-asides, and agency preferences.',
    points: [
      'Live SAM.gov data updated daily',
      'NAICS code + set-aside filtering (8a, WOSB, HUBZone…)',
      'Agency, value range & keyword filters',
      'Real-time AI match scoring',
    ],
    video: '',
    videoTitle: 'Watch: Opportunity discovery dashboard',
  },
  {
    phase: '02',
    icon: Calendar,
    label: 'Never Miss a Deadline',
    headline: 'Every Deadline in One Calendar',
    description:
      'Never miss a submission deadline again. One visual calendar shows every deadline from every contract you are tracking, color-coded by urgency so you always know exactly how much time you have.',
    points: [
      'Visual calendar with all tracked bids',
      'Color-coded by urgency',
      'One-click sync to Google, Outlook, or Apple Calendar',
    ],
    video: '',
    videoTitle: 'Watch: Deadline calendar walkthrough',
  },
  {
    phase: '03',
    icon: TrendingUp,
    label: 'Market Research',
    headline: 'Know the Market Rate Before You Bid',
    description:
      'Research who won similar contracts with real data from USASpending.gov, so you know exactly what the going rate is before you write your bid, not after you lose it.',
    points: [
      '3-5 years of real awarded contracts by NAICS',
      'Real company names and dollar amounts',
      'Benchmark pricing before you bid',
    ],
    video: '',
    videoTitle: 'Watch: Past award analysis',
  },
  {
    phase: '04',
    icon: Bookmark,
    label: 'Track Your Pipeline',
    headline: 'Bookmark and Track Every Bid',
    description:
      'Save any contract with one click and move it through your real bidding workflow, from Saved to Researching to Submitted, with everything feeding straight into your AI tools.',
    points: [
      'Save from any page in one click',
      'Move through real bidding stages',
      'Feeds directly into Go/No-Go and Proposal Builder',
    ],
    video: '',
    videoTitle: 'Watch: Saved opportunities',
  },
  {
    phase: '05',
    icon: Bell,
    label: 'Smart Alerts',
    headline: 'Get Notified the Moment a Match Posts',
    description:
      'Real-time, daily, or weekly, get notified automatically the moment a new contract matches your industry codes, without lifting a finger.',
    points: [
      'Hourly matching against SAM.gov',
      'Every match scored 0-100%',
      'Pick your own alert frequency',
    ],
    video: '',
    videoTitle: 'Watch: Smart alerts in action',
  },
  {
    phase: '06',
    icon: Sparkles,
    label: 'AI Summarize',
    headline: 'Full Contract Intelligence in Seconds',
    description:
      'Powered by Claude AI with real SAM.gov data. Click one button and the AI reads the entire posting for you, every page of it, not just the short summary.',
    points: [
      'AI reads the complete posting, not just the title',
      'Executive summary, requirements, and red flags',
      'Honest fit assessment against your real profile',
    ],
    video: '',
    videoTitle: 'Watch: AI Summarize demo',
  },
  {
    phase: '07',
    icon: Target,
    label: 'AI Bid Analysis',
    headline: 'Should You Bid, or Walk Away?',
    description:
      'Get a data-driven BID/NO-BID recommendation with real competitor intelligence pulled straight from USASpending.gov, real companies, real dollar amounts, no guessing.',
    points: [
      '25 real recent competitor awards in your industry',
      'Eight-factor scoring matrix',
      'Real win percentage + suggested price range',
    ],
    video: '',
    videoTitle: 'Watch: AI bid analysis',
  },
  {
    phase: '08',
    icon: FileEdit,
    label: 'AI Proposal Writer',
    headline: 'A Complete Proposal in Minutes, Not Weeks',
    description:
      "Generate a complete 7-section government proposal using your real company data, not a generic template, then export a polished, branded PDF ready to submit.",
    points: [
      'All 7 required sections written for you',
      'Uses your real past performance',
      'Export a professional branded PDF',
    ],
    video: '',
    videoTitle: 'Watch: AI proposal writing demo',
  },
  {
    phase: '09',
    icon: ThumbsUp,
    label: 'Go/No-Go Decision',
    headline: 'A Real Bid Recommendation, Backed by Evidence',
    description:
      'A 10-factor scoring matrix that checks 5 real data sources at once, your SOW, SAM.gov, USASpending, your profile, and your past wins, and gives you a clear Go or No-Go call plus exactly what to do next.',
    points: [
      'Checks 5 real data sources at once',
      'Ten factors scored with real evidence',
      'Clear recommendation + action plan',
    ],
    video: '',
    videoTitle: 'Watch: Go/No-Go decision workflow',
  },
  {
    phase: '10',
    icon: Users,
    label: 'Teaming Partner Finder',
    headline: 'Find the Right Partners to Win Bigger Contracts',
    description:
      'Search for real businesses with the industry codes and certifications that complement yours, the pieces you are missing to go after bigger contracts, and reach out in one click.',
    points: [
      'Search by NAICS & certifications',
      'Real partner profiles, not a static directory',
      'Connect directly inside the platform',
    ],
    video: '',
    videoTitle: 'Watch: Teaming finder in action',
  },
  {
    phase: '11',
    icon: Search,
    label: 'Sources Sought Generator',
    headline: "Get on the Agency's Radar Before the RFP Drops",
    description:
      'Respond to Sources Sought notices with a complete, AI-written 8-section response, a 60-90 day head start on competitors who wait for the full RFP.',
    points: [
      'Auto-fills from saved notices',
      'AI writes all 8 sections for you',
      'Shape the requirements before they exist',
    ],
    video: '',
    videoTitle: 'Watch: Sources Sought generator',
  },
  {
    phase: '12',
    icon: Building2,
    label: 'Contract Vehicle Tracker',
    headline: 'Never Miss an On-Ramp Window Again',
    description:
      'Track your GWACs, IDIQs, and GSA Schedules with real eligibility checks against your certifications, plus a color-coded countdown to every expiration.',
    points: [
      'Quick-add common vehicles in one click',
      'Real eligibility check against your profile',
      'Color-coded expiry countdown',
    ],
    video: '',
    videoTitle: 'Watch: Contract vehicle tracker',
  },
  {
    phase: '13',
    icon: ScanSearch,
    label: 'RFP Analyzer',
    headline: 'A 400-Page RFP, Turned Into a Checklist',
    description:
      'Upload an RFP and the AI extracts every requirement, evaluation factor, and compliance item in minutes, not days, so nothing gets missed.',
    points: [
      'Select, paste, or upload a PDF',
      'AI parses the entire document',
      'Clear compliance checklist + Go/No-Go',
    ],
    video: '',
    videoTitle: 'Watch: RFP analyzer demo',
  },
  {
    phase: '14',
    icon: Shield,
    label: 'AI Risk Assessment',
    headline: 'Know Every Risk Before You Commit',
    description:
      'A 7-category risk matrix with real evidence behind every single rating, from technical difficulty to whether the timeline is actually realistic for your team.',
    points: [
      'Reads the complete scope of work',
      'Seven risk categories, rated Low/Medium/High',
      'Every rating backed by real evidence',
    ],
    video: '',
    videoTitle: 'Watch: AI risk assessment',
  },
  {
    phase: '15',
    icon: Award,
    label: 'Capability Statement',
    headline: 'A Professional One-Pager in Seconds',
    description:
      'AI-generated from your real certifications, NAICS codes, and past performance, ready to hand to any contracting officer or bring to an industry day.',
    points: [
      'Built from your real company data',
      'Professional, contracting-officer-ready format',
      'Export and share instantly',
    ],
    video: '',
    videoTitle: 'Watch: Capability statement generator',
  },
  {
    phase: '16',
    icon: Kanban,
    label: 'Bid Pipeline',
    headline: 'Every Bid, Tracked in One Kanban Board',
    description:
      'See your entire pipeline at a glance, and your real conversion rate, how many bids you have submitted versus how many you have actually won.',
    points: [
      'Visual Kanban board',
      'Drag through real bidding stages',
      'Track your real win rate',
    ],
    video: '',
    videoTitle: 'Watch: Bid pipeline board',
  },
  {
    phase: '17',
    icon: Trophy,
    label: 'Past Performance Repository',
    headline: 'Your Past Wins, Ready for Every New Proposal',
    description:
      'Store your federal contracts once, auto-formatted as SF-330 citations, so every AI tool on the platform pulls from your real history automatically.',
    points: [
      'Add each contract once',
      'One-click SF-330 formatting',
      'Every AI feature uses it automatically',
    ],
    video: '',
    videoTitle: 'Watch: Past performance repository',
  },
  {
    phase: '18',
    icon: TrendingUp,
    label: 'Competitive Analysis',
    headline: 'Know Exactly Who You Are Up Against',
    description:
      'Real companies, real contract values, real win history, pulled straight from public government spending records, so you walk into every bid with real intelligence.',
    points: [
      'Real competitor names + dollar volume',
      'Full competitor profiles',
      'Strengths, gaps, and teaming recommendations',
    ],
    video: '',
    videoTitle: 'Watch: Competitive analysis',
  },
  {
    phase: '19',
    icon: Building2,
    label: 'Company Workspace',
    headline: 'One Shared Source of Truth for Your Whole Team',
    description:
      'UEI verified live against SAM.gov, certifications tracked with expiry alerts, your team and every document all in one place, so every AI feature reads from the same accurate profile.',
    points: [
      'Live UEI verification against SAM.gov',
      'Real team roles + permissions',
      'One shared document library',
    ],
    video: '',
    videoTitle: 'Watch: Company workspace',
  },
  {
    phase: '20',
    icon: Star,
    label: 'Managed Service',
    headline: "Let Sambid's Team Bid for You",
    description:
      'Our own team finds, writes, and submits your bids for you. No win, no fee, commission billed only as the government actually pays each milestone.',
    points: [
      'Apply and get reviewed within 24-48 hours',
      'We find and write real bids for you',
      'Commission billed per milestone, never a lump sum',
    ],
    video: '',
    videoTitle: 'Watch: Managed service overview',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const ctaTo    = isAuthenticated ? '/dashboard' : '/signup';
  const ctaLabel = isAuthenticated ? 'Go to Dashboard' : 'Unlock Every Feature Free';
  const pageMedia = usePageMedia('home');

  return (
    <div className="overflow-hidden">
      <style>{ANIM_CSS}</style>
      <SEOHead
        title="AI Contract Tool for SAM.gov | Federal Contract Alerts"
        description="Sambid is an AI-powered GovCon platform for SAM.gov: opportunity capture, bid/no-bid scoring, compliance checklists, AI proposal drafting, teaming partner search, and recompete intelligence, all matched to your NAICS codes. Every new account unlocks all Enterprise features free for 7 days, no credit card needed."
        keywords="AI contract tool, SAM.gov AI tool, AI tool for SAM.gov, SAM.gov AI, AI government contract tool, samgov ai contract tool, federal contract opportunities, SAM.gov alerts, government contracting software, federal procurement notifications, FPDS contract search, small business federal contracts, USASpending opportunities, federal RFP alerts, government contract finder, federal bid alerts, SAM.gov notification tool, AI federal contract matching, GovCon software, federal contracting platform for small business, win government contracts, federal contract bidding software, government RFP alerts, SAM.gov opportunity tracker, federal procurement software, contract opportunity finder, GovCon platform, government contracting platform, AI capture management, bid no-bid decision tool, compliance checklist generator, compliance matrix builder, AI proposal drafting, AI proposal writer, teaming partner finder, past performance intelligence, recompete tracking, incumbent intelligence, federal market intelligence, government contract pipeline software, contract vehicle tracker, GSA schedule tracker, sources sought response generator, capability statement generator, government contract CRM alternative, AI government contracting software, government contract compliance software, GovCon software for small business"
        canonical="https://sambid.co/"
        jsonLd={HOME_JSON_LD}
      />

      {/* ── Hero ── */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Full-bleed background photo with a dark gradient for text contrast */}
        <div className="absolute inset-0">
          <img
            src={heroCapitolImg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/70 to-slate-950/90" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32 md:pb-40 text-center">
          <div className="hero-fade inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6 sm:mb-7 text-xs sm:text-sm font-semibold text-white">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Every new account unlocks all Enterprise features free for 7 days
          </div>
          <h1
            className="hero-fade text-4xl sm:text-6xl md:text-7xl mb-6 sm:mb-8 leading-[1.1] tracking-tight"
            style={{
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              fontWeight: 600,
              textShadow: '0 2px 20px rgba(0,0,0,.6)',
            }}
          >
            Federal Contracts,<br />Found For You
          </h1>

          <p
            className="hero-fade text-base sm:text-xl md:text-2xl text-slate-200 mb-9 sm:mb-10 leading-relaxed max-w-2xl mx-auto"
            style={{ animationDelay: '0.1s', textShadow: '0 1px 12px rgba(0,0,0,.6)' }}
          >
            Automate your entire SAM.gov process,<br className="hidden sm:block" />
            from contract discovery to proposal submission.
          </p>

          <div className="hero-fade" style={{ animationDelay: '0.2s' }}>
            <Link
              to={ctaTo}
              className="inline-flex items-center justify-center px-8 sm:px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg shadow-indigo-900/50"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-xs uppercase tracking-widest mb-8">
            Proven ROI, Trusted by Contractors
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: '$160B+', label: 'Federal contracts awarded to small businesses yearly', icon: Award },
              { value: '50K+',   label: 'Active opportunities tracked from SAM.gov & FPDS',   icon: Shield },
              { value: '90%',    label: 'Time saved vs manual SAM.gov search every day',       icon: Target },
              { value: '3x',     label: 'More bids submitted by Sambid users on average',      icon: TrendingUp },
            ].map((stat, idx) => (
              <FadeIn key={idx} delay={idx * 80} className="px-2">
                <div className="flex justify-center mb-2 sm:mb-3">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">{stat.label}</div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 Phases ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need to Win Federal Contracts
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              One automated platform, from discovery to signed contract
            </p>
          </FadeIn>

          <div className="space-y-20 sm:space-y-28">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              const isFirst = idx === 0;
              const reversed = !isFirst && idx % 2 === 0;
              const theme = idx % 2 === 0 ? 'indigo' : 'purple';

              const media = (() => {
                const slotKey = `phase_${phase.phase}`;
                const slotMedia = pageMedia[slotKey] || {};
                const vSrc = slotMedia.video?.url ? resolveMediaUrl(slotMedia.video.url) : '';
                const pSrc = slotMedia.image?.url ? resolveMediaUrl(slotMedia.image.url) : '';
                return (
                  <GlowImageCard
                    videoSrc={vSrc}
                    posterSrc={pSrc}
                    src={pSrc}
                    alt={phase.headline}
                    theme={theme}
                    title={phase.videoTitle}
                  />
                );
              })();

              const badge = (
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {phase.phase}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide">
                    {phase.label}
                  </span>
                </div>
              );

              const points = (
                <ul className="space-y-3">
                  {phase.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              );

              if (isFirst) {
                return (
                  <FadeIn key={idx} delay={80}>
                    <div>
                      <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
                        <div className="flex items-center justify-center">{badge}</div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
                          {phase.headline}
                        </h3>
                        <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                          {phase.description}
                        </p>
                      </div>
                      <div className="mb-10 sm:mb-12">{media}</div>
                      <ul className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-x-8 gap-y-3">
                        {phase.points.map((point, i) => (
                          <li key={i} className="flex items-start gap-3 text-gray-700 text-sm sm:text-base">
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </FadeIn>
                );
              }

              return (
                <FadeIn key={idx} delay={80}>
                  <div className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${reversed ? 'lg:grid-flow-col-dense' : ''}`}>
                    <div className={reversed ? 'lg:col-start-2' : ''}>{media}</div>
                    <div className={reversed ? 'lg:col-start-1 lg:row-start-1' : ''}>
                      {badge}
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
                        {phase.headline}
                      </h3>
                      <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                        {phase.description}
                      </p>
                      {points}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 sm:py-20 md:py-24 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              What Contractors Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              Small businesses finding and winning federal contracts with Sambid
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'CEO, Tech Solutions LLC',
                content: 'Before Sambid I was spending hours on SAM.gov every morning. Now the matches come to me, filtered to exactly what we qualify for.',
                rating: 5,
              },
              {
                name: 'Michael Chen',
                role: 'Owner, Chen IT Consulting',
                content: 'The NAICS filtering is spot-on. I stopped seeing irrelevant contracts and started actually responding to bids we could win.',
                rating: 5,
              },
              {
                name: 'David Williams',
                role: 'Director, Williams Engineering Group',
                content: 'The AI proposal builder cut our response time in half. We went from 2 bids a month to 6. Worth every penny.',
                rating: 5,
              },
            ].map((t, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 hover:shadow-lg transition-shadow h-full">
                  <div className="flex mb-3 sm:mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-5 sm:mb-6 italic leading-relaxed">
                    "{t.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm sm:text-base">{t.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 sm:py-20">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Start Finding Federal Contracts Today
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-indigo-100 mb-7 sm:mb-8">
            Create your account and every feature unlocks automatically, free for 7 days. No credit card needed.
          </p>
          <Link
            to={ctaTo}
            className="inline-flex items-center px-7 sm:px-8 py-3.5 sm:py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105 text-sm sm:text-base"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Unlock Every Feature Free'}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <p className="mt-4 text-indigo-200 text-xs sm:text-sm">
            No credit card required · All Enterprise features included for 7 days
          </p>
        </div>
      </section>
    </div>
  );
}
