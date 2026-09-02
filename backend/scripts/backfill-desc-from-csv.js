// Manual runner: fill all missing opportunity descriptions from SAM.gov's
// public daily CSV extract (no API key, no quota). Safe to run any time.
//
// Usage (from backend/): node scripts/backfill-desc-from-csv.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();
dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = process.env.MONGO_URI_OVERRIDE || process.env.MONGO_URI_API;
if (!uri) { console.error('MONGO_URI_API not set - run from the backend/ folder'); process.exit(1); }

await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000 });
console.log('✅ Connected to MongoDB');

const { backfillDescriptionsFromCsv } = await import('../services/samCsvService.js');
const result = await backfillDescriptionsFromCsv();
console.log('Result:', result);

await mongoose.disconnect();
process.exit(0);
