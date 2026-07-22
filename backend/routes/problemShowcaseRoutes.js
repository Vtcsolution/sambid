import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { featureUpload } from '../middleware/featureUpload.js';
import {
  getAllProblems, getProblemBySlug,
  adminListProblems, createProblem, updateProblem, deleteProblem, seedDefaults,
} from '../controllers/problemShowcaseController.js';

const router = express.Router();

router.get('/',      getAllProblems);
router.get('/:slug', getProblemBySlug);

router.get('/admin/all',   protectAdmin, adminListProblems);
router.post('/admin/seed', protectAdmin, seedDefaults);
router.post('/admin',      protectAdmin, createProblem);
router.put('/admin/:id',   protectAdmin, updateProblem);
router.delete('/admin/:id', protectAdmin, deleteProblem);

// Reuse the feature-showcase upload pipeline for thumbnails
router.post('/admin/upload', protectAdmin, featureUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const isVideo = req.file.mimetype.startsWith('video/');
  res.json({
    success: true,
    data: {
      url: `/uploads/features/${req.file.filename}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      type: isVideo ? 'video' : 'image',
    },
  });
});

export default router;
