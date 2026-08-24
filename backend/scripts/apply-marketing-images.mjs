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

  console.log("Fully-verified rebuild (every file re-checked against its actual content)...\n");

  // 4 steps: Auto-matched / AI Match Score / Smart Filters / One-click detail
  // No genuine "match score closeup" or "detail page" screenshot exists —
  // left honestly empty rather than repeating the feed shot a 3rd/4th time.
  await setFeatureImages("contract-opportunities", "9.png", ["10.png", null, "11.png", null]);

  // 3 steps: All deadlines / Color-coded urgency / Calendar sync
  await setFeatureImages("deadline-calendar", "3.png", ["15.png", "16.png", "17.png"]);

  // 3 steps: AI fetches real competitors / Scoring matrix / Win probability + bid range
  // step3 now uses the REAL Go/No-Go results screenshot (14), not 13 (which
  // is actually just the input form, mislabeled in an earlier pass).
  await setFeatureImages("bid-analysis", "4.png", ["6.png", "4.png", "14.png"]);

  // 3 steps: Search by NAICS / See actual winners / Benchmark pricing
  await setFeatureImages("past-award-analysis", "6.png", ["21.png", "6.png", null]);

  // 3 steps: NAICS-based matching / AI match scoring / Choose your frequency
  await setFeatureImages("matched-opportunities", "2.png", ["2.png", "9.png", null]);

  // 3 steps: Select from saved/feed / AI analyzes 4 data sources / 10-factor scoring
  // Now genuinely 3 distinct real states: empty select (12) -> opportunity
  // chosen (13) -> real AI results with Summary Recommendation (14).
  await setFeatureImages("go-no-go", "12.png", ["12.png", "13.png", "14.png"]);

  // 3 steps: Select or enter opportunity / AI generates 8-section response / Submit early
  // Only ONE real Sources Sought screenshot exists (1.png already shows both
  // the form AND the "response will include" list) — 10.png was wrongly
  // assigned here before (it's actually a Contract Opportunities crop).
  await setFeatureImages("sources-sought", "1.png", ["1.png", null, null]);

  // 3 steps: Select opportunity / AI generates 7 sections / Export branded PDF
  await setFeatureImages("proposal-builder", "25.png", ["24.png", "7.png", "26.png"]);

  // 3 steps: Click AI Summarize / Get structured analysis / Fit assessment
  await setFeatureImages("ai-summarize", "22.png", ["19.png", "23.png", "20.png"]);

  // 3 steps: select/paste/upload / AI parses document / compliance checklist
  await setFeatureImages("rfp-analyzer", "19.png", ["22.png", "23.png", "20.png"]);

  // 3 steps: Analyzes full SOW / 7 risk categories / Evidence-based ratings
  await setFeatureImages("risk-assessment", "19.png", ["22.png", "19.png", "23.png"]);

  console.log("\nAll done.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
