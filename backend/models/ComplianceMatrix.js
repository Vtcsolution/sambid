// backend/models/ComplianceMatrix.js
// Maps an RFP's extracted requirements to the AI-generated proposal sections
// that address them — the standard "compliance matrix" artifact expected in
// real federal proposals, wiring together RFP Analyzer's extraction and
// Proposal Builder's output instead of leaving the user to cross-reference
// the two by hand.
import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  mandatory: { type: Boolean, default: true },
  category:  { type: String, default: '' }, // e.g. "Technical", "Management", "Past Performance"
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  content: { type: String, default: '' },
}, { _id: false });

const mappingSchema = new mongoose.Schema({
  requirementIndex: { type: Number, required: true }, // index into requirements[]
  sectionTitle:      { type: String, default: '' },   // '' when status is 'missing'
  status:            { type: String, enum: ['covered', 'partial', 'missing'], required: true },
  note:              { type: String, default: '' },
}, { _id: false });

const complianceMatrixSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },

  requirements: [requirementSchema],
  sections:     [sectionSchema],
  mapping:      [mappingSchema],

  overallCoveragePct: { type: Number, default: 0 },
  docsAnalyzed:        { type: Number, default: 0 },
}, { timestamps: true });

// One matrix per user+opportunity — regenerating replaces the previous one.
complianceMatrixSchema.index({ user: 1, opportunity: 1 }, { unique: true });

export default mongoose.model('ComplianceMatrix', complianceMatrixSchema);
