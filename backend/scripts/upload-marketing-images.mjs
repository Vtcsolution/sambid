import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..", "..", "frontend", "Web_Pages_Frontend", "WEB VISUALS");

// Round 5: the real Go/No-Go results screenshot (14 — previously mislabeled
// as 13 in earlier notes), a 2nd Deadline Calendar crop (15), and the
// AI-Credits Proposal Builder crop (24).
const FILES = ["14.png", "15.png", "24.png"];

const outFile = path.join(__dirname, "marketing-image-urls-v3.json");
const results = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : {};

for (const file of FILES) {
  const full = path.join(SRC_DIR, file);
  if (!fs.existsSync(full)) { console.error("MISSING:", full); continue; }
  process.stdout.write(`Uploading ${file} ... `);
  const res = await cloudinary.uploader.upload(full, {
    folder: "sambid/marketing",
    public_id: "web-visual-v3-" + file.replace(/\.png$/, ""),
    resource_type: "image",
    overwrite: true,
  });
  results[file] = { url: res.secure_url, publicId: res.public_id };
  console.log("OK ->", res.secure_url);
}

fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
console.log("\nDone. Saved", Object.keys(results).length, "total URLs to marketing-image-urls-v3.json");
