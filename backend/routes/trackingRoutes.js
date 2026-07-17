// backend/routes/trackingRoutes.js — public, no auth
import express from 'express';
import { trackOpen, trackClick, trackEmailOpen } from '../controllers/trackingController.js';

const router = express.Router();

router.get('/open/:trackingId',       trackOpen);      // prospect outreach emails
router.get('/click/:trackingId',      trackClick);     // prospect outreach emails
router.get('/email-open/:trackingId', trackEmailOpen); // normal user emails (plan/payment/trial/campaign)

export default router;
