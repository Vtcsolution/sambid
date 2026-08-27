// backend/services/prospectFollowUpService.js
// Automated follow-up sequence for prospects who already received one manual
// outreach email and never replied. Runs on a cron, gated the same way as
// every other scheduler in this app (production-only unless ENABLE_SCHEDULERS
// is set) — see server.js.
//
// Send window: Tue/Wed/Thu, 10:00 AM America/New_York. This is the
// well-established best-practice window for US B2B email opens — mid-morning,
// mid-week. Monday is skipped (recipients are clearing weekend inbox backlog,
// opens run measurably lower) and Friday is skipped (attention drops off
// toward the weekend). A single US-Eastern anchor time is used rather than
// per-recipient timezone math — 10am ET lands at 7-8am on the West Coast,
// which is earlier than ideal there but still within business hours, and
// keeps the whole system simple and predictable.
//
// Sequence (3 touches, each ~4-5 days apart, stops the moment a prospect's
// responseStatus leaves 'none' — i.e. they replied, showed interest, said
// not interested, or converted):
//   1. "time"     — time-saving angle (short, personalized)
//   2. "trial"    — direct free-trial nudge
//   3. "followup" — brief, low-pressure "still worth a look?" check-in
//
// Every send goes through the same pipeline as a manual outreach email —
// AI-generated (or static fallback with no API key) via generateEmailWithAI,
// then the recipient's own live NAICS-matched opportunities auto-appended —
// so a follow-up is exactly as personalized as the first email.
import { randomBytes } from 'crypto';
import cron from 'node-cron';
import Prospect from '../models/Prospect.js';
import { transporter } from './emailService.js';
import {
  generateEmailWithAI,
  buildCustomEmailHtml,
  buildProspectMatchesBlock,
} from './prospectEmailService.js';

const FROM_NAME = 'Sambid Team';
const MIN_DAYS_SINCE_LAST_EMAIL = 4;
const MAX_SENDS_PER_RUN = 150; // safety cap — this batch is ~200 total, staggered naturally by send date

// Stage 0 = only the initial (manual) email exists → next up is stage 1.
const SEQUENCE = ['time', 'trial', 'followup'];

const daysSince = (date) => (Date.now() - new Date(date).getTime()) / 86400000;

async function findEligibleProspects() {
  const candidates = await Prospect.find({
    primaryEmail: { $exists: true, $ne: null },
    responseStatus: 'none',
    followUpStage: { $lt: SEQUENCE.length },
    'emailHistory.0': { $exists: true }, // must have received at least the initial email
  })
    .select('companyName primaryEmail state contactPersonName naicsCode naicsDescription totalContractsWon totalAwardAmount followUpStage emailHistory')
    .limit(MAX_SENDS_PER_RUN * 2) // headroom before the date filter below
    .lean();

  return candidates.filter(p => {
    const last = p.emailHistory[p.emailHistory.length - 1];
    return last && daysSince(last.sentAt) >= MIN_DAYS_SINCE_LAST_EMAIL;
  }).slice(0, MAX_SENDS_PER_RUN);
}

export async function runProspectFollowUps() {
  if (!(process.env.SMTP_USER || process.env.EMAIL_USER) || !(process.env.SMTP_PASS || process.env.EMAIL_PASS)) {
    console.warn('⏸️  Prospect follow-ups skipped — SMTP not configured.');
    return { sent: 0, failed: 0 };
  }

  const prospects = await findEligibleProspects();
  if (prospects.length === 0) {
    console.log('📧 Prospect follow-ups: nothing due right now.');
    return { sent: 0, failed: 0 };
  }

  console.log(`📧 Prospect follow-ups: ${prospects.length} due — sending...`);
  let sent = 0, failed = 0;

  for (const prospect of prospects) {
    const templateType = SEQUENCE[prospect.followUpStage];
    try {
      const { subject, bodyText } = await generateEmailWithAI(templateType, prospect);
      const trackingId = randomBytes(16).toString('hex');
      const html = buildCustomEmailHtml(bodyText, trackingId);
      const matchesBlock = await buildProspectMatchesBlock(prospect).catch(() => '');
      const footerAnchor = '<div style="background:#f9fafb;border-top:1px solid #e5e7eb';
      const anchorIdx = html.indexOf(footerAnchor);
      const finalHtml = matchesBlock && anchorIdx !== -1
        ? html.slice(0, anchorIdx) + matchesBlock + html.slice(anchorIdx)
        : html;

      await transporter.sendMail({
        from: `"${FROM_NAME}" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
        to: prospect.primaryEmail,
        subject,
        html: finalHtml,
      });

      await Prospect.findByIdAndUpdate(prospect._id, {
        $inc: { followUpStage: 1 },
        $push: {
          emailHistory: {
            templateId: templateType,
            templateName: `Auto Follow-up ${prospect.followUpStage + 1}/${SEQUENCE.length}`,
            subject,
            sentAt: new Date(),
            sentBy: 'auto-followup',
            trackingId,
          },
        },
      });
      sent++;
    } catch (err) {
      failed++;
      console.error(`❌ Follow-up failed for ${prospect.companyName} (${prospect.primaryEmail}):`, err.message);
    }
    await new Promise(r => setTimeout(r, 200)); // gentle pacing, matches manual bulk sends
  }

  console.log(`📧 Prospect follow-ups complete: ${sent} sent, ${failed} failed.`);
  return { sent, failed };
}

export function startProspectFollowUpScheduler() {
  // 10:00 AM America/New_York, Tuesday/Wednesday/Thursday only.
  cron.schedule('0 10 * * 2,3,4', () => {
    runProspectFollowUps().catch(err => console.error('Prospect follow-up scheduler error:', err.message));
  }, { timezone: 'America/New_York' });
  console.log('📧 Prospect follow-up scheduler started (Tue/Wed/Thu 10:00 AM ET).');
}
