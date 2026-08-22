import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import PageMedia from "../models/PageMedia.js";
import FeatureShowcase from "../models/FeatureShowcase.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const urls = JSON.parse(fs.readFileSync(path.join(__dirname, "marketing-image-urls.json"), "utf8"));
const img = (file) => {
  const r = urls[file];
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
  console.log("Connected. Applying home page phase images...");

  // ---- Home page: 7 Phases section ----
  await upsertPageMedia("home", "phase_01", "17.png"); // Find Every Opportunity
  await upsertPageMedia("home", "phase_02", "20.png"); // Deep Search / full details
  await upsertPageMedia("home", "phase_03", "36.png"); // Deadline Calendar
  await upsertPageMedia("home", "phase_04", "13.png"); // AI Predictions / Win Probability
  await upsertPageMedia("home", "phase_05", "7.png");  // Teaming Partners
  await upsertPageMedia("home", "phase_06", "15.png"); // Past Performance Intelligence
  await upsertPageMedia("home", "phase_07", "9.png");  // AI Proposal Writing

  console.log("Applying Features.jsx grid images...");
  // ---- Features.jsx: feature_01..12 grid (skip 10/11/12, no matching screenshot) ----
  await upsertPageMedia("features", "feature_01", "17.png"); // Opportunity Discovery
  await upsertPageMedia("features", "feature_02", "4.png");  // Smart Alerts
  await upsertPageMedia("features", "feature_03", "34.png"); // Deadline Calendar
  await upsertPageMedia("features", "feature_04", "6.png");  // AI Win Predictions
  await upsertPageMedia("features", "feature_05", "24.png"); // AI Proposal Writer
  await upsertPageMedia("features", "feature_06", "30.png"); // RFP Analyzer
  await upsertPageMedia("features", "feature_07", "27.png"); // Past Performance Intelligence
  await upsertPageMedia("features", "feature_08", "14.png"); // Teaming Finder
  await upsertPageMedia("features", "feature_09", "15.png"); // Market Research

  console.log("Applying FeatureShowcase individual pages...");
  // ---- FeatureShowcase: fixing broken slugs ----
  await updateFeature("contract-opportunities", "17.png", ["18.png", "3.png", "19.png", "20.png"]);
  await updateFeature("deadline-calendar", "36.png", ["35.png", "33.png", "5.png"]);
  await updateFeature("ai-summarize", "28.png", ["28.png", "29.png", "31.png"]);
  await updateFeature("bid-analysis", "6.png", ["6.png", "13.png", "13.png"]);
  await updateFeature("go-no-go", "21.png", ["21.png", "22.png", "23.png"]);
  await updateFeature("proposal-builder", "9.png", ["9.png", "24.png", "26.png"]);

  // ---- FeatureShowcase: populating previously-empty slugs with real content ----
  await updateFeature("rfp-analyzer", "30.png", ["30.png", "29.png", "32.png"]);
  await updateFeature("sources-sought", "1.png", ["2.png", "10.png", "1.png"]);
  await updateFeature("teaming-finder", "7.png", ["14.png", "7.png", "14.png"]);
  await updateFeature("past-award-analysis", "8.png", ["15.png", "27.png", "8.png"]);
  await updateFeature("matched-opportunities", "4.png", ["4.png", "3.png", "4.png"]);

  console.log("\nAll done.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
