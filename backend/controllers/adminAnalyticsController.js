// backend/controllers/adminAnalyticsController.js
// Website traffic analytics for the admin dashboard, built from PageView docs
// recorded by controllers/pageViewController.js.
import PageView from '../models/PageView.js';

const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

// GET /api/admin/analytics/traffic?range=7d|30d|90d
export const getTrafficAnalytics = async (req, res) => {
  try {
    const days = RANGE_DAYS[req.query.range] || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const match = { createdAt: { $gte: since } };

    const [result] = await PageView.aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            { $group: { _id: null, totalViews: { $sum: 1 }, uniqueSessions: { $addToSet: '$sessionId' } } },
            { $project: { _id: 0, totalViews: 1, uniqueVisitors: { $size: '$uniqueSessions' } } },
          ],
          avgDuration: [
            { $match: { durationSeconds: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$durationSeconds' } } },
          ],
          daily: [
            { $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              views: { $sum: 1 },
              sessions: { $addToSet: '$sessionId' },
            } },
            { $project: { _id: 0, date: '$_id', views: 1, visitors: { $size: '$sessions' } } },
            { $sort: { date: 1 } },
          ],
          topPages: [
            { $group: { _id: '$path', views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, path: '$_id', views: 1 } },
          ],
          topCountries: [
            { $group: { _id: { code: '$country', name: '$countryName' }, views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, code: '$_id.code', name: '$_id.name', views: 1 } },
          ],
          devices: [
            { $group: { _id: '$device', views: { $sum: 1 } } },
            { $project: { _id: 0, device: '$_id', views: 1 } },
          ],
          browsers: [
            { $group: { _id: '$browser', views: { $sum: 1 } } },
            { $sort: { views: -1 } },
            { $limit: 6 },
            { $project: { _id: 0, browser: '$_id', views: 1 } },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      range: `${days}d`,
      data: {
        totalViews:     result.totals[0]?.totalViews || 0,
        uniqueVisitors: result.totals[0]?.uniqueVisitors || 0,
        avgDurationSeconds: Math.round(result.avgDuration[0]?.avg || 0),
        daily:        result.daily,
        topPages:     result.topPages,
        topCountries: result.topCountries,
        devices:      result.devices,
        browsers:     result.browsers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
