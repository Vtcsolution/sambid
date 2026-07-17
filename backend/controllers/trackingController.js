// backend/controllers/trackingController.js
// Public tracking endpoints — no auth required.
// Called by email clients (pixel load = open, link click = click).

import Prospect from '../models/Prospect.js';
import TrackedEmail from '../models/TrackedEmail.js';
import AdminNotification from '../models/admin/AdminNotification.js';
import { emitToAdmins } from '../socket.js';

// 1x1 transparent PNG — returned immediately for open tracking
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

export const trackOpen = async (req, res) => {
  const { trackingId } = req.params;

  // Return pixel immediately — don't keep the email client waiting
  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.send(PIXEL);

  if (!trackingId) return;

  try {
    const now = new Date();
    // Set openedAt only on first open
    await Prospect.updateOne(
      { emailHistory: { $elemMatch: { trackingId, openedAt: { $exists: false } } } },
      { $set: { 'emailHistory.$.openedAt': now } }
    );
    // Always increment count
    await Prospect.updateOne(
      { 'emailHistory.trackingId': trackingId },
      { $inc: { 'emailHistory.$.openCount': 1 } }
    );
  } catch (err) {
    console.error('[track-open]', err.message);
  }
};

// Open tracking for normal user emails (plan / payment / trial / campaigns).
// Notifies admins ONCE per email — on the first open only, so repeat opens
// (or a campaign to a large segment) never flood the admin panel.
const EMAIL_TYPE_LABELS = {
  plan_activated:       'Plan Activated email',
  payment_confirmation: 'Payment Confirmation email',
  payment_instructions: 'Payment Instructions email',
  trial_reminder:       'Trial Reminder email',
  trial_expired:        'Trial Expired email',
  campaign:             'Campaign email',
  other:                'email',
};

export const trackEmailOpen = async (req, res) => {
  const { trackingId } = req.params;

  // Return pixel immediately — don't keep the email client waiting
  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.send(PIXEL);

  if (!trackingId) return;

  try {
    const now = new Date();
    // Returns the PRE-update doc — openedAt === null means this is the first open
    const doc = await TrackedEmail.findOneAndUpdate(
      { trackingId },
      { $inc: { openCount: 1 }, $set: { lastOpenedAt: now } },
      { new: false }
    );
    if (!doc || doc.openedAt) return; // unknown id, or already notified

    await TrackedEmail.updateOne({ trackingId }, { $set: { openedAt: now } });

    const who = doc.recipientName || doc.recipientEmail;
    const label = EMAIL_TYPE_LABELS[doc.emailType] || 'email';
    const notification = await AdminNotification.create({
      title:   `📬 Email opened by ${who}`,
      message: `${who} (${doc.recipientEmail}) opened the ${label}: "${doc.subject}"`,
      type:     'email_opened',
      priority: 'low',
      metadata: {
        recipientEmail: doc.recipientEmail,
        recipientName:  doc.recipientName,
        emailType:      doc.emailType,
        subject:        doc.subject,
        sentAt:         doc.sentAt,
        userId:         doc.user,
      },
    });

    emitToAdmins('email:opened', {
      notificationId: notification._id,
      recipientEmail: doc.recipientEmail,
      recipientName:  doc.recipientName,
      emailType:      doc.emailType,
      subject:        doc.subject,
      openedAt:       now,
    });
  } catch (err) {
    console.error('[track-email-open]', err.message);
  }
};

export const trackClick = async (req, res) => {
  const { trackingId } = req.params;
  const destination = req.query.url
    ? decodeURIComponent(req.query.url)
    : (process.env.FRONTEND_URL || 'https://sambid.co');

  // Redirect immediately
  res.redirect(302, destination);

  if (!trackingId) return;

  try {
    const now = new Date();
    // Set clickedAt only on first click
    await Prospect.updateOne(
      { emailHistory: { $elemMatch: { trackingId, clickedAt: { $exists: false } } } },
      { $set: { 'emailHistory.$.clickedAt': now } }
    );
    // Always increment count
    await Prospect.updateOne(
      { 'emailHistory.trackingId': trackingId },
      { $inc: { 'emailHistory.$.clickCount': 1 } }
    );
  } catch (err) {
    console.error('[track-click]', err.message);
  }
};
