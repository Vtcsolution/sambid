import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..", "..", "frontend", "Web_Pages_Frontend", "WEB VISUALS");

// Every unique screenshot actually used across home/features/FeatureShowcase.
const FILES = [
  "1.png", "2.png", "3.png", "4.png", "5.png", "6.png", "7.png", "8.png",
  "9.png", "10.png", "13.png", "14.png", "15.png", "17.png", "18.png",
  "19.png", "20.png", "21.png", "22.png", "23.png", "24.png", "26.png",
  "27.png", "28.png", "29.png", "30.png", "31.png", "32.png", "33.png",
  "34.png", "35.png", "36.png",
];

const results = {};

for (const file of FILES) {
  const full = path.join(SRC_DIR, file);
  if (!fs.existsSync(full)) { console.error("MISSING:", full); continue; }
  process.stdout.write(`Uploading ${file} ... `);
  const res = await cloudinary.uploader.upload(full, {
    folder: "sambid/marketing",
    public_id: "web-visual-" + file.replace(/\.png$/, ""),
    resource_type: "image",
    overwrite: true,
  });
  results[file] = { url: res.secure_url, publicId: res.public_id };
  console.log("OK ->", res.secure_url);
}

fs.writeFileSync(path.join(__dirname, "marketing-image-urls.json"), JSON.stringify(results, null, 2));
console.log("\nDone. Saved", Object.keys(results).length, "URLs to marketing-image-urls.json");
