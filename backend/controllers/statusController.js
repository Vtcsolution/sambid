// backend/controllers/statusController.js
// Public, unauthenticated system status check - real live checks only,
// never fabricated historical uptime numbers (no monitoring history exists
// to back that up honestly yet).
import mongoose from 'mongoose';
import { fetchStats } from '../services/schedulerService.js';

const SAM_SYNC_STALE_AFTER_MS = 2 * 60 * 60 * 1000; // 2 hours

export const getStatus = async (req, res) => {
  const checks = [];

  // 1. API server - trivially true if this handler is running at all
  checks.push({
    name: 'Website & API',
    status: 'operational',
    detail: `Up for ${Math.floor(process.uptime() / 3600)}h ${Math.floor((process.uptime() % 3600) / 60)}m`,
  });

  // 2. Database
  const dbState = mongoose.connection.readyState; // 1 = connected
  checks.push({
    name: 'Database',
    status: dbState === 1 ? 'operational' : 'down',
    detail: dbState === 1 ? 'Connected' : 'Not connected',
  });

  // 3. SAM.gov data sync - schedulers only run in production, so a null
  // timestamp on a fresh/local server isn't a real outage, just "no data yet"
  let samStatus = 'operational';
  let samDetail = 'No sync recorded yet';
  if (fetchStats.lastMasterFetchAt) {
    const ageMs = Date.now() - new Date(fetchStats.lastMasterFetchAt).getTime();
    samStatus = ageMs > SAM_SYNC_STALE_AFTER_MS ? 'degraded' : 'operational';
    samDetail = `Last synced ${Math.round(ageMs / 60000)} min ago`;
  }
  checks.push({ name: 'SAM.gov Data Sync', status: samStatus, detail: samDetail });

  const overall = checks.some(c => c.status === 'down')
    ? 'down'
    : checks.some(c => c.status === 'degraded')
      ? 'degraded'
      : 'operational';

  res.json({
    success: true,
    overall,
    checks,
    checkedAt: new Date().toISOString(),
  });
};
