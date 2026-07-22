import mongoose from 'mongoose';

// Public "Problems" pages — one per pain point (17 total), each built around
// a short escalating timeline (trigger -> frequency/stakes -> consequence)
// followed by the Sambid fix and an optional YouTube video + thumbnail.
const problemShowcaseSchema = new mongoose.Schema({
  slug:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  num:      { type: String, default: '' }, // "01".."17", display only
  title:    { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },

  video:          { type: String, default: '' }, // YouTube link only
  videoThumbnail: { type: String, default: '' }, // URL or uploaded image

  // The escalating timeline shown as growing circles down a vertical line —
  // small first point, growing larger toward the consequence.
  timelinePoints: [{ type: String }],

  solveTitle: { type: String, default: 'How Sambid Solves It' },
  solve:      { type: String, default: '' },

  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

problemShowcaseSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('ProblemShowcase', problemShowcaseSchema);
