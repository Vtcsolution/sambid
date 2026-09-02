// frontend/src/pages/Pricing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, Zap, Rocket, Sparkles, Building2, ArrowRight, ShieldCheck, Headset, XCircle, ReceiptText } from 'lucide-react';
import { paymentAPI } from '../services/api';
import SEOHead from '../components/SEOHead';

// Visual identity per tier - icon, accent color, and card treatment. Purely
// presentational, keyed off the same plan.name the backend already uses.
const TIER_STYLE = {
  free:       { icon: Zap,       accent: 'amber'  },
  starter:    { icon: Rocket,    accent: 'blue'   },
  pro:        { icon: Sparkles,  accent: 'indigo' },
  enterprise: { icon: Building2, accent: 'slate'  },
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
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Every paid tier (Starter/Pro/Enterprise, any billing cycle) is a
  // custom-quoted, sales-assisted plan now - a real person reviews the
  // request and activates the account, rather than a number on this page
  // and a self-serve checkout. Only the free trial stays instant/no-card.
  const isContactOnly = (plan) => plan.name !== 'free';

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

  // Sort plans by order
  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);

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
            After that, Starter, Pro, and Enterprise are priced to your team's real usage, tell us about your
            business and we'll get you a plan and a quote within 1 business day.
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

        {/* Pricing Cards */}
        <h2 className="sr-only">Compare Sambid Federal Contracting Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
          {sortedPlans.map((plan) => {
            const style = TIER_STYLE[plan.name] || TIER_STYLE.starter;
            const Icon = style.icon;
            const isPopular = plan.name === 'pro';
            const isEnterprise = plan.name === 'enterprise';
            const isCurrent = userPlan === plan.name;

            return (
              <div
                key={plan._id}
                className={`relative rounded-3xl transition-all duration-300 flex flex-col ${!plan.isActive ? 'opacity-60' : ''} ${
                  isEnterprise
                    ? 'bg-slate-900 shadow-xl shadow-slate-900/20'
                    : isPopular
                      ? 'bg-white shadow-xl shadow-indigo-200/60 ring-2 ring-indigo-500 lg:-translate-y-2'
                      : 'bg-white shadow-sm hover:shadow-lg border border-slate-100'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`p-6 sm:p-7 ${isPopular ? 'pt-8' : ''}`}>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${
                    isEnterprise ? 'bg-white/10' :
                    style.accent === 'amber'  ? 'bg-amber-50'  :
                    style.accent === 'blue'   ? 'bg-blue-50'   :
                    'bg-indigo-50'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      isEnterprise ? 'text-white' :
                      style.accent === 'amber'  ? 'text-amber-600' :
                      style.accent === 'blue'   ? 'text-blue-600'  :
                      'text-indigo-600'
                    }`} />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-lg font-bold ${isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                      {plan.displayName}
                    </h3>
                    {plan.name === 'free' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
                        <Sparkles className="w-2.5 h-2.5" />
                        7 days free
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1.5 leading-relaxed ${isEnterprise ? 'text-slate-400' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mt-5 mb-1">
                    <span className={`text-2xl sm:text-[28px] font-bold tabular-nums ${isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name === 'free' ? 'Free' : 'Custom'}
                    </span>
                    <p className={`text-xs mt-1.5 ${isEnterprise ? 'text-slate-400' : 'text-slate-400'}`}>
                      {isContactOnly(plan) ? 'Quoted to your team size & usage' : 'Then a standard 5-day trial'}
                    </p>
                  </div>

                  {isCurrent ? (
                    <div className={`w-full mt-5 px-4 py-3 rounded-xl font-semibold text-center text-sm ${
                      isEnterprise ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      Current Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      className={`w-full mt-5 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        plan.name === 'free'
                          ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/30'
                          : isPopular
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-500/30'
                            : isEnterprise
                              ? 'bg-white text-slate-900 hover:bg-slate-100'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      {plan.name === 'free' ? 'Start Free Trial' : 'Contact Us'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className={`p-6 sm:p-7 pt-5 border-t ${isEnterprise ? 'border-white/10' : 'border-slate-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-3.5 ${isEnterprise ? 'text-slate-400' : 'text-slate-400'}`}>
                    What's included
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features?.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        {feature.included ? (
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isEnterprise ? 'bg-emerald-500/20' : 'bg-emerald-50'
                          }`}>
                            <Check className={`w-2.5 h-2.5 ${isEnterprise ? 'text-emerald-400' : 'text-emerald-600'}`} strokeWidth={3.5} />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-slate-100">
                            <X className="w-2.5 h-2.5 text-slate-300" strokeWidth={3.5} />
                          </span>
                        )}
                        <span className={feature.included ? (isEnterprise ? 'text-slate-200' : 'text-slate-700') : 'text-slate-300'}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
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
