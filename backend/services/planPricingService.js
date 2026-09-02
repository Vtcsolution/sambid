// Single source of truth for plan prices across the whole backend.
// Everything that mentions a price - the AI chatbot, email templates,
// prospect outreach, enterprise inquiry replies - reads from here, and this
// reads from the Plan collection (which the admin edits in Plan Pricing).
// Never hardcode a dollar amount in a template again: use price()/pricingLine().
//
// The cache refreshes on server start and every 5 minutes, so admin price
// changes propagate everywhere within minutes without a restart. Sync
// accessors (price, priceNum) let plain template-literal builders use live
// prices without becoming async.
import Plan from '../models/Plan.js';

const cache = {
  // fallbacks only used until the first successful DB load
  starter:    { monthly: 49,  yearly: 470,  displayName: 'Starter' },
  pro:        { monthly: 99,  yearly: 950,  displayName: 'Pro' },
  enterprise: { monthly: 499, yearly: 4788, displayName: 'Enterprise' },
};

export const refreshPlanPrices = async () => {
  try {
    const plans = await Plan.find({ name: { $in: ['starter', 'pro', 'enterprise'] } })
      .select('name priceMonthly priceYearly displayName')
      .lean();
    for (const p of plans) {
      if (!cache[p.name]) continue;
      if (p.priceMonthly != null) cache[p.name].monthly = p.priceMonthly;
      if (p.priceYearly  != null) cache[p.name].yearly  = p.priceYearly;
      if (p.displayName)          cache[p.name].displayName = p.displayName;
    }
  } catch (err) {
    console.warn('planPricingService refresh failed (using cached prices):', err.message);
  }
};

// kick off the first load and refresh every 5 minutes
refreshPlanPrices();
setInterval(refreshPlanPrices, 5 * 60 * 1000).unref?.();

// "$99" - number formatted with thousands separators
export const price = (plan, cycle = 'monthly') => {
  const v = cache[plan]?.[cycle];
  return v != null ? `$${Number(v).toLocaleString()}` : '$ - ';
};

export const priceNum = (plan, cycle = 'monthly') => cache[plan]?.[cycle] ?? null;

// One-line summary for AI prompts and plan lists:
// "Starter $49/mo ($470/yr), Pro $99/mo ($950/yr), Enterprise $499/mo ($4,788/yr)"
export const pricingLine = () =>
  ['starter', 'pro', 'enterprise']
    .map(p => `${cache[p].displayName} ${price(p)}/mo (${price(p, 'yearly')}/yr)`)
    .join(', ');
