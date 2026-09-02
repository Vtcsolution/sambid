// frontend/src/pages/Pricing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, Zap, Rocket, Sparkles, Building2, ArrowRight, ShieldCheck, Headset, XCircle, ReceiptText } from 'lucide-react';
import { paymentAPI } from '../services/api';
import SEOHead from '../components/SEOHead';

// Visual identity per tier - icon, purely presentational, keyed off the
// same plan.name the backend already uses.
const TIER_ICON = {
  starter:    Rocket,
  pro:        Sparkles,
  enterprise: Building2,
};

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Secure Payments' },
  { icon: Headset,     label: '24/7 Support' },
  { icon: XCircle,     label: 'Cancel Anytime' },
  { icon: ReceiptText, label: 'No Hidden Fees' },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [selectedTier, setSelectedTier] = useState('pro');

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
        setUserPlan(localStorage.getItem('userPlan'));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch plans from API
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await paymentAPI.getPlans();
      if (response.data.success) {
        setPlans(response.data.data);
        const paid = response.data.data.filter(p => p.name !== 'free');
        const storedPlan = localStorage.getItem('userPlan');
        if (paid.some(p => p.name === storedPlan)) setSelectedTier(storedPlan);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleUpgrade = (plan) => {
    if (plan.name === 'free') {
      navigate('/signup');
      return;
    }
    navigate(`/contact?plan=${plan.name}&billing=${billingCycle}`);
  };

  if (loading || plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Sort plans by order. Free trial stays self-serve and gets its own card;
  // Starter/Pro/Enterprise are custom-quoted, so they share one "Contact Us"
  // card with a tier switcher instead of three separate cards.
  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);
  const freePlan = sortedPlans.find(p => p.name === 'free');
  const paidPlans = sortedPlans.filter(p => p.name !== 'free');
  const activePaidPlan = paidPlans.find(p => p.name === selectedTier) || paidPlans[0];

  return (
    <div className="min-h-screen bg-slate-50 py-14 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Soft ambient color, not a flat gray field */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-indigo-100/60 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-100/50 blur-3xl" />

      <SEOHead
        title="Pricing | Federal Contract Alert Plans"
        description="Start free with Sambid's AI-powered federal contract matching - no credit card required. Starter, Pro, and Enterprise plans are custom-quoted for your business; talk to our team to get set up."
        keywords="federal contracting software pricing, SAM.gov alert subscription, government contracting tool cost, federal opportunity tracker price, small business contracting plan, federal contract software cost, GovCon software pricing, best federal contracting tool price, SAM.gov alert service cost, government bid software plans, affordable federal contracting software"
        canonical="https://sambid.co/pricing"
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold tracking-wide uppercase mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Pricing
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Plans built around your business
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Create your account and every feature unlocks automatically, free for 7 days, no credit card required.
            After that, pick the tier closest to your team and we'll get you a plan and a quote within 1 business day.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 bg-white border border-slate-200 rounded-full shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Yearly
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards - just two: Free (self-serve) and Contact Us (Starter/Pro/Enterprise) */}
        <h2 className="sr-only">Compare Sambid Federal Contracting Plans</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-4xl mx-auto">

          {/* Free card - the promo pitch */}
          {freePlan && (
            <div className="relative rounded-3xl bg-white shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300 flex flex-col overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="p-7 sm:p-8">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-amber-50">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-slate-900">{freePlan.displayName}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                    <Sparkles className="w-2.5 h-2.5" />
                    7 days free
                  </span>
                </div>
                <p className="text-sm mt-2 leading-relaxed text-slate-500">
                  We unlock every feature for you. Just create an account and enjoy the platform.
                </p>

                <div className="mt-6 mb-1">
                  <span className="text-3xl font-bold tabular-nums text-slate-900">Free</span>
                  <p className="text-xs mt-1.5 text-slate-400">Then continues on a standard 5-day trial</p>
                </div>

                {userPlan === 'free' ? (
                  <div className="w-full mt-6 px-4 py-3 rounded-xl font-semibold text-center text-sm bg-emerald-50 text-emerald-700">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(freePlan)}
                    className="w-full mt-6 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/30"
                  >
                    Create Your Free Account
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-7 sm:p-8 pt-5 border-t border-slate-100 mt-auto">
                <p className="text-xs font-bold uppercase tracking-wide mb-3.5 text-slate-400">What's included</p>
                <ul className="space-y-2.5">
                  {freePlan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50">
                        <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3.5} />
                      </span>
                      <span className="text-slate-700">{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Contact Us card - one card, tier switcher for Starter/Pro/Enterprise */}
          {activePaidPlan && (
            <div className="relative rounded-3xl bg-slate-900 shadow-xl shadow-slate-900/20 transition-all duration-300 flex flex-col overflow-hidden">
              <div className="p-7 sm:p-8 pb-0">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-white/10">
                  {(() => { const Icon = TIER_ICON[activePaidPlan.name] || Building2; return <Icon className="w-6 h-6 text-white" />; })()}
                </div>

                <h3 className="text-xl font-bold text-white">Starter, Pro &amp; Enterprise</h3>
                <p className="text-sm mt-2 leading-relaxed text-slate-400">
                  Custom-priced plans built around your team size and how you bid. Tell us about your business
                  and we'll recommend the right plan and a quote within 1 business day.
                </p>

                {/* Tier switcher */}
                <div className="inline-flex items-center gap-1 mt-5 p-1 bg-white/5 border border-white/10 rounded-full">
                  {paidPlans.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => setSelectedTier(p.name)}
                      className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                        activePaidPlan.name === p.name
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p.displayName}
                      {p.name === 'pro' && <span className="ml-1 text-amber-400">*</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {paidPlans.some(p => p.name === 'pro') && <><span className="text-amber-400">*</span> Most popular with established contractors</>}
                </p>

                <p className="text-sm mt-4 text-slate-400">{activePaidPlan.description}</p>

                <div className="mt-5 mb-1">
                  <span className="text-3xl font-bold tabular-nums text-white">Custom</span>
                  <p className="text-xs mt-1.5 text-slate-400">Quoted to your team size &amp; usage</p>
                </div>

                {userPlan === activePaidPlan.name ? (
                  <div className="w-full mt-6 px-4 py-3 rounded-xl font-semibold text-center text-sm bg-emerald-500/15 text-emerald-400">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(activePaidPlan)}
                    className="w-full mt-6 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-white text-slate-900 hover:bg-slate-100"
                  >
                    Contact Us
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-7 sm:p-8 pt-5 border-t border-white/10 mt-6">
                <p className="text-xs font-bold uppercase tracking-wide mb-3.5 text-slate-400">
                  What's included in {activePaidPlan.displayName}
                </p>
                <ul className="space-y-2.5">
                  {activePaidPlan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm">
                      {feature.included ? (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-emerald-500/20">
                          <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3.5} />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/5">
                          <X className="w-2.5 h-2.5 text-slate-600" strokeWidth={3.5} />
                        </span>
                      )}
                      <span className={feature.included ? 'text-slate-200' : 'text-slate-600'}>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 sm:mt-20 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
            Trusted by federal contractors nationwide
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-xs sm:text-sm font-medium">
                <Icon className="w-3.5 h-3.5 text-indigo-500" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
