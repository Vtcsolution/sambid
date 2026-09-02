// backend/routes/trackingRoutes.js - public, no auth
import express from 'express';
import { trackOpen, trackClick, trackEmailOpen } from '../controllers/trackingController.js';
import { recordPageView, recordPageDuration } from '../controllers/pageViewController.js';

const router = express.Router();

router.get('/open/:trackingId',       trackOpen);      // prospect outreach emails
router.get('/click/:trackingId',      trackClick);     // prospect outreach emails
router.get('/email-open/:trackingId', trackEmailOpen); // normal user emails (plan/payment/trial/campaign)

router.post('/pageview',              recordPageView);     // website visitor tracking
router.post('/pageview/duration',     recordPageDuration); // time-on-page, sent via sendBeacon

export default router;
