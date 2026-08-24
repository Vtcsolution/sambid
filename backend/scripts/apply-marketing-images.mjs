import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import PageMedia from "../models/PageMedia.js";
import FeatureShowcase from "../models/FeatureShowcase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const urlsV2 = JSON.parse(fs.readFileSync(path.join(__dirname, "marketing-image-urls.json"), "utf8"));
const urlsV3 = JSON.parse(fs.readFileSync(path.join(__dirname, "marketing-image-urls-v3.json"), "utf8"));
const img = (file) => {
  if (!file) return null;
  const r = urlsV3[file] || urlsV2[file];
  if (!r) throw new Error("No uploaded URL for " + file);
  return r;
};

// Rewrites the WHOLE image set for a feature — thumbnail + every step —
// instead of layering partial updates on top of the old repeated-image
// state. `stepFiles` entries may be null: that step is deliberately left
// with no image (falls back to the existing numbered-circle placeholder)
// rather than repeating a screenshot that doesn't really depict that step.
async function setFeatureImages(slug, thumbFile, stepFiles) {
  const feature = await FeatureShowcase.findOne({ slug });
  if (!feature) { console.warn("  !! no FeatureShowcase doc for slug:", slug); return; }
  feature.thumbnailUrl = img(thumbFile)?.url || '';
  stepFiles.forEach((file, i) => {
    if (feature.steps[i]) feature.steps[i].imageUrl = img(file)?.url || '';
  });
  await feature.save();
  const used = new Set([thumbFile, ...stepFiles].filter(Boolean));
  console.log(`  ${slug} -> thumb ${thumbFile || '(none)'}, steps [${stepFiles.map(f => f || '-').join(', ')}] (${used.size} unique images)`);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI_API);

  console.log("Rewriting every page that had the same image repeated across the whole page...\n");

  // 4 steps: Auto-matched / AI Match Score / Smart Filters / One-click detail
  await setFeatureImages("contract-opportunities", "9.png", ["8.png", "9.png", "11.png", null]);

  // 3 steps: Select opportunity / AI generates 7 sections / Export branded PDF
  await setFeatureImages("proposal-builder", "25.png", ["25.png", null, "26.png"]);

  // 3 steps: AI fetches real competitors / Scoring matrix / Win probability + bid range
  await setFeatureImages("bid-analysis", "4.png", ["6.png", "4.png", "13.png"]);

  // 3 steps: Search by NAICS code / See actual winners / Benchmark pricing
  await setFeatureImages("past-award-analysis", "6.png", ["21.png", "6.png", "21.png"]);

  // 3 steps: NAICS-based matching / AI match scoring / Choose your frequency
  await setFeatureImages("matched-opportunities", "2.png", ["2.png", "9.png", null]);

  // 3 steps: All deadlines in one view / Color-coded urgency / Calendar sync
  await setFeatureImages("deadline-calendar", "3.png", ["3.png", "16.png", "17.png"]);

  // 3 steps: Select from saved or feed / AI analyzes 4 data sources / 10-factor scoring
  await setFeatureImages("go-no-go", "12.png", ["12.png", "13.png", "13.png"]);

  // 3 steps: Select or enter opportunity / AI generates 8-section response / Submit early
  await setFeatureImages("sources-sought", "1.png", ["2.png", "10.png", null]);

  // 3 steps: Search by NAICS & certifications / View partner profiles / Request teaming
  // Only one real Teaming Finder screenshot exists in this batch — thumb +
  // step 1 use it, the rest stay on the honest numbered placeholder.
  await setFeatureImages("teaming-finder", "5.png", ["5.png", null, null]);

  console.log("\nAll done.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
