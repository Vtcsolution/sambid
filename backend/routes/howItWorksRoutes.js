import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { featureUpload } from '../middleware/featureUpload.js';
import { getContent, adminGetContent, updateContent, seedDefaults } from '../controllers/howItWorksController.js';

const router = express.Router();

// Public: the page reads its content from here
router.get('/', getContent);

// Admin
router.get('/admin', protectAdmin, adminGetContent);
router.put('/admin', protectAdmin, updateContent);
router.post('/admin/seed', protectAdmin, seedDefaults);

// Reuse the feature-showcase upload pipeline for pain-point videos/thumbnails
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
