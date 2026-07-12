// One-time cleanup: remove fake SAMPLE_* opportunities (dev seed data) and any
// feed/saved references to them. Production should only ever hold real SAM.gov
// records — the sample seeding is now dev-only (NODE_ENV !== 'production').
//
// Usage: node scripts/remove-sample-opps.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI_API);
const db = mongoose.connection.db;

const samples = await db.collection('opportunities')
  .find({ sourceId: /^SAMPLE_/ }).project({ _id: 1, title: 1 }).toArray();
console.log(`Found ${samples.length} sample records:`);
samples.forEach(s => console.log('  -', s.title));

const ids = samples.map(s => s._id);
const uo = await db.collection('useropportunities').deleteMany({ opportunity: { $in: ids } });
const so = await db.collection('savedopportunities').deleteMany({ opportunity: { $in: ids } });
const op = await db.collection('opportunities').deleteMany({ _id: { $in: ids } });

console.log(`Deleted — opportunities: ${op.deletedCount} | feed entries: ${uo.deletedCount} | saved: ${so.deletedCount}`);
console.log('Opportunities remaining:', await db.collection('opportunities').countDocuments());
await mongoose.disconnect();
