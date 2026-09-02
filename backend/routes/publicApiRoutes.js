// backend/routes/publicApiRoutes.js
// The actual external, versioned API (Pro/Enterprise only) - authenticated
// via X-API-Key, not the dashboard JWT. Keys are issued from
// routes/apiKeyRoutes.js (dashboard-only, JWT-authenticated).
import express from 'express';
import { listOpportunities, getOpportunity } from '../controllers/publicApiController.js';
import { apiKeyAuth } from '../middleware/apiKeyAuth.js';

const router = express.Router();
router.use(apiKeyAuth);

router.get('/opportunities',     listOpportunities);
router.get('/opportunities/:id', getOpportunity);

export default router;
