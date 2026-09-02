// One-time cleanup: the plans collection got duplicates (auto-seeded defaults +
// migrated originals from the old cluster). For each plan name, keep the OLDEST
// document (the migrated original with the real production pricing) and delete
// the newer auto-seeded duplicate.
//
// Usage (from backend/): node scripts/dedupe-plans.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI_API);
const col = mongoose.connection.db.collection('plans');

const all = await col.find({}).toArray();
const byName = {};
for (const p of all) (byName[p.name] = byName[p.name] || []).push(p);

let removed = 0;
for (const [name, docs] of Object.entries(byName)) {
  if (docs.length < 2) continue;
  // keep the oldest (ObjectId timestamps sort chronologically)
  docs.sort((a, b) => String(a._id).localeCompare(String(b._id)));
  const keep = docs[0];
  const drop = docs.slice(1);
  const r = await col.deleteMany({ _id: { $in: drop.map(d => d._id) } });
  removed += r.deletedCount;
  console.log(`${name}: kept $${keep.monthlyPrice} (oldest), removed ${r.deletedCount} duplicate(s)`);
}

console.log(`\nDone - removed ${removed} duplicates. Final plans:`);
(await col.find({}).toArray()).forEach(p => console.log(`  ${p.name} - $${p.monthlyPrice}/mo`));
await mongoose.disconnect();
process.exit(0);
