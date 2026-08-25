import Testimonial from '../models/Testimonial.js';
import TestimonialSettings from '../models/TestimonialSettings.js';
import { deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

const getOrCreateSettings = async () => {
  let settings = await TestimonialSettings.findOne({ key: 'main' });
  if (!settings) settings = await TestimonialSettings.create({ key: 'main' });
  return settings;
};

// ── Public: is the Testimonials nav link / page enabled? ─────────────────────
export const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: { isEnabled: settings.isEnabled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: update the toggle ──────────────────────────────────────────────────
export const updateSettings = async (req, res) => {
  try {
    const settings = await TestimonialSettings.findOneAndUpdate(
      { key: 'main' },
      { isEnabled: !!req.body.isEnabled },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: { isEnabled: settings.isEnabled } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Public: active testimonials — empty when the toggle is off ───────────────
export const getPublicTestimonials = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    if (!settings.isEnabled) {
      return res.json({ success: true, enabled: false, data: [] });
    }
    const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, enabled: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: list all (including inactive) ──────────────────────────────────────
export const adminListTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: create ─────────────────────────────────────────────────────────────
export const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: update ─────────────────────────────────────────────────────────────
export const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    res.json({ success: true, data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: delete (and clean up Cloudinary assets) ────────────────────────────
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found.' });
    if (testimonial.imagePublicId) await deleteFromCloudinary(testimonial.imagePublicId, 'image');
    if (testimonial.videoPublicId) await deleteFromCloudinary(testimonial.videoPublicId, 'video');
    res.json({ success: true, message: 'Testimonial deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
