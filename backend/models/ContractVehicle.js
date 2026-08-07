// backend/models/ContractVehicle.js
// A federal contract vehicle (GWAC/IDIQ/BPA/GSA Schedule) the user holds or
// is tracking. Previously this page only saved to browser localStorage —
// nothing tied to the account, nothing that synced across devices.
import mongoose from 'mongoose';

const contractVehicleSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:       { type: String, required: true },
  acronym:    { type: String, default: '' },
  agency:     { type: String, default: '' },
  type:       { type: String, enum: ['GWAC', 'IDIQ', 'BPA', 'GSA Schedule', 'Other'], default: 'Other' },
  onRampStatus: { type: String, enum: ['open', 'closed', 'upcoming', 'unknown'], default: 'unknown' },
  ceilingValue: { type: Number, default: null },
  // What the vehicle itself requires — compared against the user's real
  // NAICS codes and certifications to flag likely eligibility. Left blank
  // means "not enough info to judge" rather than a false negative.
  eligibleNaicsCodes: [{ type: String }],
  eligibleSetAsides:  [{ type: String }], // e.g. '8(a)', 'SDVOSB', 'WOSB', 'HUBZone', 'Small Business'
  expiryDate: { type: Date, default: null },
  notes:      { type: String, default: '' },
}, { timestamps: true });

contractVehicleSchema.index({ user: 1 });

export default mongoose.model('ContractVehicle', contractVehicleSchema);
