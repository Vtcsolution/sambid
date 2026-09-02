import mongoose from 'mongoose';

// A single client testimonial - admin-uploaded photo/video plus a text
// quote. Shown on the public /testimonials page only when
// TestimonialSettings.isEnabled is true (see TestimonialSettings.js).
const testimonialSchema = new mongoose.Schema({
  clientName:     { type: String, required: true, trim: true },
  company:        { type: String, default: '', trim: true },
  role:           { type: String, default: '', trim: true }, // e.g. "CEO", "Founder"
  quote:          { type: String, required: true },
  rating:         { type: Number, min: 1, max: 5, default: 5 },
  imageUrl:       { type: String, default: '' },
  imagePublicId:  { type: String, default: '' },
  videoUrl:       { type: String, default: '' },
  videoPublicId:  { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  order:          { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Testimonial', testimonialSchema);
