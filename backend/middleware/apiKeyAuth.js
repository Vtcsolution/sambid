// backend/middleware/apiKeyAuth.js
// Authenticates requests to the public API (/api/v1/*) via an `X-API-Key`
// header instead of the dashboard's JWT session. Enforces plan.apiAccess
// and the plan's daily request cap (Plan.limits.apiDailyLimit, -1 = unlimited).
import crypto from 'crypto';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import UsageTracking from '../models/admin/UsageTracking.js';

const hashKey = (key) => crypto.createHash('sha256').update(key).digest('hex');

export const apiKeyAuth = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ success: false, code: 'MISSING_API_KEY', message: 'Missing X-API-Key header.' });
    }

    const user = await User.findOne({ apiKeyHash: hashKey(apiKey) }).select('+apiKeyHash');
    if (!user) {
      return res.status(401).json({ success: false, code: 'INVALID_API_KEY', message: 'Invalid API key.' });
    }

    const plan = await Plan.findOne({ name: user.plan });
    if (!plan?.limits?.apiAccess) {
      return res.status(403).json({
        success: false,
        code: 'API_ACCESS_REQUIRED',
        message: 'Your current plan does not include API access. Upgrade to Pro or Enterprise.',
      });
    }

    const dailyLimit = plan.limits.apiDailyLimit ?? 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await UsageTracking.findOne({ user: user._id, date: { $gte: today } });
    if (!usage) {
      usage = await UsageTracking.create({ user: user._id, date: today });
    }

    if (dailyLimit !== -1 && usage.apiRequests >= dailyLimit) {
      const resetAt = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      res.setHeader('X-RateLimit-Limit', dailyLimit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', resetAt.toISOString());
      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Daily API limit (${dailyLimit} requests) reached. Resets at ${resetAt.toISOString()}.`,
        resetAt,
      });
    }

    usage.apiRequests += 1;
    await usage.save();

    if (dailyLimit !== -1) {
      res.setHeader('X-RateLimit-Limit', dailyLimit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, dailyLimit - usage.apiRequests));
    }

    req.apiUser = user;
    req.apiPlan = plan;
    next();
  } catch (error) {
    console.error('apiKeyAuth error:', error.message);
    res.status(500).json({ success: false, message: 'API authentication error.' });
  }
};
