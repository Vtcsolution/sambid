// backend/routes/apiKeyRoutes.js
// Dashboard-authenticated (JWT) routes for a logged-in user to manage their
// OWN public API key. Not to be confused with routes/publicApiRoutes.js,
// which is the actual external API those keys unlock.
import express from 'express';
import { getApiKeyStatus, generateApiKey, regenerateApiKey, revokeApiKey } from '../controllers/apiKeyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

router.get('/',            getApiKeyStatus);
router.post('/generate',   generateApiKey);
router.post('/regenerate', regenerateApiKey);
router.delete('/',         revokeApiKey);

export default router;
