// frontend/src/pages/Pricing.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { paymentAPI } from '../services/api';
import SEOHead from '../components/SEOHead';

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
  // custom-quoted, sales-assisted plan now — a real person reviews the
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

  const getButtonStyle = (plan) => {
    if (plan.name === 'free') {
      return 'bg-amber-500 text-white hover:bg-amber-600';
    }
    if (plan.popular) {
      return 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg';
    }
    return 'bg-white text-gray-700 border-2 border-gray-200 hover:border-indigo-600 hover:text-indigo-600';
  };

  if (loading || plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Sort plans by order
  const sortedPlans = [...plans].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 sm:py-12 md:py-16">
      <SEOHead
        title="Pricing | Federal Contract Alert Plans"
        description="Start free with Sambid's AI-powered federal contract matching — no credit card required. Starter, Pro, and Enterprise plans are custom-quoted for your business; talk to our team to get set up."
        keywords="federal contracting software pricing, SAM.gov alert subscription, government contracting tool cost, federal opportunity tracker price, small business contracting plan, federal contract software cost, GovCon software pricing, best federal contracting tool price, SAM.gov alert service cost, government bid software plans, affordable federal contracting software"
        canonical="https://sambid.co/pricing"
      />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Plans Built Around Your Business
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Start free, no credit card required. Starter, Pro, and Enterprise are priced to your team's real usage —
            tell us about your business and we'll get you a plan and a quote within 1 business day.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 sm:gap-4 mt-6 sm:mt-8 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs text-green-600 font-semibold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <h2 className="sr-only">Compare Sambid Federal Contracting Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {sortedPlans.map((plan) => (
            <div
              key={plan._id}
              className={`relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 ${
                plan.name === 'pro' ? 'ring-2 ring-indigo-500 shadow-md' : ''
              } ${!plan.isActive ? 'opacity-60' : ''}`}
            >
              {plan.name === 'pro' && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">{plan.displayName}</h3>
                  {plan.name === 'free' && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      5-Day Trial
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-1">{plan.description}</p>

                <div className="mt-4">
                  <div className="flex items-end gap-1 flex-wrap">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.name === 'free' ? 'Free' : 'Custom Pricing'}
                    </span>
                  </div>
                  {isContactOnly(plan) && (
                    <p className="text-xs text-gray-400 mt-1.5">Quoted to your team size &amp; usage</p>
                  )}
                </div>

                {userPlan === plan.name ? (
                  <div className="w-full mt-6 px-4 py-2.5 rounded-lg font-medium text-center bg-green-100 text-green-700">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full mt-6 px-4 py-2.5 rounded-lg font-medium transition-all ${getButtonStyle(plan)}`}
                  >
                    {plan.name === 'free' ? 'Start Free Trial' : 'Contact Us'}
                  </button>
                )}
              </div>

              <div className="border-t border-gray-100 p-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                <ul className="space-y-2">
                  {plan.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-600' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Trusted by federal contractors nationwide</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 opacity-60">
            {['✓ Secure Payments', '✓ 24/7 Support', '✓ Cancel Anytime', '✓ No Hidden Fees'].map(b => (
              <span key={b} className="text-xs sm:text-sm text-gray-500 font-semibold">{b}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
