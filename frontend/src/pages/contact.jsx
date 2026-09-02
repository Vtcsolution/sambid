import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Building2, Mail, Phone, Users, MessageSquare, Globe,
  CheckCircle, Check, Loader2, ArrowRight, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { contactAPI, paymentAPI } from '../services/api';

const SERIF = { fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" };

const EMPLOYEE_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

// Qualifying questions, all folded into the submitted message rather than
// new DB fields - keeps the existing ContactInquiry/admin-review pipeline
// completely untouched while still giving the reviewer real context up
// front, before they ever pick up the phone.
const ACTIVITY_OPTIONS = [
  { value: 'active',   label: "We're actively bidding on federal contracts" },
  { value: 'some',     label: "We've won some contracts, want to do more" },
  { value: 'starting', label: "We're just getting started with federal contracting" },
];
const DECISION_OPTIONS = [
  { value: 'yes',        label: 'Yes' },
  { value: 'influence',  label: 'No, but I influence the decision' },
  { value: 'no',         label: 'No' },
];
const REVENUE_OPTIONS = [
  { value: 'under500k', label: 'Under $500k' },
  { value: '500k-1m',   label: '$500k - $1M' },
  { value: '1m-5m',     label: '$1M - $5M' },
  { value: '5m-25m',    label: '$5M - $25M' },
  { value: '25mplus',   label: '$25M+' },
];
const SOURCE_OPTIONS = ['Google', 'Facebook/Instagram', 'YouTube', 'ChatGPT', 'Claude', 'Referral', 'Other'];

// "Custom / Enterprise Plus" isn't a real DB plan - it's inherently
// beyond the fixed tiers (white-label, on-prem, etc.), so it has no live
// price to fetch and stays hand-authored.
const CUSTOM_PLAN_CARD = { value: 'custom', name: 'Custom / Enterprise Plus', badge: 'Large Teams' };

const STATUS_CONFIG = {
  new:         { label: 'Received',    color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: Clock,         desc: 'Your inquiry is in the queue. We\'ll be in touch shortly.' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: RefreshCw, desc: 'Our team is reviewing your request and will contact you soon.' },
  resolved:    { label: 'Resolved',    color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle,  desc: 'Your inquiry has been resolved. Check your email for details.' },
  closed:      { label: 'Closed',      color: 'bg-gray-100 text-gray-600 border-gray-200',   icon: AlertCircle,  desc: 'This inquiry was closed. Submit a new one if you need help.' },
};

function InquiryStatusCard({ inquiry, onNewInquiry }) {
  const cfg = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.new;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold mb-6 ${cfg.color}`}>
          <Icon className="w-4 h-4" />
          {cfg.label}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Inquiry Status</h2>
        <p className="text-gray-500 text-sm mb-6">{cfg.desc}</p>

        <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-6 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plan requested</span>
            <span className="font-medium capitalize">{inquiry.planInterest}</span>
          </div>
          {inquiry.company && (
            <div className="flex justify-between">
              <span className="text-gray-500">Company</span>
              <span className="font-medium">{inquiry.company}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Submitted</span>
            <span className="font-medium">{new Date(inquiry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last updated</span>
            <span className="font-medium">{new Date(inquiry.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Admin notes visible to user (if any) */}
        {inquiry.adminNotes && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Message from our team</p>
            <p className="text-sm text-indigo-900">{inquiry.adminNotes}</p>
          </div>
        )}

        {/* Status steps */}
        <div className="flex items-center gap-2 mb-6">
          {['new', 'in_progress', 'resolved'].map((s, i) => {
            const steps = ['new', 'in_progress', 'resolved'];
            const currentIndex = steps.indexOf(inquiry.status);
            const isActive  = i <= currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                } ${isCurrent ? 'ring-2 ring-indigo-300 ring-offset-1' : ''}`}>
                  {i + 1}
                </div>
                <span className={`text-xs ${isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                  {s === 'new' ? 'Received' : s === 'in_progress' ? 'In Review' : 'Done'}
                </span>
                {i < 2 && <div className={`flex-1 h-px ${isActive && i < currentIndex ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <a
            href={`mailto:${inquiry.email}`}
            className="flex-1 text-center py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Contact Support
          </a>
          {['resolved', 'closed'].includes(inquiry.status) && (
            <button
              onClick={onNewInquiry}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Submit New Inquiry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Left column: editorial content, no form logic ─────────────────────────────
function CheckItem({ children }) {
  return (
    <li className="flex items-start gap-2.5 text-[15px] text-gray-700">
      <Check className="w-4 h-4 text-indigo-600 mt-1 shrink-0" strokeWidth={3} />
      <span>{children}</span>
    </li>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <p className="font-semibold text-gray-900 mb-1.5">{title}</p>
      <p className="text-sm text-gray-500 leading-relaxed">{children}</p>
    </div>
  );
}

function PitchColumn() {
  return (
    <div className="lg:pr-6">
      <p className="text-xs text-gray-400 mb-4">
        <Link to="/" className="hover:text-gray-600">Home</Link> / <span className="text-gray-500">Pricing</span>
      </p>
      <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-3">Pricing</p>
      <h1 style={SERIF} className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-gray-900 leading-[1.15] mb-6">
        A quote built around how you actually bid.
      </h1>

      <h2 className="text-base font-bold text-gray-900 mb-2">See Sambid in action</h2>
      <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-5">
        Talk to our team and see how Sambid helps you find, analyze, and win more federal contracts,
        with your own data, not a demo account.
      </p>

      <ul className="space-y-2.5 mb-9">
        <CheckItem>A personalized walkthrough, not a canned tour</CheckItem>
        <CheckItem>See real opportunities scored against your own NAICS codes and past performance</CheckItem>
        <CheckItem>Run a live contract through the Compliance Matrix and proposal builder together</CheckItem>
        <CheckItem>Leave with a real quote for your seats and plan - not a range to chase down later</CheckItem>
      </ul>

      <div className="border-t border-gray-100 pt-8 mb-9">
        <h3 style={SERIF} className="text-2xl font-semibold text-gray-900 mb-1">What the quote is based on</h3>
        <p className="text-sm text-gray-500 mb-5">Three things, and you can work out roughly where you land before we talk.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoCard title="Seats">
            How many people need real access - capture, proposal writing, and BD roles all use it differently.
            Read-only stakeholders aren't charged for.
          </InfoCard>
          <InfoCard title="Plan">
            Starter, Pro, or Enterprise - which AI tools your team needs, from opportunity discovery up to
            full proposal + compliance automation.
          </InfoCard>
          <InfoCard title="Term">
            Monthly or annual billing. Onboarding and setup are part of getting started, not a line item
            bolted on afterward.
          </InfoCard>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8">
        <h3 style={SERIF} className="text-2xl font-semibold text-gray-900 mb-1">What there is to buy</h3>
        <p className="text-sm text-gray-500 mb-5">Every feature is real and already live in the product.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard title="Find">
            Opportunity discovery, smart alerts, deadline calendar, contract vehicle tracking, teaming partner finder.
          </InfoCard>
          <InfoCard title="Analyze &amp; respond">
            AI summarize, bid analysis, RFP analyzer, full proposal builder, compliance matrix, Go/No-Go decisions.
          </InfoCard>
          <InfoCard title="Manage">
            Bid pipeline, past performance repository, company workspace, shared document library.
          </InfoCard>
          <InfoCard title="Enterprise">
            Full API access, dedicated account manager, custom integrations, 24/7 priority support.
          </InfoCard>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isLoggedIn = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));

  // Arriving from Pricing carries which plan and billing cycle they clicked
  // "Contact Us" on, e.g. /contact?plan=pro&billing=monthly. No prices are
  // shown on this page, but the billing preference is real context, so it's
  // folded into the submitted message alongside the other qualifying answers.
  const urlPlan    = searchParams.get('plan');    // 'starter' | 'pro' | 'enterprise'
  const urlBilling = searchParams.get('billing'); // 'monthly' | 'yearly'
  const initialPlanInterest = ['starter', 'pro', 'custom'].includes(urlPlan) ? urlPlan : 'enterprise';

  const [existingInquiry, setExistingInquiry] = useState(null);
  const [checkingInquiry, setCheckingInquiry] = useState(isLoggedIn);
  const [forceNew, setForceNew] = useState(false);

  // Live plan pricing/features - same source as the Pricing page, never
  // hardcoded, so this page can never drift out of sync with real prices.
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getPlans()
      .then(res => { if (res.data.success) setPlans(res.data.data); })
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  }, []);

  const enterprisePlan = plans.find(p => p.name === 'enterprise');
  const proPlan        = plans.find(p => p.name === 'pro');
  const starterPlan    = plans.find(p => p.name === 'starter');

  const [form, setForm] = useState({
    name:        localStorage.getItem('userName') || '',
    email:       localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '',
    company:     '',
    website:     '',
    phone:       '',
    employees:   '',
    activity:    '',
    decision:    '',
    revenue:     '',
    source:      '',
    planInterest: initialPlanInterest,
    message:     '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');

  // Check if the logged-in user already has an open inquiry
  useEffect(() => {
    if (!isLoggedIn) { setCheckingInquiry(false); return; }
    contactAPI.myInquiries()
      .then(res => {
        const open = res.data.data?.find(i => !['closed'].includes(i.status));
        if (open) setExistingInquiry(open);
      })
      .catch(() => {})
      .finally(() => setCheckingInquiry(false));
  }, []);

  // This page exists specifically so a real person talks to the lead before
  // they see a number and bounce - so no price is ever shown here, on any
  // card, for any billing cycle.
  const planCards = [
    starterPlan    && { value: 'starter',    name: starterPlan.displayName,    badge: urlPlan === 'starter'    ? 'Requested' : null },
    proPlan        && { value: 'pro',        name: proPlan.displayName,        badge: urlPlan === 'pro' || !urlPlan ? (urlPlan === 'pro' ? 'Requested' : 'Popular') : null },
    enterprisePlan && { value: 'enterprise', name: enterprisePlan.displayName, badge: urlPlan === 'enterprise' ? 'Requested' : null },
    CUSTOM_PLAN_CARD,
  ].filter(Boolean);

  const planLabel = (value) => {
    if (value === 'starter' && starterPlan) return `${starterPlan.displayName}: Custom pricing`;
    if (value === 'pro' && proPlan) return `${proPlan.displayName}: Custom pricing`;
    if (value === 'enterprise' && enterprisePlan) return `${enterprisePlan.displayName}: Custom pricing`;
    return 'Custom / Enterprise Plus: Custom pricing';
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Your name is required.'); return; }
    if (!form.email.trim()) { setError('Email address is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address.'); return; }
    if (!form.message.trim()) { setError('Message is required.'); return; }
    if (form.message.trim().length < 10) { setError('Please write at least 10 characters in your message.'); return; }
    setSubmitting(true);
    setError('');
    try {
      // Fold every qualifying answer into the message text rather than
      // adding new DB fields, keeping the existing inquiry/admin-review
      // pipeline untouched while giving the reviewer full context up front.
      const activityLabel = ACTIVITY_OPTIONS.find(o => o.value === form.activity)?.label;
      const decisionLabel = DECISION_OPTIONS.find(o => o.value === form.decision)?.label;
      const revenueLabel  = REVENUE_OPTIONS.find(o => o.value === form.revenue)?.label;
      const qualifyingLines = [
        activityLabel && `Federal contracting activity: ${activityLabel}`,
        decisionLabel && `Sole decision-maker: ${decisionLabel}`,
        revenueLabel  && `Current annual revenue: ${revenueLabel}`,
        form.website.trim() && `Company website: ${form.website.trim()}`,
        form.source && `Heard about us via: ${form.source}`,
        urlBilling && `Billing preference: ${urlBilling === 'yearly' ? 'Yearly' : 'Monthly'}`,
      ].filter(Boolean);
      const composedMessage = qualifyingLines.length
        ? `${qualifyingLines.join('\n')}\n\n${form.message.trim()}`
        : form.message.trim();
      await contactAPI.submit({ ...form, message: composedMessage });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state while checking existing inquiry
  if (checkingInquiry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Show existing inquiry status (unless user explicitly wants a new one)
  if (existingInquiry && !forceNew) {
    return <InquiryStatusCard inquiry={existingInquiry} onNewInquiry={() => setForceNew(true)} />;
  }

  // Success state after submit
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
          <p className="text-gray-600 mb-2">
            Thank you! We have received your <strong>{planLabel(form.planInterest)}</strong> plan request.
            Our team will contact you within <strong>1 business day</strong> with your quote.
          </p>
          <p className="text-sm text-gray-400 mb-6">A confirmation email has been sent to <strong>{form.email}</strong>.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 sm:py-16 px-4">
      <SEOHead
        title="Get a Quote | Sambid Federal Contract Platform"
        description="Talk to our team and get a plan and pricing built around your real seats, modules, and usage - not a fixed tier. See Sambid in action with your own NAICS codes and contracts."
        keywords="Sambid pricing, federal contracting software quote, GovCon platform demo, custom SAM.gov tool pricing"
        canonical="https://sambid.co/contact"
      />
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16">
        <PitchColumn />

        {/* Form column - sticky so it stays in view while the pitch scrolls */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="border border-gray-200 rounded-2xl p-5 sm:p-7 bg-gray-50/60">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Book the call</h2>
            <p className="text-sm text-gray-500 mb-6">
              A few questions so the conversation is yours, not a generic tour - we'll come prepared with your answers already in hand.
            </p>

            {/* Plan chips */}
            {!plansLoading && (
              <div className="flex flex-wrap gap-2 mb-6">
                {planCards.map(plan => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, planInterest: plan.value }))}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold border-2 transition-all ${
                      form.planInterest === plan.value
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300'
                    }`}
                  >
                    {plan.name}
                    {plan.badge && <span className={form.planInterest === plan.value ? 'text-indigo-200' : 'text-indigo-500'}> · {plan.badge}</span>}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Which best describes your federal contracting activity? *
                </label>
                <select
                  name="activity" value={form.activity} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">Select one</option>
                  {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Are you the sole contract decision-maker? *
                </label>
                <select
                  name="decision" value={form.decision} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">Select one</option>
                  {DECISION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current annual revenue *</label>
                <select
                  name="revenue" value={form.revenue} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">Select one</option>
                  {REVENUE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="John Smith"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="john@company.com"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company website *</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" name="website" value={form.website} onChange={handleChange}
                      placeholder="company.com"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" name="company" value={form.company} onChange={handleChange}
                      placeholder="Acme Corp"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of employees</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="employees" value={form.employees} onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                    >
                      <option value="">Select range</option>
                      {EMPLOYEE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us? *</label>
                <select
                  name="source" value={form.source} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                >
                  <option value="">Select one</option>
                  {SOURCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tell us about your needs *</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    rows={3}
                    placeholder="Describe your use case, NAICS codes, contract types you target..."
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <>Request a demo <ArrowRight className="w-4 h-4" /></>}
              </button>

              <p className="text-xs text-center text-gray-400">
                We respond within 1 business day. A confirmation email will be sent to you.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
