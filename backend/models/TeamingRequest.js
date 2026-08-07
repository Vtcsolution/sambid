// backend/models/TeamingRequest.js
// A real record of one user asking another to team up on a federal contract
// (Teaming Partner Finder, Enterprise). Backs the "Send Teaming Request"
// button — previously that button only faked success client-side.
import mongoose from 'mongoose';

const teamingRequestSchema = new mongoose.Schema({
  from:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  naicsCode: { type: String, default: '' }, // which NAICS search led to this match, for context
  message:   { type: String, default: '' },
  status:    { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
}, { timestamps: true });

// One pending request per pair at a time - re-requesting after decline is fine
teamingRequestSchema.index({ from: 1, to: 1, status: 1 });

export default mongoose.model('TeamingRequest', teamingRequestSchema);
