import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Zap, Play,
  TrendingUp, Shield, Target, Award,
  Users, SlidersHorizontal, FileText, BellRing, Timer,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import SEOHead from '../components/SEOHead';
import ZoomableImage from '../components/ZoomableImage';
import { getVideoEmbed } from '../utils/videoEmbed';

const API = import.meta.env.VITE_BASE_URL || 'http://localhost:8000';

// lucide-react icon lookup for admin-picked icon names on compare items
const ICON_MAP = { Users, SlidersHorizontal, FileText, BellRing, Timer, Shield, Target, Award, TrendingUp, Zap };

function useHowItWorksContent() {
  const [content, setContent] = useState(null);
  useEffect(() => {
    fetch(`${API}/api/how-it-works`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data) setContent(d.data); })
      .catch(() => {});
  }, []);
  return content;
}

const ANIM_CSS = `
@keyframes _fadeUp {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hw-fade { animation: _fadeUp 0.75s ease-out both; }
.reveal {
  opacity: 0; transform: translateY(22px);
  transition: opacity 0.55s ease-out, transform 0.55s ease-out;
}
.reveal.in { opacity: 1; transform: translateY(0); }
`;

function FadeIn({ children, delay = 0, className = '' }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 });
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

function FlowChip({ kind, light, children }) {
  const cls = light
    ? (kind === 'out'  ? 'bg-indigo-600 text-white border-indigo-600' :
       kind === 'eng'  ? 'bg-indigo-600 text-white border-indigo-600' :
       kind === 'gold' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                        'bg-white text-indigo-700 border-indigo-200')
    : (kind === 'out'  ? 'bg-white text-indigo-900 border-white' :
       kind === 'eng'  ? 'bg-indigo-600 text-white border-indigo-500' :
       kind === 'gold' ? 'bg-indigo-500/25 text-indigo-50 border-indigo-400/40' :
                        'bg-white/10 text-indigo-100 border-white/15');
  return (
    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${cls} leading-snug`}>
      {children}
    </span>
  );
}

// Row-by-row transformation: each pain sits directly across from its fix
const COMPARE = [
  {
    icon: Users, topic: 'Team Size',
    before: <><strong className="text-gray-900">20-person team</strong> monitoring SAM.gov manually, every day</>,
    after:  <><strong className="text-gray-900">1–2 people</strong> — discovery runs fully automated while you sleep</>,
  },
  {
    icon: SlidersHorizontal, topic: 'Daily Noise',
    before: <><strong className="text-gray-900">150 solicitations/day</strong> — 90% completely irrelevant</>,
    after:  <>Only <strong className="text-gray-900">matched, scored &amp; ranked</strong> opportunities reach you</>,
  },
  {
    icon: FileText, topic: 'Proposal Cost',
    before: <><strong className="text-gray-900">$50,000 per proposal</strong> for a human proposal writer</>,
    after:  <>AI drafts the full proposal in <strong className="text-gray-900">under 3 minutes</strong></>,
  },
  {
    icon: BellRing, topic: 'Deadlines',
    before: <>Missed deadlines, wrong NAICS codes, <strong className="text-gray-900">lost bids</strong></>,
    after:  <>Alerts at <strong className="text-gray-900">7 days / 24 hours / 1 hour</strong> — on every device</>,
  },
  {
    icon: Timer, topic: 'Bid Decision',
    before: <><strong className="text-gray-900">3 days</strong> of analysis + consultant fees per decision</>,
    after:  <>Data-backed <strong className="text-gray-900">Go/No-Go answer in 30 seconds</strong></>,
  },
];

const HERO_STATS = [
  { icon: Award,     val: '$760B',  lbl: 'Federal spend / year' },
  { icon: Target,    val: '$174B',  lbl: 'Mandated for small biz' },
  { icon: Shield,    val: '95%',    lbl: 'Small biz never win' },
  { icon: TrendingUp,val: '17',     lbl: 'Automated workflows' },
];

const AI_ENGINE = [
  { label: 'SAM.gov Opportunity', kind: 'in' }, { sep: '+' },
  { label: 'Company Profile', kind: 'in' }, { sep: '+' },
  { label: 'USASpending Awards', kind: 'gold' }, { sep: '→' },
  { label: 'Sambid AI Engine', kind: 'eng' }, { sep: '→' },
  { label: 'Company-Specific Output', kind: 'out' },
];

// Each point can optionally carry a `video` (YouTube/Vimeo/direct .mp4 URL)
// and/or a `videoThumbnail` (poster image shown before/instead of the video).
// When present it renders above the "Automated Workflow" chip strip; when
// absent (as now, for all 17), nothing extra shows and the page looks exactly
// as it does today. Example once a clip is ready:
//   video: 'https://youtube.com/watch?v=XXXXXXXXXXX',
//   videoThumbnail: 'https://.../point-01-thumb.jpg',
const PAIN_POINTS = [
  {
    num: '01',
    title: 'Wrong NAICS Code: A $4B Opportunity Invisible to Everyone',
    pain: 'Contracting Officer enters wrong NAICS → your filter never sees it → competitor wins unopposed',
    solve: 'Sambid downloads every SAM.gov solicitation daily with no category filter, then runs a secondary keyword search per industry ("IT services", "cybersecurity", "cloud infrastructure") to catch postings where the contracting officer used the wrong code. A $4B IT contract mislabeled under a different industry code still lands in your feed. No other platform does this.',
    flow: [
      { label: 'All SAM.gov solicitations, no filter', kind: 'in' }, { sep: '→' },
      { label: 'Industry keyword cross-check', kind: 'in' }, { sep: '→' },
      { label: 'Marked relevant to your business', kind: 'in' }, { sep: '→' },
      { label: 'Your feed, including misclassified contracts', kind: 'out' },
    ],
  },
  {
    num: '02',
    title: 'Go / No-Go Decision: 3 Days of Consultant Time → 30 Seconds',
    pain: 'Bid decisions made on gut feel or skipped entirely, wasting proposal budget on unwinnable contracts',
    solve: 'AI reads the full opportunity (scope, set-aside, timeline, incumbent signals, value) against your Company Profile (UEI, CAGE, certifications, NAICS, capabilities) and USASpending history. Outputs a confidence-scored recommendation, Go, Lean Go, or No-Go, with the 12 specific factors behind the call.',
    flow: [
      { label: 'Full opportunity + attachments', kind: 'in' }, { sep: '+' },
      { label: 'Company profile (UEI/CAGE/certs)', kind: 'in' }, { sep: '+' },
      { label: 'USASpending incumbent data', kind: 'gold' }, { sep: '→' },
      { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
      { label: 'Scored Go/No-Go + rationale', kind: 'out' },
    ],
  },
  {
    num: '03',
    title: 'Deadline Passed at 4:50 PM: You Opened It at 4:55 PM',
    pain: 'Federal deadlines are hard stops. One minute late means automatic disqualification, no exceptions, no appeal',
    solve: 'Three-stage automated alert system per opportunity: 7-day email (plan your team), 24-hour email + push notification (final review), 1-hour push to all devices + browser tab badge (last chance). If response deadline passes, opportunity is flagged "Expired / Do Not Submit" and removed from active pipeline automatically.',
    flow: [
      { label: 'Your saved opportunity deadlines', kind: 'in' }, { sep: '→' },
      { label: 'Background monitor (24/7)', kind: 'in' }, { sep: '→' },
      { label: '7-day / 24-hour / 1-hour triggers', kind: 'in' }, { sep: '→' },
      { label: 'Email + Chrome push + in-app, all at once', kind: 'out' },
    ],
  },
  {
    num: '04',
    title: 'Smart Filters: Find Winnable Contracts in 10 Seconds',
    pain: '1,500 new solicitations daily. Your team reads hundreds of irrelevant ones before finding one worth pursuing',
    solve: 'Multi-dimensional real-time filter: NAICS code or industry keyword, city/state location, due date range (next 7/15/30/60/90 days), days left to apply, notice type, set-aside type, specific agency (DoD, NASA, VA...), contract value bracket, PSC code, and custom posted-date range.',
    flow: [
      { label: 'Your filter selections', kind: 'in' }, { sep: '→' },
      { label: 'Instant search across all live solicitations', kind: 'in' }, { sep: '→' },
      { label: 'Only the contracts that fit, ranked by match score', kind: 'out' },
    ],
  },
  {
    num: '05',
    title: 'Complete Opportunity Data: Nothing Missing, Direct SAM.gov Link',
    pain: 'Incomplete listings with no description, no attachments, and no contact waste hours chasing information that should be instant',
    solve: 'Sambid fetches every field SAM.gov returns: title, agency chain (department → subTier → office), NAICS + description, PSC code, set-aside type, place of performance, all points of contact, resource/attachment links, notice type, archive date, award details, and performance period. Every opportunity shows a direct "View on SAM.gov" button.',
    flow: [
      { label: 'SAM.gov daily download, all categories', kind: 'in' }, { sep: '→' },
      { label: 'Every field captured and stored', kind: 'in' }, { sep: '→' },
      { label: 'Matched and scored against your profile', kind: 'in' }, { sep: '→' },
      { label: 'Complete listing + one-click SAM.gov link', kind: 'out' },
    ],
  },
  {
    num: '06',
    title: 'Submission Deadline Calendar: Every Active Bid, Visible at Once',
    pain: 'Teams track deadlines in shared spreadsheets that get out of sync, and someone always has the wrong date',
    solve: 'Full calendar view of every opportunity in your bid pipeline with response deadlines plotted by day. Color-coded urgency (green → yellow → red as deadline approaches). Team members all see the same live calendar, no spreadsheet, no manual updates.',
    flow: [
      { label: 'Your saved and pipeline opportunities', kind: 'in' }, { sep: '→' },
      { label: 'Auto-plotted on shared team calendar', kind: 'in' }, { sep: '→' },
      { label: 'Live deadline view, same for every team member', kind: 'out' },
    ],
  },
  {
    num: '07',
    title: 'Who Won: Stop Bidding Blind, Know the Incumbent',
    pain: 'You bid $2.1M. Incumbent renewed at $1.8M for the 4th time. You had no idea they existed.',
    solve: "USASpending.gov historical award data matched against the active opportunity by NAICS code, agency, and contract type. Sambid shows who won this or a similar contract before, what they were paid, what certifications they hold, and how many times they've renewed, turning history into tactical advantage.",
    flow: [
      { label: 'USASpending past awards', kind: 'in' }, { sep: '+' },
      { label: 'Opportunity NAICS + agency', kind: 'in' }, { sep: '+' },
      { label: 'Your company profile', kind: 'in' }, { sep: '→' },
      { label: 'Incumbent ID + price benchmarks + your advantage points', kind: 'out' },
    ],
  },
  {
    num: '08',
    title: 'Smart Alerts: Relevant Opportunities Find You in Real Time',
    pain: 'By the time your team finds a new solicitation manually, the best teaming partners are already taken',
    solve: 'Custom alert rules by keyword, NAICS code, agency name, set-aside type, and contract value range. When a match fires: in-app notification, email digest (real-time for Pro/Enterprise, daily for Starter), and Chrome push notification to desktop/mobile even when the browser tab is closed.',
    flow: [
      { label: 'New opportunity posted', kind: 'in' }, { sep: '→' },
      { label: 'Alert rule match check', kind: 'in' }, { sep: '→' },
      { label: 'Email + Chrome push + in-app, simultaneously', kind: 'out' },
    ],
  },
  {
    num: '09',
    title: 'AI Proposal Builder: Full Draft in 3 Minutes, Not 3 Weeks',
    pain: "$5,000–$50,000 per proposal for a human writer. Lose the bid, lose the investment. Most small businesses can't afford to bid.",
    solve: "AI reads the full RFP (including attached PDFs), extracts all technical requirements, evaluation criteria, and submission format rules, then writes a structured, compliant proposal draft: Executive Summary, Technical Approach, Management Plan, Past Performance, and Pricing Narrative. Upload a sample winning proposal and the AI adopts its structure and tone.",
    flow: [
      { label: 'RFP full text + attachments', kind: 'in' }, { sep: '+' },
      { label: 'Company profile + past performance', kind: 'in' }, { sep: '+' },
      { label: 'Sample proposal (optional)', kind: 'gold' }, { sep: '→' },
      { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
      { label: 'Complete compliant proposal draft', kind: 'out' },
    ],
  },
  {
    num: '10',
    title: 'Past Performance: Your Win History Becomes a Competitive Weapon',
    pain: 'Every proposal needs Past Performance citations. Pulling them from old contracts takes days and produces inconsistent write-ups.',
    solve: 'Structured Past Performance database inside your Company Profile. USASpending integration auto-imports your historical federal awards by UEI, no manual entry for existing federal work. When AI Proposal Builder runs, it selects and formats the 3 most relevant citations automatically based on scope match.',
    flow: [
      { label: 'Federal award history (auto-imported by UEI)', kind: 'in' }, { sep: '+' },
      { label: 'Manually added past contracts', kind: 'in' }, { sep: '→' },
      { label: 'Saved as ready-to-use citations', kind: 'in' }, { sep: '→' },
      { label: 'Best-fit citations auto-selected in every proposal', kind: 'out' },
    ],
  },
  {
    num: '11',
    title: 'Sources Sought Generator: Turn Market Research Notices into Pipeline',
    pain: 'Most companies ignore Sources Sought notices, but the companies that respond shape the requirement and often win the follow-on contract.',
    solve: 'When you save a Sources Sought notice, Sambid AI drafts a response: capability narrative tailored to the stated requirement, relevant NAICS and PSC codes, certifications highlighted (8(a), WOSB, HUBZone, SDVOSB), and a concise past performance example from your profile. Responding is now a 2-minute action, not a half-day project.',
    flow: [
      { label: 'Saved Sources Sought notice', kind: 'in' }, { sep: '+' },
      { label: 'Company profile + certs + past perf', kind: 'in' }, { sep: '→' },
      { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
      { label: 'Targeted response, ready to submit', kind: 'out' },
    ],
  },
  {
    num: '12',
    title: 'Capability Statement Generator: One Page That Opens Doors',
    pain: "A federal cap statement that's outdated, generic, or formatted wrong gets discarded by procurement officers in under 5 seconds.",
    solve: 'Pulls directly from your Company Profile (UEI, CAGE, NAICS codes with descriptions, core capabilities, certifications, differentiators, past performance highlights, contact info) and generates a formatted, one-page federal capability statement. Tailored version available per opportunity.',
    flow: [
      { label: 'Company Profile (all fields)', kind: 'in' }, { sep: '+' },
      { label: 'Target opportunity (optional)', kind: 'gold' }, { sep: '→' },
      { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
      { label: 'Formatted 1-page federal cap statement PDF', kind: 'out' },
    ],
  },
  {
    num: '13',
    title: 'RFP Analyzer: 400-Page Document Understood in 3 Minutes',
    pain: 'A 400-page RFP with 12 attachments takes 3 days for a compliance team to parse. Small businesses simply skip it and lose.',
    solve: "Upload any RFP PDF. AI extracts: mandatory requirements (M-sections), evaluation criteria with point weights, submission format checklist, key dates, incumbent information, and red-flag clauses (unusual IP ownership, unrealistic timelines, vague acceptance criteria). Outputs a compliance matrix marked green, yellow, or red on every requirement.",
    flow: [
      { label: 'RFP PDF (uploaded or from SAM.gov)', kind: 'in' }, { sep: '+' },
      { label: 'Company capabilities', kind: 'in' }, { sep: '→' },
      { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
      { label: 'Compliance matrix + red-flag report', kind: 'out' },
    ],
  },
  {
    num: '14',
    title: 'Teaming Finder: Win Contracts That Are Too Big to Win Alone',
    pain: "A $50M contract needs capabilities you don't have. The contract goes to someone who found a partner at last year's conference.",
    solve: "Sambid identifies which capabilities the opportunity requires that your company doesn't cover, then searches the federal vendor registry (140K+ registered businesses) for verified companies with complementary expertise, active federal registrations, and compatible set-aside certifications.",
    flow: [
      { label: 'Your capability gaps vs opportunity requirements', kind: 'in' }, { sep: '→' },
      { label: 'Federal vendor registry (140K+ businesses)', kind: 'in' }, { sep: '→' },
      { label: 'Ranked teaming partner suggestions, ready to contact', kind: 'out' },
    ],
  },
  {
    num: '15',
    title: 'Market Intelligence: Know Where the Money Is Going Before Others Do',
    pain: "You're bidding in markets that agencies are quietly exiting, while missing sectors where spending is accelerating.",
    solve: 'USASpending historical award data aggregated by agency, NAICS, quarter, and fiscal year. Shows which agencies increased spending in the last 4 quarters, which NAICS codes have the highest award volume and lowest competition density, and which agencies have upcoming recompete cycles.',
    flow: [
      { label: 'Federal award history (multiple years)', kind: 'in' }, { sep: '+' },
      { label: 'Your industry and certifications', kind: 'in' }, { sep: '→' },
      { label: 'Spend trends + competition density + recompete radar', kind: 'out' },
    ],
  },
  {
    num: '16',
    title: 'Contract Vehicle Tracker: Stop Missing On-Ramp Windows',
    pain: 'GSA Schedule, SEWP V, CIO-SP3, and OASIS+ on-ramp windows open once every few years. Missing them locks you out for the next 5–10 years.',
    solve: 'Tracks all major IDIQ, GWAC, and BPA contract vehicles: type, eligibility requirements, current on-ramp status (open / closed / upcoming), expiration dates, ceiling values, and which agencies use them most. Matches your Company Profile against eligibility and flags vehicles you qualify for today.',
    flow: [
      { label: 'Contract vehicle database', kind: 'in' }, { sep: '+' },
      { label: 'Company certs + NAICS', kind: 'in' }, { sep: '→' },
      { label: 'Eligibility match + on-ramp alerts', kind: 'out' },
    ],
  },
  {
    num: '17',
    title: 'Company Workspace: One Source of Truth for Everything',
    pain: 'Company info scattered across email threads, SharePoint folders, and old proposal hard drives. Every proposal starts from scratch, repeating the same mistakes.',
    solve: "Company Profile (UEI, CAGE, certifications, NAICS codes, core capabilities) is the single context layer all 17 AI features pull from. Team Management with role-based access (admin / analyst / viewer). Document Library for past proposals, cap statements, teaming agreements. Managed Service: Sambid's team monitors, writes, and submits bids on your behalf.",
    flow: [
      { label: 'Company profile (registrations, certs, capabilities)', kind: 'in' }, { sep: '→' },
      { label: 'Powers all 17 features as shared context', kind: 'in' }, { sep: '→' },
      { label: 'Team roles control what each person sees', kind: 'in' }, { sep: '→' },
      { label: 'Every output is company-specific, never generic', kind: 'out' },
    ],
  },
];

export default function HowItWorks() {
  const { isAuthenticated } = useAuth();
  const cms = useHowItWorksContent();

  // Every section falls back to the hardcoded defaults above until an admin
  // seeds/edits the page — the live site never breaks or shows blank content.
  const hero = {
    badge: cms?.hero?.badge || 'Intelligence Brief: Expert Edition',
    titleLine1: cms?.hero?.titleLine1 || 'Federal BD Intelligence.',
    titleLine2: cms?.hero?.titleLine2 || 'Automated.',
    subtitle: cms?.hero?.subtitle || 'Sambid replaces a 20-person BD team with 17 automated workflows: daily contract discovery, AI-drafted proposals, deadline alerts, and Go/No-Go decisions. One platform, one person, maximum wins.',
  };
  const compareMeta = {
    tag: cms?.compareSection?.tag || 'The Problem We Solve',
    title: cms?.compareSection?.title || 'What Changes When You Use Sambid',
    subtitle: cms?.compareSection?.subtitle || 'Five things every contractor will recognize — each pain, and exactly what it becomes.',
    summaryLine: cms?.compareSection?.summaryLine || "20 people → 2. $50,000 → 3 minutes. 3 days → 30 seconds. That's the change.",
  };
  const compareItems = (cms?.compareSection?.items?.length ? cms.compareSection.items : COMPARE).map(item => ({
    ...item,
    icon: typeof item.icon === 'string' ? (ICON_MAP[item.icon] || Zap) : item.icon,
  }));
  const aiEngineMeta = {
    tag: cms?.aiEngineSection?.tag || 'The Intelligence Layer',
    title: cms?.aiEngineSection?.title || 'One AI Engine Powers All 17 Workflows',
    subtitle: cms?.aiEngineSection?.subtitle || 'Every feature draws from the same intelligence layer. The output is never generic. It knows your registrations, certifications, capabilities, and past contracts before it writes a single word.',
  };
  const aiEngineFlow = cms?.aiEngineSection?.flow?.length ? cms.aiEngineSection.flow : AI_ENGINE;
  const painPointsMeta = {
    tag: cms?.painPointsSection?.tag || '17 Problems. 17 Solutions.',
    title: cms?.painPointsSection?.title || 'What Is Costing You Contracts',
    subtitle: cms?.painPointsSection?.subtitle || 'Every pain point a federal contractor faces, and exactly how Sambid eliminates it, with the full automated workflow shown.',
  };
  const painPoints = cms?.painPoints?.length ? cms.painPoints : PAIN_POINTS;
  const closing = {
    title: cms?.closing?.title || 'The Bottom Line for Expert Contractors',
    text: cms?.closing?.text || "Every contract you lost in the last 12 months had a reason. A solicitation your team never saw. A deadline missed by hours. A proposal that read like a template. An incumbent you didn't know existed. None of those are failures of capability. They are failures of intelligence. Your competitors aren't smarter. They just had better information, faster. Sambid is that information.",
  };

  const ctaHref  = isAuthenticated ? '/dashboard' : '/signup';
  const ctaLabel = isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial';

  return (
    <div className="overflow-hidden bg-white">
      <style>{ANIM_CSS}</style>
      <SEOHead
        title="How Sambid Works: Federal Contract Intelligence Platform"
        description="Sambid replaces a 20-person federal BD team with 17 automated workflows. See every pain point and exactly how we solve it."
        keywords="how sambid works, federal contract automation, SAM.gov intelligence, bid intelligence, federal BD automation, government contract AI"
        canonical="https://sambid.co/how-it-works"
      />

      {/* ── Hero - 2-column matching home page ───────────────── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left - text */}
            <div className="hw-fade">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <Zap className="w-4 h-4 mr-2 text-indigo-300 shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  {hero.badge}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-5 sm:mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                  {hero.titleLine1}
                </span>
                <span className="block text-2xl sm:text-4xl md:text-5xl mt-2 text-indigo-200 font-semibold">
                  {hero.titleLine2}
                </span>
              </h1>

              <p className="text-base sm:text-xl text-indigo-100 mb-7 sm:mb-8 leading-relaxed max-w-lg">
                {hero.subtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to={ctaHref}
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105 text-sm sm:text-base"
                >
                  {ctaLabel}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl font-semibold transition-all duration-200 border border-white/20 text-sm sm:text-base"
                >
                  View Pricing
                </Link>
              </div>

              <p className="mt-5 text-indigo-300 text-xs sm:text-sm">
                No credit card required · Cancel anytime · Setup in 5 minutes
              </p>
            </div>

            {/* Right - platform overview card */}
            <div className="hw-fade" style={{ animationDelay: '0.2s' }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 sm:p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-indigo-300 uppercase tracking-widest mb-1">Platform Overview</p>
                    <p className="text-white font-bold text-lg">17 Automated Workflows</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {HERO_STATS.map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="bg-white/8 rounded-xl p-4 border border-white/10">
                        <Icon className="w-4 h-4 text-indigo-300 mb-2" />
                        <div className="text-xl font-bold text-white">{s.val}</div>
                        <div className="text-xs text-indigo-300 mt-0.5">{s.lbl}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Before → After compact */}
                <div className="rounded-xl border border-white/10 overflow-hidden text-xs">
                  <div className="flex">
                    <div className="flex-1 border-r border-white/10 px-3 py-2.5">
                      <p className="text-indigo-300/70 font-bold uppercase tracking-wider text-[10px] mb-1">Before</p>
                      <p className="text-white/70">20-person team · $50K proposals · missed deadlines</p>
                    </div>
                    <div className="flex-1 px-3 py-2.5">
                      <p className="text-indigo-300 font-bold uppercase tracking-wider text-[10px] mb-1">After</p>
                      <p className="text-white/70">1–2 people · AI drafts · 30-sec decisions</p>
                    </div>
                  </div>
                </div>

                {/* AI Engine mini flow */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Engine</p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { t: 'SAM.gov', c: 'bg-white/10 text-indigo-200' },
                      { t: '+', c: 'text-white/40 font-bold' },
                      { t: 'Company Profile', c: 'bg-white/10 text-indigo-200' },
                      { t: '+', c: 'text-white/40 font-bold' },
                      { t: 'USASpending', c: 'bg-indigo-500/25 text-indigo-100' },
                      { t: '→', c: 'text-white/40 font-bold' },
                      { t: 'Sambid AI', c: 'bg-indigo-600 text-white' },
                      { t: '→', c: 'text-white/40 font-bold' },
                      { t: 'Your Output', c: 'bg-white text-indigo-900' },
                    ].map((item, i) =>
                      item.c.includes('font-bold') && !item.c.includes('bg-')
                        ? <span key={i} className={`text-xs ${item.c}`}>{item.t}</span>
                        : <span key={i} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.c}`}>{item.t}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Before / After - row-by-row transformation ───────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-3">
              {compareMeta.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {compareMeta.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
              {compareMeta.subtitle}
            </p>
          </FadeIn>

          <div className="max-w-4xl mx-auto space-y-3">
            {compareItems.map((row, i) => {
              const Icon = row.icon;
              return (
                <FadeIn key={i} delay={i * 60}>
                  <div className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-2xl border border-indigo-100/70 bg-transparent hover:bg-indigo-50/40 transition-colors px-5 sm:px-7 py-5">

                    {/* Icon + topic */}
                    <div className="flex items-center gap-3 sm:w-44 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{row.topic}</p>
                    </div>

                    {/* Before → After */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <p className="text-sm sm:text-[15px] text-gray-400 leading-relaxed flex-1">{row.before}</p>
                      <ArrowRight className="hidden sm:block w-4 h-4 text-indigo-300 shrink-0" />
                      <p className="text-sm sm:text-[15px] text-gray-800 leading-relaxed flex-1 font-medium">{row.after}</p>
                    </div>

                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Summary strip */}
          <FadeIn delay={compareItems.length * 60}>
            <div className="max-w-4xl mx-auto mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-6 sm:px-8 py-5 text-center">
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                <span className="text-indigo-700 font-bold">{compareMeta.summaryLine}</span>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="py-12 bg-white border-y border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-xs uppercase tracking-widest mb-8">
            Federal Market at a Glance
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            {HERO_STATS.map((s, i) => {
              const Icon = s.icon;
              return (
                <FadeIn key={i} delay={i * 80}>
                  <div className="flex justify-center mb-2">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{s.val}</div>
                  <div className="text-xs sm:text-sm text-gray-500 leading-relaxed">{s.lbl}</div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── AI Engine ─────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-3">
              {aiEngineMeta.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {aiEngineMeta.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              {aiEngineMeta.subtitle}
            </p>
          </FadeIn>

          <FadeIn>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 sm:p-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">How the AI Engine Works</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {aiEngineFlow.map((item, i) =>
                  item.sep
                    ? <span key={i} className="text-gray-400 text-sm font-bold shrink-0">{item.sep}</span>
                    : <FlowChip key={i} kind={item.kind} light>{item.label}</FlowChip>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 17 Pain Points ────────────────────────────────────── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-3">
              {painPointsMeta.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {painPointsMeta.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              {painPointsMeta.subtitle}
            </p>
          </FadeIn>

          <div className="space-y-6 sm:space-y-8">
            {painPoints.map((pp, idx) => {
              const reversed = idx % 2 !== 0;
              return (
                <FadeIn key={pp.num} delay={Math.min(idx * 20, 150)}>
                  <div
                    className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center rounded-3xl border border-indigo-100/70 p-6 sm:p-10 ${
                      reversed ? 'lg:grid-flow-col-dense' : ''
                    }`}
                  >
                    {/* Workflow visual block */}
                    <div className={`order-2 lg:order-none ${reversed ? 'lg:col-start-2' : ''}`}>
                      <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-indigo-50/30 shadow-lg mb-4"
                        style={{ aspectRatio: '16/9' }}>
                        {(() => {
                          const embed = getVideoEmbed(pp.video);
                          if (embed && embed !== 'direct') {
                            return (
                              <iframe src={embed} className="w-full h-full" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen title={pp.title} />
                            );
                          }
                          if (embed === 'direct') {
                            return (
                              <video controls className="w-full h-full" preload="metadata" poster={pp.videoThumbnail}>
                                <source src={pp.video} type="video/mp4" />
                              </video>
                            );
                          }
                          if (pp.videoThumbnail) {
                            return <ZoomableImage src={pp.videoThumbnail} alt={pp.title} />;
                          }
                          // no video/thumbnail set yet — visible placeholder so it's
                          // obvious this slot exists and is waiting for point N's clip
                          return (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center p-8">
                                <div className="w-14 h-14 rounded-full bg-indigo-600/90 flex items-center justify-center mx-auto mb-3 shadow-lg">
                                  <Play className="w-6 h-6 text-white ml-0.5" />
                                </div>
                                <p className="text-indigo-700 text-sm font-semibold">Video coming soon</p>
                                <p className="text-indigo-400 text-xs mt-1">Point {idx + 1} of 17</p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 sm:p-8">
                        <div className="flex items-center gap-1.5 mb-4">
                          <Zap className="w-3.5 h-3.5 text-indigo-500" />
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Automated Workflow
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {pp.flow.map((item, i) =>
                            item.sep
                              ? <span key={i} className="text-gray-300 text-sm font-bold shrink-0">{item.sep}</span>
                              : <FlowChip key={i} kind={item.kind} light>{item.label}</FlowChip>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Text block */}
                    <div className={`order-1 lg:order-none ${reversed ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold">
                          {pp.num}
                        </span>
                        <span className="text-indigo-600 text-sm font-semibold uppercase tracking-wide">
                          Pain Point {idx + 1} of 17
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-snug">
                        {pp.title}
                      </h3>

                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                        <strong className="text-gray-900">The problem:</strong> {pp.pain}
                      </p>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        <strong className="text-indigo-700">The Sambid fix:</strong> {pp.solve}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────── */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 py-16 sm:py-20">
        <div className="absolute inset-0 bg-black opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            {closing.title}
          </h2>
          <p className="text-base sm:text-lg text-indigo-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            {closing.text}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to={ctaHref}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105"
            >
              {ctaLabel}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20"
            >
              Talk to Us
            </Link>
          </div>
          <p className="mt-5 text-indigo-200 text-xs sm:text-sm">
            No credit card required &middot; Cancel anytime &middot; Setup in 5 minutes
          </p>
        </div>
      </section>

    </div>
  );
}
