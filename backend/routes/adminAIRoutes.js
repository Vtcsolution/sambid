import express from 'express';
import { flexAdmin } from '../middleware/flexAdminMiddleware.js';
import {
  getPlatformInsights,
  getUserSegments,
  getChurnPrediction,
  getPlatformHealth,
  generateContent,
  getRevenueForecast,
  sendCampaign,
  getSegmentUsers,
  getCampaignHistory,
  getUserTopMatches,
} from '../controllers/adminAIController.js';

const router = express.Router();
router.use(flexAdmin);

router.post('/insights',         getPlatformInsights);
router.get('/segments',          getUserSegments);
router.get('/churn-prediction',  getChurnPrediction);
router.get('/platform-health',   getPlatformHealth);
router.post('/generate-content', generateContent);
router.get('/revenue-forecast',  getRevenueForecast);
router.post('/send-campaign',    sendCampaign);
router.get('/segment-users',     getSegmentUsers);
router.get('/campaign-history',  getCampaignHistory);
router.get('/user-top-matches/:userId', getUserTopMatches);

export default router;
