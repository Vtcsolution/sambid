// backend/models/PageView.js
// Anonymous website traffic tracking for the admin dashboard. No PII, no raw
// IP addresses stored — the IP is resolved to a country at request time and
// then discarded.
import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  path:       { type: String, required: true },
  sessionId:  { type: String, required: true }, // anonymous, client-generated, no PII
  country:      { type: String, default: 'Unknown' },   // ISO code, e.g. "US"
  countryName:  { type: String, default: 'Unknown' },
  device:     { type: String, enum: ['desktop', 'mobile', 'tablet', 'unknown'], default: 'unknown' },
  browser:    { type: String, default: 'Unknown' },
  os:         { type: String, default: 'Unknown' },
  referrer:   { type: String, default: '' },
  durationSeconds: { type: Number, default: 0 }, // updated via sendBeacon when the visitor leaves the page
}, { timestamps: true });

pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ sessionId: 1, createdAt: -1 });
pageViewSchema.index({ path: 1 });

const PageView = mongoose.model('PageView', pageViewSchema);
export default PageView;
