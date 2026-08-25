import express from 'express';
import { protectAdmin } from '../middleware/adminAuthMiddleware.js';
import { featureUpload } from '../middleware/featureUpload.js';
import { uploadBufferToCloudinary } from '../utils/cloudinaryUpload.js';
import {
  getSettings, updateSettings, getPublicTestimonials,
  adminListTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} from '../controllers/testimonialController.js';

const router = express.Router();

// Public routes (no auth)
router.get('/settings', getSettings);
router.get('/',         getPublicTestimonials);

// Admin routes
router.get('/admin/all',      protectAdmin, adminListTestimonials);
router.put('/admin/settings', protectAdmin, updateSettings);
router.post('/admin',         protectAdmin, createTestimonial);
router.put('/admin/:id',      protectAdmin, updateTestimonial);
router.delete('/admin/:id',   protectAdmin, deleteTestimonial);

// Upload client photo/video for a testimonial
router.post('/admin/upload', protectAdmin, featureUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
  const isVideo = req.file.mimetype.startsWith('video/');
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'sambid/testimonials',
      resourceType: isVideo ? 'video' : 'image',
    });
    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
  }
});

export default router;
