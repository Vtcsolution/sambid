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
  const r = urlsV3[file] || urlsV2[file];
  if (!r) throw new Error("No uploaded URL for " + file);
  return r;
};

async function upsertPageMedia(page, slot, file) {
  const { url, publicId } = img(file);
  await PageMedia.findOneAndUpdate(
    { page, slot, type: "image" },
    { page, slot, type: "image", url, publicId, filename: file, originalName: file, size: 0 },
    { upsert: true, new: true }
  );
  console.log(`  PageMedia ${page}/${slot} -> ${file}`);
}

async function updateFeature(slug, thumbFile, stepFiles) {
  const feature = await FeatureShowcase.findOne({ slug });
  if (!feature) { console.warn("  !! no FeatureShowcase doc for slug:", slug); return; }
  feature.thumbnailUrl = img(thumbFile).url;
  stepFiles.forEach((file, i) => {
    if (feature.steps[i] && file) feature.steps[i].imageUrl = img(file).url;
  });
  await feature.save();
  console.log(`  FeatureShowcase ${slug} -> thumb ${thumbFile}, ${stepFiles.length} steps`);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI_API);

  console.log("Refining home page phase_02 (better Smart Filters match)...");
  await upsertPageMedia("home", "phase_02", "11.png");

  console.log("Refining Features.jsx grid (feature_01 quality upgrade, feature_06 RFP Analyzer now populated)...");
  await upsertPageMedia("features", "feature_01", "9.png");
  await upsertPageMedia("features", "feature_06", "19.png");

  console.log("Refreshing contract-opportunities with richer screenshots...");
  await updateFeature("contract-opportunities", "9.png", ["9.png", "9.png", "11.png", "9.png"]);

  console.log("Refreshing proposal-builder with fuller crops...");
  await updateFeature("proposal-builder", "25.png", ["25.png", "25.png", "26.png"]);

  console.log("Populating previously-broken ai-summarize...");
  await updateFeature("ai-summarize", "19.png", ["19.png", "23.png", "20.png"]);

  console.log("Populating previously-broken go-no-go...");
  await updateFeature("go-no-go", "12.png", ["12.png", "12.png", "13.png"]);

  console.log("Populating previously-broken rfp-analyzer...");
  await updateFeature("rfp-analyzer", "22.png", ["22.png", "19.png", "20.png"]);

  console.log("Populating previously-EMPTY risk-assessment...");
  await updateFeature("risk-assessment", "19.png", ["22.png", "19.png", "23.png"]);

  console.log("\nAll done.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
