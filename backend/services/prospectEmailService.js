// backend/services/prospectEmailService.js
import { randomBytes } from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { price, priceNum, pricingLine } from './planPricingService.js';
// Reuse the one real SMTP transporter (services/emailService.js) instead of a
// second definition — that copy only read EMAIL_* env vars, never the SMTP_*
// names the admin Settings > Email/SMTP panel actually writes to, so every
// prospect/company outreach email silently authenticated with undefined
// credentials whenever only SMTP_* was set.
import { transporter } from './emailService.js';

const PLATFORM_URL  = process.env.FRONTEND_URL  || 'https://sambid.co';
// For tracking pixels/clicks: must be a publicly reachable URL.
// In production = same as PLATFORM_URL (backend served at same domain).
// For local testing = set TRACK_BASE_URL to your ngrok URL, e.g. https://abc.ngrok.io
const TRACK_BASE_URL = process.env.TRACK_BASE_URL || PLATFORM_URL;
const PLATFORM_NAME = 'Sambid';
const PLATFORM_TAGLINE = 'Federal Contract Intelligence';
const FROM_NAME = `${PLATFORM_NAME} Team`;

// ── Shared HTML helpers ───────────────────────────────────────────────────────

const LOGO_URL = `${PLATFORM_URL}/apple-touch-icon.png`;

const header = () => `
  <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
    <img src="${LOGO_URL}" width="48" height="48" alt="${PLATFORM_NAME}" style="display:block;margin:0 auto 10px;border-radius:12px;" />
    <h1 style="margin:0;color:#fff;font-size:22px;font-family:Arial,sans-serif;font-weight:800;letter-spacing:-0.5px;">${PLATFORM_NAME}</h1>
    <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px;font-family:Arial,sans-serif;">${PLATFORM_TAGLINE}</p>
  </div>`;

const footer = () => `
  <div style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;border-radius:0 0 12px 12px;text-align:center;">
    <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;color:#6b7280;">
      <a href="${PLATFORM_URL}" style="color:#4f46e5;text-decoration:none;font-weight:600;">${PLATFORM_NAME}</a>
      &nbsp;·&nbsp; Federal Contract Intelligence
    </p>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;">
      You're receiving this because your company appears in the federal contracting database.
      <a href="${PLATFORM_URL}/unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </div>`;

const cta = (text, url = PLATFORM_URL) => `
  <div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;letter-spacing:0.2px;">
      ${text}
    </a>
  </div>`;

const wrap = (innerHtml) => `
<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f3f4f6;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
    ${header()}
    <div style="padding:32px 32px 24px;font-family:Arial,sans-serif;color:#1f2937;">
      ${innerHtml}
    </div>
    ${footer()}
  </div>
</body></html>`;

const p  = (text) => `<p style="margin:0 0 16px;line-height:1.7;font-size:15px;color:#374151;">${text}</p>`;
const h2 = (text) => `<h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:#111827;">${text}</h2>`;
const ul = (items) => `<ul style="margin:0 0 16px;padding-left:20px;">${items.map(i => `<li style="margin-bottom:8px;line-height:1.6;font-size:15px;color:#374151;">${i}</li>`).join('')}</ul>`;
const highlight = (text) => `<span style="background:#ede9fe;color:#5b21b6;padding:2px 8px;border-radius:4px;font-weight:600;">${text}</span>`;
const divider  = () => `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">`;

// ── 10 Email Templates ────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES = {

  // 1. Warm Introduction
  intro: {
    id: 'intro',
    name: 'Platform Introduction',
    category: 'Awareness',
    subject: 'Discover federal contracts matched to {{companyName}}',
    preview: 'Stop missing out on contracts that are perfect for your business.',
    buildHtml: (v) => wrap(`
      ${h2(`Hi${v.contact ? ` ${v.contact}` : ''}, federal contracts are waiting for ${v.company}.`)}
      ${p(`We noticed that <strong>${v.company}</strong> has an active track record in federal contracting. We built ${PLATFORM_NAME} specifically for companies like yours — to make sure you never miss a relevant opportunity.`)}
      ${p(`${PLATFORM_NAME} is an AI-powered federal contract intelligence platform that monitors SAM.gov, USASpending.gov, and FPDS in real-time — then alerts you the moment a matching opportunity is posted.`)}
      ${p(`Here's what sets us apart:`)}
      ${ul([
        `<strong>AI-powered matching</strong> — your NAICS codes, past award history, and certifications drive every alert`,
        `<strong>Real-time SAM.gov notifications</strong> — know about solicitations before your competitors`,
        `<strong>Competitor tracking</strong> — see who's winning in your NAICS space and for how much`,
        `<strong>All tiers covered</strong> — from micro-purchases to IDIQ task orders`,
      ])}
      ${cta(`Explore ${PLATFORM_NAME} Free →`, `${PLATFORM_URL}?utm_source=outreach&utm_campaign=intro`)}
      ${p(`No credit card required for your free trial. Setup takes under 5 minutes.`)}
      ${p(`Best regards,<br><strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 2. Feature Showcase
  features: {
    id: 'features',
    name: 'Feature Showcase',
    category: 'Education',
    subject: '5 features that help {{companyName}} win more federal contracts',
    preview: 'AI matching, live SAM.gov alerts, competitor intel, and more.',
    buildHtml: (v) => wrap(`
      ${h2(`What ${PLATFORM_NAME} does for contractors like ${v.company}`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, federal contracting is competitive — and staying on top of opportunities manually is a full-time job. ${PLATFORM_NAME} automates the intelligence so your team can focus on winning.`)}
      ${divider()}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${[
          ['🎯 AI Opportunity Matching', `Trained on your NAICS codes, certifications (8a, WOSB, SDVOSB, HUBZone), and award history to surface only the most relevant opportunities.`],
          ['⚡ Instant SAM.gov Alerts', `Email + in-app notifications the moment a solicitation, pre-solicitation, or sources-sought notice matches your profile.`],
          ['📊 Competitor Intelligence', `See which companies are winning contracts in your space, what prices they're bidding, and which agencies are spending the most.`],
          ['🤝 Teaming Partner Finder', `Find qualified teaming partners with complementary certifications for set-aside opportunities you can't pursue alone.`],
          ['📁 Proposal Workspace', `Organize active opportunities, set bid/no-bid deadlines, attach documents, and track your pipeline — all in one place.`],
        ].map(([feat, desc]) => `
          <tr>
            <td style="padding:12px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin-bottom:8px;vertical-align:top;width:100%;">
              <strong style="display:block;font-size:14px;color:#111827;margin-bottom:4px;">${feat}</strong>
              <span style="font-size:14px;color:#6b7280;line-height:1.5;">${desc}</span>
            </td>
          </tr>
          <tr><td style="height:8px;"></td></tr>
        `).join('')}
      </table>
      ${cta(`See All Features → Start Free`, `${PLATFORM_URL}/features?utm_source=outreach&utm_campaign=features`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 3. Competitor Comparison
  competitor: {
    id: 'competitor',
    name: 'Competitor Comparison',
    category: 'Consideration',
    subject: 'Why contractors are switching from GovWin to {{companyName}}\'s new platform',
    preview: 'Sambid vs GovWin IQ, Deltek, and USASpending — an honest comparison.',
    buildHtml: (v) => wrap(`
      ${h2(`Still paying $1,500/month for GovWin? There's a better option for ${v.company}.`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, tools like GovWin IQ and Deltek were built for large prime contractors with dedicated business development teams. ${PLATFORM_NAME} was built for every contractor — including growing companies like ${v.company}.`)}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;font-size:13px;">
        <thead>
          <tr style="background:#4f46e5;color:#fff;">
            <th style="padding:10px 14px;text-align:left;border-radius:8px 0 0 0;">Feature</th>
            <th style="padding:10px 14px;text-align:center;">GovWin / Deltek</th>
            <th style="padding:10px 14px;text-align:center;border-radius:0 8px 0 0;">${PLATFORM_NAME} ✓</th>
          </tr>
        </thead>
        <tbody>
          ${[
            ['Real-time SAM.gov alerts', '❌ Daily digest only', '✅ Instant notifications'],
            ['AI NAICS-based matching', '⚠️ Keyword only', '✅ AI + award history'],
            ['Pricing', '❌ $800–$2,500/mo', `✅ From ${price('starter')}/mo`],
            ['Teaming partner finder', '❌ Not included', '✅ Built in'],
            ['Small business set-aside focus', '⚠️ Limited', '✅ Full support'],
            ['Setup time', '⚠️ 2–4 weeks', '✅ Under 5 minutes'],
          ].map(([feat, col1, col2], i) => `
            <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
              <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">${feat}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">${col1}</td>
              <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;color:#059669;font-weight:600;">${col2}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ${cta(`Switch to ${PLATFORM_NAME} — First Month Free`, `${PLATFORM_URL}/pricing?utm_source=outreach&utm_campaign=competitor`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 4. ROI & Success Stories
  roi: {
    id: 'roi',
    name: 'ROI & Success Stories',
    category: 'Social Proof',
    subject: 'How contractors like {{companyName}} win 40% more contracts',
    preview: 'Real results from federal contractors using Sambid.',
    buildHtml: (v) => wrap(`
      ${h2(`The ROI numbers behind ${PLATFORM_NAME} for ${v.company}`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, we know you evaluate every tool by the return it delivers. Here's what contractors on ${PLATFORM_NAME} are reporting:`)}
      <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
        ${[
          ['40%', 'more relevant opportunities identified per month'],
          ['3×', 'faster solicitation discovery vs manual SAM.gov searches'],
          ['$180K', 'average additional annual contract revenue reported by Pro users'],
        ].map(([stat, desc]) => `
          <div style="flex:1;min-width:150px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);border:1px solid #c4b5fd;border-radius:10px;padding:16px;text-align:center;">
            <div style="font-size:28px;font-weight:900;color:#4f46e5;">${stat}</div>
            <div style="font-size:12px;color:#5b21b6;line-height:1.4;margin-top:4px;">${desc}</div>
          </div>
        `).join('')}
      </div>
      ${divider()}
      ${p(`<em>"Before ${PLATFORM_NAME}, our BD team spent 8 hours a week just monitoring SAM.gov. Now we get a 7am digest with every matching opportunity — we've added two new agency relationships in 6 months."</em><br><strong>— 8(a) Construction Firm, Texas</strong>`)}
      ${divider()}
      ${p(`<em>"The competitor intelligence feature alone paid for the subscription in the first quarter. We finally understood why we were losing and adjusted our pricing strategy."</em><br><strong>— IT Services Contractor, Virginia</strong>`)}
      ${cta(`Calculate Your ROI → Start Free Trial`, `${PLATFORM_URL}/roi?utm_source=outreach&utm_campaign=roi`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 5. Free Trial Offer
  freetrial: {
    id: 'freetrial',
    name: 'Free Trial Offer',
    category: 'Conversion',
    subject: '{{companyName}}: 3 days of federal contract intelligence, on us',
    preview: 'No credit card. No commitment. Full Pro access for 3 days.',
    buildHtml: (v) => wrap(`
      ${h2(`${v.company} — your free 3-day Pro trial is reserved.`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, we'd like to offer <strong>${v.company}</strong> a full ${highlight('3-day Pro trial')} of ${PLATFORM_NAME} — no credit card required.`)}
      ${p(`During your trial you'll have complete access to:`)}
      ${ul([
        `Unlimited AI-matched opportunity alerts for your NAICS codes`,
        `Real-time SAM.gov, USASpending.gov, and FPDS monitoring`,
        `Full competitor intelligence dashboard`,
        `Teaming partner finder`,
        `Proposal pipeline workspace`,
        `Dedicated onboarding support`,
      ])}
      ${divider()}
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#854d0e;">
          ⏰ <strong>This offer is available for the next 3 days.</strong> After that, trial access reverts to the free tier (5 alerts/month).
        </p>
      </div>
      ${cta(`Claim My Free 14-Day Pro Trial`, `${PLATFORM_URL}/trial?utm_source=outreach&utm_campaign=freetrial`)}
      ${p(`Questions? Reply to this email and our team will get back to you within a few hours.`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 6. Custom Pricing Quote
  pricing: {
    id: 'pricing',
    name: 'Pricing & Plans',
    category: 'Conversion',
    // getter → evaluated on access, so it always uses LIVE DB prices
    get subject() { return `Custom pricing for {{companyName}} — starting at ${price('starter')}/month`; },
    preview: 'Transparent, contractor-friendly plans with no long-term contracts.',
    buildHtml: (v) => wrap(`
      ${h2(`${PLATFORM_NAME} pricing built for contractors like ${v.company}`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, we keep our pricing simple and transparent — no per-seat fees, no hidden costs, no 12-month lock-ins.`)}
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        ${[
          ['Starter', `${price('starter')}/mo`, ['25 AI-matched alerts/month', 'SAM.gov monitoring', 'Basic competitor view', 'Email support'], false],
          ['Pro', `${price('pro')}/mo`, ['Unlimited alerts', 'Real-time SAM.gov + FPDS + USASpending', 'Full competitor intelligence', 'Teaming partner finder', 'Proposal pipeline', 'Priority support'], true],
          ['Enterprise', `${price('enterprise')}/mo · ${price('enterprise', 'yearly')}/yr`, ['Everything in Pro', 'Multi-user team access', 'API data export', 'Custom NAICS watchlists', 'Dedicated account manager', 'White-glove onboarding'], false],
        ].map(([plan, price, feats, recommended]) => `
          <tr>
            <td style="padding:0;padding-bottom:12px;">
              <div style="border:${recommended ? '2px solid #4f46e5' : '1px solid #e5e7eb'};border-radius:10px;padding:18px;background:${recommended ? '#faf5ff' : '#fff'};">
                ${recommended ? `<div style="display:inline-block;background:#4f46e5;color:#fff;font-size:11px;font-weight:700;padding:2px 10px;border-radius:100px;margin-bottom:8px;">MOST POPULAR</div>` : ''}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                  <strong style="font-size:16px;color:#111827;">${plan}</strong>
                  <span style="font-size:18px;font-weight:900;color:#4f46e5;">${price}</span>
                </div>
                <ul style="margin:0;padding-left:18px;">${feats.map(f => `<li style="font-size:13px;color:#4b5563;margin-bottom:4px;">${f}</li>`).join('')}</ul>
              </div>
            </td>
          </tr>
        `).join('')}
      </table>
      ${cta(`Start Free — Upgrade Anytime`, `${PLATFORM_URL}/pricing?utm_source=outreach&utm_campaign=pricing`)}
      ${p(`All plans come with a <strong>3-day free trial</strong>. Cancel anytime.`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 7. Government Contracting Tips
  tips: {
    id: 'tips',
    name: 'Government Contracting Tips',
    category: 'Value-Add',
    subject: '5 federal contracting tips every contractor needs in 2025',
    preview: 'Practical tips to win more federal contracts — from our research team.',
    buildHtml: (v) => wrap(`
      ${h2(`5 tips to win more federal contracts in 2025`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, we've analyzed tens of thousands of federal contract awards. Here's what separates the contractors who consistently win from those who don't:`)}
      ${[
        ['Monitor pre-solicitations, not just solicitations', `Most companies start reading when the solicitation drops — but the real opportunity is in pre-solicitations and sources-sought notices. Responding to those puts you on the agency's radar before the formal RFP is even written.`],
        ['Use past performance strategically', `Agencies score past performance heavily. Build a database of your award history with NAICS codes, agency names, and dollar amounts — and reference it explicitly in every proposal.`],
        ['Target your top 3 agencies, not every agency', `It's better to have three agency relationships where you understand the people, priorities, and procurement cycles than to spray-and-pray across 20 agencies.`],
        ['Leverage set-asides before you outgrow them', `If your business qualifies for 8(a), WOSB, HUBZone, or SDVOSB set-asides, prioritize those pipelines now. Many contractors wait too long and age out of the programs.`],
        ['Debrief every loss', `Agencies are required to debrief you on why you didn't win. Most contractors skip this — don't. The feedback is gold and directly improves your next proposal.`],
      ].map(([title, body], i) => `
        <div style="margin-bottom:20px;padding:16px;background:#f9fafb;border-left:4px solid #4f46e5;border-radius:0 8px 8px 0;">
          <strong style="display:block;font-size:14px;color:#111827;margin-bottom:6px;">${i + 1}. ${title}</strong>
          <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">${body}</p>
        </div>
      `).join('')}
      ${p(`${PLATFORM_NAME} automates points 1 and 2 for ${v.company} — real-time alerts on pre-solicitations and an auto-generated past-performance summary from your USASpending history.`)}
      ${cta(`See How It Works — Free Trial`, `${PLATFORM_URL}?utm_source=outreach&utm_campaign=tips`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 8. Teaming & Partnership
  teaming: {
    id: 'teaming',
    name: 'Teaming & Partnership',
    category: 'Feature Highlight',
    subject: '{{companyName}}: Find the right teaming partners for set-aside contracts',
    preview: 'Sambid connects contractors for teaming on federal set-aside opportunities.',
    buildHtml: (v) => wrap(`
      ${h2(`${v.company} could be winning larger contracts through teaming`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, some of the most valuable federal opportunities require capabilities or certifications your company might not have alone — that's where teaming partnerships come in.`)}
      ${p(`${PLATFORM_NAME}'s Teaming Partner Finder connects you with pre-vetted contractors who have:`)}
      ${ul([
        `Complementary NAICS codes and past performance`,
        `8(a), WOSB, HUBZone, or SDVOSB certifications you may need`,
        `Geographic coverage for multi-region contracts`,
        `Cleared personnel for restricted opportunities`,
      ])}
      ${divider()}
      ${p(`Here's how it works for ${v.company}:`)}
      <div style="background:#f5f3ff;border:1px solid #c4b5fd;border-radius:8px;padding:20px;margin-bottom:24px;">
        <ol style="margin:0;padding-left:18px;font-size:14px;color:#4b5563;line-height:2;">
          <li>Enter your company profile and target opportunities</li>
          <li>${PLATFORM_NAME} surfaces compatible partners filtered by NAICS, certifications, and past performance</li>
          <li>Review their award history and capabilities before reaching out</li>
          <li>Connect directly through the platform</li>
        </ol>
      </div>
      ${cta(`Find Teaming Partners for ${v.company}`, `${PLATFORM_URL}/teaming?utm_source=outreach&utm_campaign=teaming`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 9. Follow-up (no response)
  followup: {
    id: 'followup',
    name: 'Gentle Follow-Up',
    category: 'Re-Engagement',
    subject: 'Re: federal contract opportunities for {{companyName}}',
    preview: 'Just wanted to make sure my earlier note didn\'t get lost.',
    buildHtml: (v) => wrap(`
      ${h2(`Following up — contracts are moving fast in ${v.state || 'your area'}`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, I wanted to make sure my earlier email didn't get lost in the noise.`)}
      ${p(`I reached out because <strong>${v.company}</strong> has an active federal contracting profile — and several matching solicitations have posted in the last 30 days that you may not have seen.`)}
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;margin-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#92400e;font-family:Arial,sans-serif;">
          📋 <strong>Recent matching opportunities:</strong> ${PLATFORM_NAME} found active solicitations in your NAICS category that close in the next 14–30 days.
        </p>
      </div>
      ${p(`If this isn't the right time or the right person, please let me know who handles business development at ${v.company} and I'll reach out directly.`)}
      ${p(`If you're open to it, a 15-minute demo would let me show you exactly which opportunities we're tracking for your profile — no pitch, just data.`)}
      ${cta(`Book a 15-Minute Demo`, `${PLATFORM_URL}/demo?utm_source=outreach&utm_campaign=followup`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },

  // 10. Limited Time Discount
  discount: {
    id: 'discount',
    name: 'Special Discount Offer',
    category: 'Promotion',
    subject: 'Exclusive: 40% off Sambid Pro for {{companyName}} — this week only',
    preview: '40% off your first 3 months. Offer expires Friday.',
    buildHtml: (v) => wrap(`
      ${h2(`Limited offer: 40% off ${PLATFORM_NAME} Pro for ${v.company}`)}
      ${p(`Hi${v.contact ? ` ${v.contact}` : ''}, we're extending an exclusive discount to select companies in the federal contracting space this week — and ${v.company} qualified.`)}
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="color:rgba(255,255,255,.8);font-size:13px;font-family:Arial,sans-serif;margin-bottom:4px;">Use code at checkout</div>
        <div style="color:#fff;font-size:32px;font-weight:900;font-family:monospace;letter-spacing:6px;background:rgba(255,255,255,.15);display:inline-block;padding:10px 24px;border-radius:8px;">FEDWIN40</div>
        <div style="color:rgba(255,255,255,.8);font-size:13px;font-family:Arial,sans-serif;margin-top:8px;">40% off your first 3 months on any paid plan</div>
      </div>
      ${p(`Here's what you get on the ${highlight('Pro plan')} (${price('pro')} → $${Math.round((priceNum('pro') || 0) * 0.6)}/month for 3 months):`)}
      ${ul([
        `Unlimited AI-matched federal contract alerts`,
        `Real-time monitoring across SAM.gov, FPDS, and USASpending.gov`,
        `Competitor intelligence — see who's winning and at what price`,
        `Teaming partner finder and proposal workspace`,
        `Priority onboarding support`,
      ])}
      <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:14px;margin-bottom:24px;text-align:center;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#991b1b;font-weight:600;">
          ⏳ Offer expires this Friday at midnight. Code: <span style="font-family:monospace;background:#fee2e2;padding:2px 8px;border-radius:4px;">FEDWIN40</span>
        </p>
      </div>
      ${cta(`Claim 40% Off — Apply Code FEDWIN40`, `${PLATFORM_URL}/pricing?code=FEDWIN40&utm_source=outreach&utm_campaign=discount`)}
      ${p(`<strong>The ${PLATFORM_NAME} Team</strong>`)}
    `),
  },
};

// ── Template list for API ─────────────────────────────────────────────────────

export const getTemplateList = () =>
  Object.values(EMAIL_TEMPLATES).map(({ id, name, category, subject, preview }) =>
    ({ id, name, category, subject, preview })
  );

// ── Render a template with company variables ──────────────────────────────────

export const renderTemplate = (templateId, prospect) => {
  const tpl = EMAIL_TEMPLATES[templateId];
  if (!tpl) throw new Error(`Unknown template: ${templateId}`);

  const vars = {
    company: prospect.companyName || 'your company',
    contact: prospect.contactPersonName || '',
    state:   prospect.state || '',
    naics:   prospect.naicsCode || '',
  };

  const replaceVars = (str) =>
    str
      .replace(/\{\{companyName\}\}/g, vars.company)
      .replace(/\{\{contactName\}\}/g, vars.contact)
      .replace(/\{\{state\}\}/g,       vars.state)
      .replace(/\{\{naicsCode\}\}/g,   vars.naics);

  return {
    subject: replaceVars(tpl.subject),
    html:    tpl.buildHtml(vars),
    templateName: tpl.name,
  };
};

// ── Send email to a single prospect ──────────────────────────────────────────

export const sendProspectEmail = async (prospect, templateId) => {
  const email = prospect.primaryEmail || (prospect.allEmails && prospect.allEmails[0]);
  if (!email) return { sent: false, reason: 'no_email' };

  const { subject, html, templateName } = renderTemplate(templateId, prospect);

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to:   email,
    subject,
    html,
  });

  return { sent: true, email, subject, templateName };
};

// ── Bulk send (static templates) ─────────────────────────────────────────────

export const sendBulkProspectEmails = async (prospects, templateId, sentBy = 'admin') => {
  const results = { sent: 0, failed: 0, noEmail: 0, errors: [] };

  for (const prospect of prospects) {
    try {
      const result = await sendProspectEmail(prospect, templateId);
      if (result.sent) {
        results.sent++;
        await prospect.constructor.findByIdAndUpdate(prospect._id, {
          $push: {
            emailHistory: {
              templateId,
              templateName: result.templateName,
              subject:      result.subject,
              sentAt:       new Date(),
              sentBy,
            },
          },
          $set: { contacted: true, contactedDate: new Date(), contactedBy: sentBy },
        });
      } else {
        results.noEmail++;
      }
    } catch (err) {
      results.failed++;
      results.errors.push({ id: prospect._id, name: prospect.companyName, error: err.message });
    }
  }

  return results;
};

// ── AI Email Generation ───────────────────────────────────────────────────────

// Every type shares the same funnel logic (see SHARED_STRATEGY in the
// prompt below): congrats hook -> one real pain point -> free-account CTA.
// What differs per type is ONLY the specific angle/content of the body.
const TYPE_CONTEXT = {
  intro:      'ANGLE: general platform introduction. Pivot from the congrats hook to ONE specific, surprising pain point: a Contracting Officer can list an opportunity under the wrong NAICS code by mistake, and it becomes invisible to every company searching correctly — real dollars lost to a data-entry error, not a capability gap. Bullets: automated SAM.gov monitoring that catches miscoded listings, past performance auto-matched into new proposals, AI-drafted compliant proposals in minutes, incumbent/competitor intel before committing budget, a fast data-backed Go/No-Go decision.',
  features:   'ANGLE: a quick tour of what they would actually see the moment they open a free account, not a spec sheet. Bullets: AI opportunity matching scored against their real NAICS codes and past wins, real-time SAM.gov alerts the second a match posts, competitor intelligence showing who actually won similar contracts and at what price, an AI proposal builder that drafts a compliant draft in minutes, a Go/No-Go score backed by real award data instead of gut feel. Frame it as "this is what your dashboard looks like on day one."',
  // getters → evaluated on access with LIVE DB prices, not baked at import
  get competitor() { return `ANGLE: comparison to GovWin IQ / Deltek, for a company that may already be paying for one. Bullets: Sambid runs ${price('starter')}–${price('pro')}/mo vs $800–2,500/mo for the incumbents, 5-minute setup vs 2-4 week onboarding, AI matching against real NAICS + past-performance data vs plain keyword search, includes AI proposal drafting and Go/No-Go scoring that the older tools don't have at any price. Frame the free account as a zero-risk way to compare it directly against what they use today.`; },
  campaign:   "ANGLE: scaling a BD campaign without scaling headcount, aimed at a company that's clearly already winning and likely growing its pipeline. Bullets: automated discovery finds more matching opportunities than a team monitoring SAM.gov manually ever will, Sources Sought responses get you on an agency's radar before the RFP is even written, competitor tracking shows who's winning in your space and at what price before you commit budget, a shared pipeline view keeps deadlines and stages visible across the whole team without a spreadsheet.",
  get cost() { return `ANGLE: the math, for a company that's likely paying real money for BD today, either in tools or in headcount hours. Bullets: a human proposal writer costs $5,000-$50,000 per proposal, Sambid's AI drafts one in minutes for a fraction of that; competitor tools like GovWin/Deltek run $800-2,500/mo, Sambid starts at ${price('starter')}/mo; manual SAM.gov monitoring burns 6-10 hours a week of BD time that gets fully automated. Do the annual math plainly, then invite them to see it for themselves in a free account before ever entering a card number.`; },
  time:       "ANGLE: hours back in the week, for a team that's clearly busy given their win volume. Bullets: manual SAM.gov monitoring (6-10 hrs/week for most teams) becomes fully automated, a proposal draft that used to take days comes back in minutes, deadline tracking across a shared calendar replaces someone manually updating a spreadsheet, competitor research that used to mean digging through USASpending.gov by hand is instant. Make the point that this time goes straight back into writing better proposals, not spent finding them.",
  trial:      'ANGLE: a direct, low-friction invitation to open a free account right now (this platform\'s free tier has no card required and no time limit, so do not invent urgency or a countdown that isn\'t real). Bullets: what unlocks the moment they sign up, matched opportunities for their real NAICS codes, the AI tools available to test immediately, and that upgrading only ever happens by their own choice once they see real value inside.',
  get pricing() { return `ANGLE: transparent pricing for a company that wants to know the number before clicking anything. State plainly: ${pricingLine()}. Bullets: what's included at each tier, that the free account has no card requirement and no expiration, and that the honest recommendation is to start free, see real matches for their NAICS codes, and only upgrade once the value is obvious from inside the platform, not from a sales email.`; },
  success:    'ANGLE: real numbers from contractors using the platform today. Bullets: 40% more relevant opportunities identified per month vs manual SAM.gov monitoring, 3x faster solicitation discovery, 8+ hours per week saved on BD research, an average of $180K in additional annual contract revenue reported by Pro users. Include one short, specific one-line quote from a real user type (e.g. an 8(a) construction firm or an IT services contractor) if it fits naturally. Frame the free account as the only way to find out if they would see similar numbers.',
  followup:   "ANGLE: a brief, low-pressure follow-up to someone who didn't respond to an earlier email. Keep it short — 3 short paragraphs plus 2-3 bullets at most, not the full pitch again. Acknowledge inboxes get busy, briefly remind them of the core value (matched contracts they're not currently seeing, or a specific pain point), and make the free-account signup the entire ask, nothing else.",
};

export const EMAIL_TYPE_LIST = [
  { id: 'intro',      label: 'Platform Intro',    emoji: '👋', color: 'blue'   },
  { id: 'features',   label: 'Key Features',       emoji: '⚡', color: 'cyan'   },
  { id: 'competitor', label: 'vs Competitors',      emoji: '🏆', color: 'amber'  },
  { id: 'campaign',   label: 'Win Campaign',        emoji: '🎯', color: 'violet' },
  { id: 'cost',       label: 'Cost Saving',         emoji: '💰', color: 'green'  },
  { id: 'time',       label: 'Time Saving',         emoji: '⏱️', color: 'teal'   },
  { id: 'trial',      label: 'Free Trial',          emoji: '🎁', color: 'rose'   },
  { id: 'pricing',    label: 'Pricing & Plans',     emoji: '📋', color: 'orange' },
  { id: 'success',    label: 'Success Stories',     emoji: '✅', color: 'emerald'},
  { id: 'followup',   label: 'Follow Up',           emoji: '🔁', color: 'indigo' },
];

const fmtAmount = (n) => {
  const v = Number(n) || 0;
  return v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : v ? `$${v}` : 'unknown amount';
};

// ── Static fallback templates (used when no AI key is available) ──────────────

// Shared congrats hook — every template opens with this, personalized off
// their real win history when we have it, so it never reads like a mass blast.
const buildCongrats = (v) => {
  const hasWins = Number(v.contracts) > 0;
  return hasWins
    ? `Congrats on ${v.company}'s ${v.contracts} contract win${v.contracts > 1 ? 's' : ''}${v.amount && v.amount !== 'unknown amount' ? ` worth ${v.amount}` : ''} — that track record already puts you ahead of most bidders.`
    : `Congrats on ${v.company}'s track record in federal contracting${v.state ? ` in ${v.state}` : ''} — that already puts you ahead of most bidders.`;
};

// Shared sign-off + free-account close — the ask is always the same: create
// a free account and explore it themselves, never "buy" from the email.
const buildClose = (line) => `${line} Free to explore, no credit card needed: ${PLATFORM_URL}\n\nZia\nFounder, Sambid\nsambid.co`;

const STATIC_TEMPLATES = {
  intro: (v) => {
    const congrats = buildCongrats(v);
    return {
      subject: `The $4B gap even proven contractors miss`,
      bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${congrats}\n\nOne thing that catches even experienced contractors: a Contracting Officer can list an opportunity under the wrong NAICS code by mistake, and it becomes invisible to every company searching correctly — regardless of how strong your team is. Real dollars lost to a data-entry error, not a capability gap.\n\nWe built Sambid to help proven contractors like ${v.company} win more, without scaling your BD team at the same rate as your pipeline:\n\n- Every SAM.gov listing monitored automatically, including the miscoded ones others miss\n- Your past performance auto-matched into every new proposal instantly\n- AI drafts a full compliant proposal in minutes — bid on more without more headcount\n- Know the incumbent's renewal history before committing budget to a bid\n- A data-backed Go/No-Go answer in 30 seconds, so more of what you chase is winnable\n\nWorth 10 minutes to see if it fits how you're scaling? Free to test, no credit card needed: ${PLATFORM_URL}\n\nZia\nFounder, Sambid\nsambid.co`,
    };
  },
  features: (v) => ({
    subject: `What ${v.company} would see inside Sambid on day one`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nI won't waste your time with a feature list — here's exactly what shows up on your dashboard the moment you open a free account:\n\n- Opportunities scored against your real NAICS codes and past performance, not just keyword matches\n- Real-time alerts the second a matching solicitation posts to SAM.gov\n- Competitor intelligence showing who actually won similar contracts, and at what price\n- An AI proposal builder that drafts a compliant first draft in minutes\n- A Go/No-Go score backed by real award data instead of a gut call\n\n${buildClose(`See it running against ${v.company}'s own NAICS codes, not a demo account.`)}`,
  }),
  competitor: (v) => ({
    subject: `${v.company}: a faster, cheaper alternative to GovWin IQ`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nIf ${v.company} is currently using or evaluating GovWin IQ or Deltek, here's the honest comparison:\n\n- Price: ${price('starter')}–${price('pro')}/mo vs $800–2,500/mo\n- Setup: 5 minutes vs 2-4 weeks of onboarding\n- Matching: real NAICS + past-performance data vs keyword search only\n- AI proposal drafting and Go/No-Go scoring — neither older tool has this at any price\n\n${buildClose(`Cheapest way to find out if it's actually better for you: put it side by side with what you use today.`)}`,
  }),
  campaign: (v) => ({
    subject: `Scaling ${v.company}'s BD without scaling headcount`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nGrowing a pipeline usually means growing a BD team to match it. Sambid is built so that doesn't have to be true:\n\n- Automated discovery finds more matching opportunities than manual SAM.gov monitoring ever will\n- Sources Sought responses get you on an agency's radar before the RFP is even written\n- Competitor tracking shows who's winning in your space, and at what price, before you commit budget\n- A shared pipeline view keeps every deadline and stage visible across the team, no spreadsheet\n\n${buildClose(`Worth seeing how it'd slot into how ${v.company} is scaling right now?`)}`,
  }),
  cost: (v) => ({
    subject: `${v.company}: the real math on BD costs`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nQuick math worth knowing:\n\n- A human proposal writer runs $5,000-$50,000 per proposal — Sambid's AI drafts one in minutes\n- Tools like GovWin/Deltek run $800-2,500/mo — Sambid starts at ${price('starter')}/mo\n- Manual SAM.gov monitoring burns 6-10 hours a week of BD time — fully automated here\n\nAdd that up over a year and it's real money, either spent or saved.\n\n${buildClose(`See the numbers for yourself before deciding anything.`)}`,
  }),
  time: (v) => ({
    subject: `${v.company}: get 6-10 hours a week back`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nMost teams at your stage spend 6-10 hours a week just monitoring SAM.gov manually. Here's what that time turns into with Sambid:\n\n- SAM.gov monitoring — fully automated, zero manual searching\n- Proposal drafts that took days now come back in minutes\n- Deadline tracking on a shared calendar instead of a spreadsheet someone has to update\n- Competitor research that used to mean digging through USASpending.gov by hand — instant\n\nThat time goes straight back into writing better proposals, not finding them.\n\n${buildClose(`Free to test with your own NAICS codes.`)}`,
  }),
  trial: (v) => ({
    subject: `${v.company}: your free Sambid account is ready`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nI'd like to invite ${v.company} to create a free Sambid account — no credit card, no time limit, full access to test the platform against your real NAICS codes.\n\nThe moment you sign up you'll see:\n\n- Opportunities already matched to your industry, not a generic demo\n- The AI tools available to test immediately — summarize, proposal draft, Go/No-Go\n- Deadline tracking and alerts turned on from day one\n\nUpgrading only ever happens by your own choice, once you've seen real value inside. That's the whole idea.\n\n${buildClose(`Takes under 5 minutes to set up:`)}`,
  }),
  pricing: (v) => ({
    subject: `Sambid pricing for ${v.company} — starting at ${price('starter')}/month`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nSince pricing is usually the first real question, here it is plainly: ${pricingLine()}.\n\n- Every plan includes real-time SAM.gov monitoring and AI matching\n- Higher tiers add unlimited alerts, full competitor intelligence, and team access\n- The free account has no card requirement and no expiration — it's not a countdown trial\n\nHonest recommendation: start free, see real matches for your own NAICS codes, and only upgrade once the value is obvious from inside the platform — not from a pricing email.\n\n${buildClose(`See the plans and start free:`)}`,
  }),
  success: (v) => ({
    subject: `What contractors like ${v.company} see after switching to Sambid`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\n${buildCongrats(v)}\n\nA few real numbers from contractors already using Sambid:\n\n- 40% more relevant opportunities identified per month vs manual SAM.gov monitoring\n- 3x faster solicitation discovery\n- 8+ hours per week saved on BD research\n- $180K average additional annual contract revenue reported by Pro users\n\nOne 8(a) construction firm told us they added two new agency relationships in six months just from the pre-solicitation alerts.\n\n${buildClose(`The only way to know if ${v.company} would see similar numbers is to try it.`)}`,
  }),
  followup: (v) => ({
    subject: `Re: federal contract opportunities for ${v.company}`,
    bodyText: `Hi${v.contact ? ` ${v.contact}` : ''},\n\nI know inboxes get busy, so a quick follow-up.\n\nI reached out because ${v.company} has a track record worth building on${v.state ? ` in ${v.state}` : ''}, and I think Sambid could genuinely help you find more of it:\n\n- Contracts matched to your NAICS codes, found automatically, not manually\n- AI proposal drafts and a data-backed Go/No-Go call, ready when you need them\n\nIf now isn't the right time, no worries — just wanted to put it back on your radar.\n\n${buildClose(`Still free to create an account and take a look, no card, no pressure:`)}`,
  }),
};

// ── Build AI prompt ───────────────────────────────────────────────────────────

const buildPrompt = (templateType, prospectData) => {
  const typeCtx = TYPE_CONTEXT[templateType] || TYPE_CONTEXT.intro;
  const company    = prospectData.companyName || 'your company';
  const state      = prospectData.state   || '';
  const city       = prospectData.city    || '';
  const naics      = prospectData.naicsCode || '';
  const naicsDesc  = prospectData.naicsDescription || '';
  const contracts  = prospectData.totalContractsWon || 0;
  const amount     = fmtAmount(prospectData.totalAwardAmount);
  const contact    = prospectData.contactPersonName || '';
  const location   = [city, state].filter(Boolean).join(', ');

  return `You are a professional B2B copywriter writing a marketing email for Sambid (Federal Contract Intelligence Platform, ${PLATFORM_URL}).

RECIPIENT COMPANY:
- Name: ${company}
- Location: ${location || 'USA'}
- NAICS: ${naics}${naicsDesc ? ` — ${naicsDesc}` : ''}
- Federal contract history: ${contracts} contracts won, total ${amount}
${contact ? `- Contact: ${contact}` : ''}

PLATFORM (Sambid):
- AI-powered federal contract discovery platform
- Monitors SAM.gov, USASpending.gov, FPDS in real-time
- Features: AI NAICS matching, instant alerts, competitor intelligence, teaming finder, proposal workspace
- Plans: ${pricingLine()}
- Website: ${PLATFORM_URL}

EMAIL TYPE: ${templateType.toUpperCase()}
INSTRUCTIONS: ${typeCtx}

RULES:
- Under 250 words total
- Personalize using the company name and their contracting background — if they have real contract wins (contracts won / award amount above), open by congratulating them on that specific track record, don't skip straight to the pitch
- Be specific, direct, and human — not corporate-speak, and never sound like a mass blast
- Use 4-5 short one-line bullet points (starting with "- ") for the concrete benefits section — not a wall of paragraphs
- Bold the 1-2 most important phrases or numbers per paragraph using **double asterisks** (e.g. **$4.2M**, **1,000 daily matches**) — every email must have at least 3 bolded phrases total, this is required, not optional
- THE GOAL OF EVERY EMAIL IS THE SAME: get them to create a free account and explore the platform themselves with their own real NAICS codes and contract data. Never ask them to "buy," "upgrade," or "purchase a plan" in the email itself — the free account is the entire ask. They discover the value, and the case for a paid plan, once they're actually inside using it, not from the email.
- End with ONE soft, low-pressure call to action pointing to ${PLATFORM_URL} that frames it as free to explore, no credit card required — not "Sign up now!" or anything pushy
- Sign off as:\nZia\nFounder, Sambid\nsambid.co\n(not "Best regards, The Sambid Team")
- Plain text with basic markdown bullets ("- ") only — no HTML
- Separate paragraphs with a blank line

Return ONLY this JSON (no markdown wrapper, no extra text):
{"subject":"...","body":"..."}

The body value must be a single string with \\n\\n between paragraphs.`;
};

export const generateEmailWithAI = async (templateType, prospectData = {}) => {
  const v = {
    company:   prospectData.companyName || 'your company',
    contact:   prospectData.contactPersonName || '',
    state:     prospectData.state || '',
    contracts: prospectData.totalContractsWon || 0,
    amount:    fmtAmount(prospectData.totalAwardAmount),
  };

  const prompt = buildPrompt(templateType, prospectData);

  // ── 1. Try Gemini ──────────────────────────────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const raw = result.response.text().trim()
        .replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(raw);
      if (parsed.subject && parsed.body) {
        return { subject: parsed.subject, bodyText: parsed.body, source: 'gemini' };
      }
    } catch { /* fall through */ }
  }

  // ── 2. Try OpenAI ─────────────────────────────────────────────────────────
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const resp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const raw = (resp.choices[0]?.message?.content || '').trim()
        .replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(raw);
      if (parsed.subject && parsed.body) {
        return { subject: parsed.subject, bodyText: parsed.body, source: 'gpt' };
      }
    } catch { /* fall through */ }
  }

  // ── 3. Static fallback — always works, no API key needed ──────────────────
  const tplFn = STATIC_TEMPLATES[templateType] || STATIC_TEMPLATES.intro;
  const tpl   = tplFn(v);
  return { subject: tpl.subject, bodyText: tpl.bodyText, source: 'template' };
};

// ── Build HTML from plain text body ──────────────────────────────────────────

const BULLET_RE = /^[•\-*]\s+(.+)/;

const escapeBold = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

// A block renders as a real <ul> when every non-empty line in it is a bullet
// line — otherwise it's a normal paragraph. Keeps "- " lines from a
// generated email (AI or static template) from showing as literal dashes.
const renderBlock = (block) => {
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const allBullets = lines.length > 0 && lines.every(l => BULLET_RE.test(l));

  if (allBullets) {
    const items = lines
      .map(l => `<li style="margin:0 0 8px;line-height:1.6;font-size:15px;color:#374151;">${escapeBold(BULLET_RE.exec(l)[1])}</li>`)
      .join('');
    return `<ul style="margin:0 0 16px;padding-left:20px;">${items}</ul>`;
  }

  return `<p style="margin:0 0 16px;line-height:1.7;font-size:15px;color:#374151;">${escapeBold(block).replace(/\n/g, '<br>')}</p>`;
};

export const buildCustomEmailHtml = (bodyText, trackingId = null) => {
  const paragraphs = bodyText
    .split(/\n\n+/)
    .map(para => para.trim())
    .filter(Boolean)
    .map(renderBlock)
    .join('');

  const destUrl  = `${PLATFORM_URL}?utm_source=outreach&utm_medium=email`;
  const ctaHref  = trackingId
    ? `${TRACK_BASE_URL}/api/track/click/${trackingId}?url=${encodeURIComponent(destUrl)}`
    : destUrl;
  const plainUrl = trackingId
    ? `${TRACK_BASE_URL}/api/track/click/${trackingId}?url=${encodeURIComponent(PLATFORM_URL)}`
    : PLATFORM_URL;

  const ctaBlock = `
    <div style="text-align:center;margin:28px 0 8px;">
      <a href="${ctaHref}"
         style="display:inline-block;background:#4f46e5;color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(79,70,229,0.25);">
        Explore ${PLATFORM_NAME} &nbsp;&#8594;
      </a>
    </div>
    <p style="text-align:center;margin:12px 0 0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">
      <a href="${plainUrl}" style="color:#6366f1;text-decoration:none;">${PLATFORM_URL}</a>
    </p>
  `;

  const pixel = trackingId
    ? `<img src="${TRACK_BASE_URL}/api/track/open/${trackingId}" width="1" height="1" style="display:none;border:0;" alt="">`
    : '';

  return wrap(paragraphs + ctaBlock + pixel);
};

// ── Bulk send with custom AI/edited content ───────────────────────────────────

// Sender aliases — all authenticate as SMTP_USER (the real Hostinger mailbox);
// aliases only change the visible From address.
const resolveFromAddress = (fromAlias) => {
  const map = {
    noreply: process.env.EMAIL_NOREPLY,
    support: process.env.EMAIL_SUPPORT,
    billing: process.env.EMAIL_BILLING,
    main:    process.env.SMTP_USER || process.env.EMAIL_USER,
  };
  return map[fromAlias] || process.env.SMTP_USER || process.env.EMAIL_USER;
};

export const sendBulkCustomEmails = async (prospects, { subject, bodyText, templateType, fromAlias }, sentBy = 'admin') => {
  const results = { sent: 0, failed: 0, noEmail: 0, errors: [], recipients: [], fromAddress: null };
  const fromAddress = resolveFromAddress(fromAlias);
  results.fromAddress = fromAddress;

  for (const prospect of prospects) {
    const email = prospect.primaryEmail || (prospect.allEmails?.[0]);
    if (!email) { results.noEmail++; continue; }

    try {
      const company = prospect.companyName || 'your company';
      const personalSubject = subject.replace(/\{\{companyName\}\}/g, company);
      const personalBody    = bodyText.replace(/\{\{companyName\}\}/g, company);

      // Generate a unique tracking ID for this individual send
      const trackingId = randomBytes(16).toString('hex');
      const html = buildCustomEmailHtml(personalBody, trackingId);

      await transporter.sendMail({
        from: `"${FROM_NAME}" <${fromAddress}>`,
        to:   email,
        subject: personalSubject,
        html,
      });

      results.sent++;
      results.recipients.push({ name: prospect.companyName || '', email, delivered: true });
      // Skip history for manually-added custom recipients (no DB doc)
      if (prospect._id) {
        await prospect.constructor.findByIdAndUpdate(prospect._id, {
          $push: {
            emailHistory: {
              templateId:   templateType,
              templateName: EMAIL_TYPE_LIST.find(t => t.id === templateType)?.label || templateType,
              subject:      personalSubject,
              sentAt:       new Date(),
              sentBy,
              trackingId,
              openCount:  0,
              clickCount: 0,
            },
          },
          $set: { contacted: true, contactedDate: new Date(), contactedBy: sentBy },
        });
      }
    } catch (err) {
      results.failed++;
      results.recipients.push({ name: prospect.companyName || '', email, delivered: false });
      results.errors.push({ id: prospect._id, name: prospect.companyName, error: err.message });
    }
  }

  return results;
};
