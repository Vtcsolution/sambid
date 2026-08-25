import mongoose from 'mongoose';

// Singleton lock, same pattern as HowItWorksContent — one document controls
// whether the Testimonials nav link and public page are visible site-wide.
const testimonialSettingsSchema = new mongoose.Schema({
  key:       { type: String, default: 'main', unique: true },
  isEnabled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('TestimonialSettings', testimonialSettingsSchema);
