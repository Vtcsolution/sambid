// backend/controllers/adminApiKeyController.js
// Admin visibility into customer-issued public API keys (Settings > API Access
// on the user side). Never exposes the actual key — only the safe prefix that
// was already shown to the user once at generation time.
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import UsageTracking from '../models/admin/UsageTracking.js';

// GET /api/admin/api-keys — everyone who currently has an active key
export const listApiKeys = async (req, res) => {
  try {
    const users = await User.find({ apiKeyHash: { $ne: null } })
      .select('name email plan apiKeyPrefix apiKeyCreatedAt')
      .sort({ apiKeyCreatedAt: -1 });

    const plans = await Plan.find({}, 'name limits.apiDailyLimit');
    const limitByPlan = Object.fromEntries(plans.map(p => [p.name, p.limits?.apiDailyLimit ?? 0]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const usageDocs = await UsageTracking.find({
      user: { $in: users.map(u => u._id) },
      date: { $gte: today },
    });
    const usageByUser = Object.fromEntries(usageDocs.map(u => [String(u.user), u.apiRequests]));

    const data = users.map(u => ({
      id:          u._id,
      name:        u.name,
      email:       u.email,
      plan:        u.plan,
      keyPrefix:   u.apiKeyPrefix,
      createdAt:   u.apiKeyCreatedAt,
      dailyLimit:  limitByPlan[u.plan] ?? 0,
      usedToday:   usageByUser[String(u._id)] || 0,
    }));

    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/api-keys/:userId — force-revoke (e.g. suspected leak/abuse)
export const revokeUserApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.apiKeyHash = null;
    user.apiKeyPrefix = null;
    user.apiKeyCreatedAt = null;
    await user.save();

    res.json({ success: true, message: `API key revoked for ${user.email}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
