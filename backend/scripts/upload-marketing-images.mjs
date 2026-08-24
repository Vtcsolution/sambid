import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, "..", "..", "frontend", "Web_Pages_Frontend", "WEB VISUALS");

// Round 4: additional crops needed to stop repeating the same image across
// a whole page (contract-opportunities, deadline-calendar, past-award-
// analysis, sources-sought all need real alternates).
const FILES = ["8.png", "10.png", "16.png", "17.png", "21.png"];

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
