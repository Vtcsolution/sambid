import express from 'express';
import { flexAdmin } from '../middleware/flexAdminMiddleware.js';
import { mediaUpload } from '../middleware/mediaUpload.js';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import PageMedia from '../models/PageMedia.js';

const router = express.Router();

const BASE_SLOTS = {
  home:     ['hero', ...Array.from({ length: 20 }, (_, i) => `phase_${String(i+1).padStart(2,'0')}`)],
  features: Array.from({ length: 12 }, (_, i) => `feature_${String(i+1).padStart(2,'0')}`),
};

// ── Public: get all media for a page ──────────────────────────────────────────
router.get('/page/:page', async (req, res) => {
  const { page } = req.params;
  if (!['home','features'].includes(page)) {
    return res.status(400).json({ success: false, message: 'Invalid page.' });
  }
  try {
    const records = await PageMedia.find({ page }).lean();
    const media = {};
    records.forEach(r => {
      if (!media[r.slot]) media[r.slot] = {};
      media[r.slot][r.type] = { _id: r._id, url: r.url, filename: r.filename, size: r.size, updatedAt: r.updatedAt };
    });
    res.json({ success: true, media, slots: BASE_SLOTS[page] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Admin: upload media for a slot ────────────────────────────────────────────
router.post('/upload', flexAdmin, mediaUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });

  const { page, slot } = req.body;
  if (!page || !slot) {
    return res.status(400).json({ success: false, message: 'page and slot are required.' });
  }
  if (!BASE_SLOTS[page]?.includes(slot)) {
    return res.status(400).json({ success: false, message: 'Invalid page or slot.' });
  }

  const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

  try {
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: `sambid/page-media/${page}`,
      resourceType: type,
    });

    // Delete the old Cloudinary asset if replacing
    const existing = await PageMedia.findOne({ page, slot, type });
    if (existing?.publicId) {
      await deleteFromCloudinary(existing.publicId, type);
    }

    const record = await PageMedia.findOneAndUpdate(
      { page, slot, type },
      {
        filename: result.public_id,
        originalName: req.file.originalname,
        url: result.secure_url,
        publicId: result.public_id,
        size: req.file.size,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, media: record });
  } catch (err) {
    res.status(500).json({ success: false, message: `Upload failed: ${err.message}` });
  }
});

// ── Admin: delete media for a slot ───────────────────────────────────────────
router.delete('/:id', flexAdmin, async (req, res) => {
  try {
    const record = await PageMedia.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Media not found.' });

    if (record.publicId) {
      await deleteFromCloudinary(record.publicId, record.type);
    }
    await record.deleteOne();

    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
