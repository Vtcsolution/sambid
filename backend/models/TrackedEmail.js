// backend/models/TrackedEmail.js
// One document per tracked transactional/campaign email sent to a user.
// NOT used for bulk opportunity/deadline emails - those would flood admin
// notifications (thousands/day). Only "normal" emails: plan, payment, trial,
// broadcast campaigns. Open pixel hits /api/track/email-open/:trackingId.
import mongoose from 'mongoose';

const trackedEmailSchema = new mongoose.Schema({
  trackingId:     { type: String, required: true, unique: true, index: true },
  recipientEmail: { type: String, required: true },
  recipientName:  { type: String, default: '' },
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  campaign:       { type: mongoose.Schema.Types.ObjectId, ref: 'CampaignLog', default: null, index: true },
  emailType: {
    type: String,
    enum: [
      'plan_activated',
      'payment_confirmation',
      'payment_instructions',
      'trial_reminder',
      'trial_expired',
      'campaign',
      'other',
    ],
    default: 'other',
  },
  subject:      { type: String, default: '' },
  sentAt:       { type: Date, default: Date.now },
  openedAt:     { type: Date, default: null },   // first open
  lastOpenedAt: { type: Date, default: null },
  openCount:    { type: Number, default: 0 },
}, { timestamps: true });

trackedEmailSchema.index({ recipientEmail: 1, createdAt: -1 });
trackedEmailSchema.index({ emailType: 1, openedAt: -1 });

const TrackedEmail = mongoose.model('TrackedEmail', trackedEmailSchema);
export default TrackedEmail;
