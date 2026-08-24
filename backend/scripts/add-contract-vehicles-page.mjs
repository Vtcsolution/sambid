import "dotenv/config";
import mongoose from "mongoose";
import FeatureShowcase from "../models/FeatureShowcase.js";

// Real content matching the actual ContractVehicles.jsx dashboard page and
// contractVehicleController.js eligibility logic built earlier this project —
// not fabricated. No screenshot exists for this page yet, so it uses the
// existing icon-placeholder fallback like the other unphotographed pages.
const doc = {
  slug: "contract-vehicles",
  title: "Contract Vehicle Tracker",
  subtitle: "Track your GWACs, IDIQs, and GSA Schedules — get expiry alerts and real eligibility checks",
  videoUrl: "",
  thumbnailUrl: "",
  steps: [
    {
      title: "Quick Add common vehicles",
      description: "One click to add GSA MAS, SEWP V, CIO-SP3, Alliant 2 Small Business, 8(a) STARS III, VETS 2, OASIS+, DISA SITE III, Army ITES-3S, or NITAAC CIO-CS to your tracked list.",
    },
    {
      title: "Or add any custom vehicle",
      description: "Type (GWAC, IDIQ, BPA, or GSA Schedule), On-Ramp Status, Ceiling Value, expiry date, Eligible NAICS Codes, and Eligible Set-Asides — real structure, not just a name and date.",
    },
    {
      title: "Real eligibility check against your profile",
      description: "The moment you save it, Sambid checks it against your actual NAICS codes and active certifications — \"You Likely Qualify\" in green, \"May Not Qualify Yet\", or an honest \"add eligibility info to check\" instead of guessing.",
    },
    {
      title: "Color-coded expiry countdown",
      description: "Red under 30 days, yellow under 90, green if you're safe — so you always know exactly how much runway you have left on every vehicle you hold, and never miss an on-ramp window again.",
    },
  ],
  benefits: [
    "The big vehicles work like exclusive clubs — miss the on-ramp window and you can be locked out for 5-10 years",
    "Real eligibility scoring against your actual certifications, not a generic checklist",
    "Never hear about an open door after it already closed",
    "One dashboard for every vehicle you hold or are chasing",
  ],
  ctaText: "Try It Free",
  ctaLink: "/signup",
  isActive: true,
  order: 18,
  icon: "Building2",
  color: "indigo",
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI_API);
  const created = await FeatureShowcase.create(doc);
  console.log("Created FeatureShowcase:", created.slug, "-> /features/" + created.slug);
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
