// backend/controllers/apiKeyController.js
// Lets a logged-in dashboard user (Pro/Enterprise) generate and manage their
// public API key (/api/v1/*). Only the SHA-256 hash is ever stored - the
// plain key is returned exactly once, at generation/regeneration time.
import crypto from 'crypto';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import UsageTracking from '../models/admin/UsageTracking.js';

const hashKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

const generateKey = () => {
  const secret = crypto.randomBytes(24).toString('hex'); // 48 hex chars
  const plainKey = `sambid_live_${secret}`;
  const prefix = `${plainKey.slice(0, 20)}…`; // safe to display, never the full key
  return { plainKey, hash: hashKey(plainKey), prefix };
};

const todayUsage = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usage = await UsageTracking.findOne({ user: userId, date: { $gte: today } });
  return usage?.apiRequests || 0;
};

// GET /api/apikey - status only, never the secret
export const getApiKeyStatus = async (req, res) => {
  try {
    const plan = await Plan.findOne({ name: req.user.plan });
    const hasAccess = !!plan?.limits?.apiAccess;
    const dailyLimit = plan?.limits?.apiDailyLimit ?? 0;
    const usedToday = req.user.apiKeyHash ? await todayUsage(req.user._id) : 0;

    res.json({
      success: true,
      data: {
        hasAccess,
        hasKey:       !!req.user.apiKeyPrefix,
        keyPrefix:    req.user.apiKeyPrefix || null,
        createdAt:    req.user.apiKeyCreatedAt || null,
        dailyLimit,                       // -1 = unlimited
        usedToday,
        plan: req.user.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/apikey/generate - first-time key creation
export const generateApiKey = async (req, res) => {
  try {
    const plan = await Plan.findOne({ name: req.user.plan });
    if (!plan?.limits?.apiAccess) {
      return res.status(403).json({
        success: false,
        message: 'API access is available on the Pro and Enterprise plans. Please upgrade to generate a key.',
      });
    }

    const { plainKey, hash, prefix } = generateKey();
    const user = await User.findById(req.user._id);
    user.apiKeyHash      = hash;
    user.apiKeyPrefix    = prefix;
    user.apiKeyCreatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'API key generated. Copy it now - you will not be able to see it again.',
      data: { apiKey: plainKey, keyPrefix: prefix, createdAt: user.apiKeyCreatedAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/apikey/regenerate - invalidates the old key immediately
export const regenerateApiKey = async (req, res) => {
  try {
    const plan = await Plan.findOne({ name: req.user.plan });
    if (!plan?.limits?.apiAccess) {
      return res.status(403).json({ success: false, message: 'API access is available on the Pro and Enterprise plans.' });
    }

    const { plainKey, hash, prefix } = generateKey();
    const user = await User.findById(req.user._id);
    user.apiKeyHash      = hash;
    user.apiKeyPrefix    = prefix;
    user.apiKeyCreatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'API key regenerated. Your old key no longer works. Copy the new one now.',
      data: { apiKey: plainKey, keyPrefix: prefix, createdAt: user.apiKeyCreatedAt },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/apikey - revoke, no replacement
export const revokeApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.apiKeyHash = null;
    user.apiKeyPrefix = null;
    user.apiKeyCreatedAt = null;
    await user.save();
    res.json({ success: true, message: 'API key revoked.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
