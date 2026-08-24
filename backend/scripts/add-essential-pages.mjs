import "dotenv/config";
import mongoose from "mongoose";
import FeatureShowcase from "../models/FeatureShowcase.js";

// Two real, substantial Sambid features with zero page representation until
// now. Content matches the actual dashboard pages (CompanyProfile.jsx,
// TeamManagement.jsx, DocumentLibrary.jsx, ManagedServicePage.jsx) reviewed
// and worked on earlier this project — not fabricated. No screenshots exist
// yet, so both use the existing icon-placeholder fallback.
const docs = [
  {
    slug: "company-workspace",
    title: "Company Workspace",
    subtitle: "The single shared source of truth every AI feature reads from — UEI verified, certifications tracked, team and documents in one place",
    videoUrl: "",
    thumbnailUrl: "",
    steps: [
      {
        title: "Verify your UEI live against SAM.gov",
        description: "Enter your 12-character Unique Entity ID and CAGE code — Sambid verifies it live against SAM.gov and pulls in your legal business name and registration status.",
      },
      {
        title: "Track certifications, NAICS codes, and capabilities",
        description: "8(a), WOSB, EDWOSB, HUBZone, SDVOSB, VOSB, SDB — with expiry alerts at 90/60/30 days before any certification lapses.",
      },
      {
        title: "Invite your team with real roles",
        description: "Admin, Capture Manager, Proposal Writer, Reviewer, or Member — each role controls exactly which pages that person can see and edit.",
      },
      {
        title: "One Document Library for the whole team",
        description: "Proposals, past performance, capability statements, and templates — searchable, categorized, and commentable, so nothing lives buried in someone's inbox.",
      },
    ],
    benefits: [
      "Fill it out once — every AI feature (matching, proposals, bid analysis, teaming) reads from this one accurate source",
      "Never generic, never copy-paste — every AI output is grounded in your real company data",
      "Certification expiry alerts mean you never lose eligibility for a bid without knowing",
      "Team roles mean the right people see the right pages, nothing more",
    ],
    ctaText: "Try It Free",
    ctaLink: "/signup",
    isActive: true,
    order: 19,
    icon: "Building2",
    color: "indigo",
  },
  {
    slug: "managed-service",
    title: "Managed Service",
    subtitle: "Let Sambid's own team find, write, and submit your bids — commission billed only as the government pays, no win no fee",
    videoUrl: "",
    thumbnailUrl: "",
    steps: [
      {
        title: "Apply and get reviewed within 24-48 hours",
        description: "Our team reviews your company profile, NAICS codes, and certifications before confirming your commission rate.",
      },
      {
        title: "We find and write real bids for you",
        description: "Our team identifies matching SAM.gov opportunities, writes and submits professional proposals using your real past performance — not generic templates.",
      },
      {
        title: "Win, and delivery starts immediately",
        description: "The moment you win, a fulfillment project is created automatically with milestones tracked right in your dashboard — no waiting around.",
      },
      {
        title: "Commission billed per milestone, not all at once",
        description: "As the government pays for each milestone of the contract, we invoice our commission for just that portion — never a surprise lump-sum bill at win time.",
      },
    ],
    benefits: [
      "No win, no fee — our success is tied directly to yours",
      "Real SAM.gov opportunities matched to your actual capabilities and set-aside eligibility, not generic leads",
      "Professional proposal writing by GovCon experts using your verified company data",
      "Full visibility the whole way: bid status, documents, and milestone payments in real time",
    ],
    ctaText: "Try It Free",
    ctaLink: "/signup",
    isActive: true,
    order: 20,
    icon: "Trophy",
    color: "amber",
  },
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI_API);
  for (const doc of docs) {
    const created = await FeatureShowcase.create(doc);
    console.log("Created:", created.slug, "-> /features/" + created.slug);
  }
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
