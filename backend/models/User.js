import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    maxlength: 128,
    select: false
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  // Public API access (/api/v1/*) - Pro/Enterprise only, see Plan.limits.apiAccess.
  // Only the SHA-256 hash is stored; the plain key is shown to the user once,
  // at generation time, and never again.
  apiKeyHash: { type: String, default: null, select: false },
  apiKeyPrefix: { type: String, default: null },      // e.g. "sambid_live_a1b2c3d4" - safe to display
  apiKeyCreatedAt: { type: Date, default: null },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  plan: {
    type: String,
    enum: ['trial', 'free', 'starter', 'pro', 'enterprise', 'expired'],
    default: 'trial'
  },
  planExpiresAt: {
    type: Date,
    default: null
  },
  // Soft delete (admin trash) - deleted users are hidden and blocked from
  // logging in, but stay in the database and can be restored by an admin.
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  // One-time "first matched contracts" email - sent immediately after the
  // user's NAICS codes produce their first matches (no waiting for crons).
  welcomeMatchesSentAt: {
    type: Date,
    default: null,
  },
  // Trial tracking
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    default: () => new Date(+new Date() + 5 * 24 * 60 * 60 * 1000) // 5-day trial
  },
  isTrialActive: {
    type: Boolean,
    default: true
  },
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    default: null,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    default: null,
    select: false,
  },

  // Monthly match tracking (starter/pro/enterprise)
  monthlyMatchesUsed: {
    type: Number,
    default: 0
  },
  lastMonthlyReset: {
    type: Date,
    default: Date.now
  },
  // Daily match tracking (trial/free - 3 per day)
  dailyMatchesUsed: {
    type: Number,
    default: 0
  },
  lastDailyReset: {
    type: Date,
    default: Date.now
  },
  // Monthly AI usage tracking
  monthlyAIGenerationsUsed: {
    type: Number,
    default: 0
  },
  lastAIReset: {
    type: Date,
    default: Date.now
  },
  // Purchased bonus AI credits (admin-approved top-ups, not reset monthly)
  bonusAICredits: {
    type: Number,
    default: 0
  },
  // Set only when an admin grants a paid plan to a trial/free account (not a
  // real purchase) - the nightly expiry sweep reverts these to `plan: 'trial'`
  // with a fresh trial window instead of the normal 'free' downgrade a lapsed
  // real subscription gets. Left null for real purchases/subscriptions.
  tempGrantExpiresAt: {
    type: Date,
    default: null
  },
  // When set, overrides the plan's normal monthly AI credit allocation with
  // this exact number (see services/aiCreditService.js) - used for the
  // automatic new-signup promo (full Enterprise feature access, but capped
  // at a fixed credit amount instead of Enterprise's real 5000/mo). Cleared
  // whenever tempGrantExpiresAt reverts the account, same as that field.
  promoCreditsCap: {
    type: Number,
    default: null
  },
  lastTrialReminderSent: {
  type: Date,
  default: null
},
lastDigestSent: {
  type: Date,
  default: null
},
emailAlertsEnabled: {
  type: Boolean,
  default: true
},
alertFrequency: {
  type: String,
  enum: ['realtime', 'daily', 'weekly'],
  default: 'daily'  // Free users get weekly, Pro users get daily, Enterprise get realtime
},
  // Business info
  businessName: {
    type: String,
    default: ''
  },
  businessType: {
    type: String,
    enum: ['sole_proprietor', 'llc', 'corporation', 'nonprofit', 'other'],
    default: 'other'
  },
  naicsCodes: [{
    type: String
  }],
  // Email preferences
  emailAlertsEnabled: {
    type: Boolean,
    default: true
  },
  alertFrequency: {
    type: String,
    enum: ['realtime', 'daily', 'weekly'],
    default: 'daily'
  },

  dailyFetchesUsed: {
  type: Number,
  default: 0
},
lastFetchReset: {
  type: Date,
  default: Date.now
},
  // Password reset
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  // Onboarding
  onboardingCompleted: {
    type: Boolean,
    default: false
  },

  // ── Referral system ───────────────────────────────────────────────────────
  referralCode: {
    type: String,
    unique: true,
    sparse: true,   // null rows are excluded from uniqueness
    default: null,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  // Available balance (can be spent on plans or withdrawn)
  referralBalance: { type: Number, default: 0 },
  // Lifetime earnings (never decreases)
  totalReferralEarnings: { type: Number, default: 0 },
  // How many of this user's referrals have purchased a paid plan
  paidReferralCount: { type: Number, default: 0 },

  // ── Support member referral ───────────────────────────────────────────────
  supportReferredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
  },

  // ── Two-Factor Authentication ─────────────────────────────────────────────
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret:  { type: String, default: null, select: false },
  twoFactorBackupCodes: { type: [String], default: [], select: false },
  // Temp token issued after password-verified login when 2FA is enabled
  twoFactorTempToken: { type: String, default: null, select: false },
  twoFactorTempExpires: { type: Date, default: null, select: false },

  // Deadline alert window: send "upcoming deadline" emails for opps due within this many days
  deadlineAlertDays: { type: Number, default: 30 },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

// Auto-generate a unique referral code on first save
userSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    // 8-char alphanumeric code derived from ObjectId suffix + random
    const base = this._id.toString().slice(-4).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.referralCode = `${base}${rand}`;
  }
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if trial is still active
userSchema.methods.isTrialValid = function() {
  if (!this.isTrialActive) return false;
  return new Date() < this.trialEndDate;
};

// Get days left in trial
userSchema.methods.getTrialDaysLeft = function() {
  if (!this.isTrialActive) return 0;
  const diff = this.trialEndDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
// Add to userSchema methods
userSchema.methods.isPlanActive = function() {
  if (this.plan === 'free') return true;
  if (!this.planExpiresAt) return true;
  return new Date() < this.planExpiresAt;
};

userSchema.methods.getDaysLeft = function() {
  if (this.plan === 'free') return null;
  if (!this.planExpiresAt) return null;
  const diff = this.planExpiresAt - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const User = mongoose.model('User', userSchema);
export default User;