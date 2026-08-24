import "dotenv/config";
import mongoose from "mongoose";
import FeatureShowcase from "../models/FeatureShowcase.js";

// Rewrites every page's step descriptions (and a few titles) in plain,
// everyday language — same facts, no jargon left unexplained. Subtitles are
// left as-is (already short and clear); this focuses on the step-by-step
// copy, which is where the acronym-heavy phrasing was hardest to follow.
const updates = {
  "contract-opportunities": [
    "Every hour, we check SAM.gov for brand-new contracts and match them against the exact NAICS codes your business is registered under — no manual searching required.",
    "See it live on your dashboard: every matched opportunity lands in your Top Matches list with a real percentage score, so you know instantly which ones are actually worth your time, before you even click in.",
    "A full search panel, not just a keyword box: filter by industry code, city or state, how soon it's due, notice type, set-aside, agency, contract value, and more — stack as many filters as you need and the list narrows instantly.",
    "Click any contract to see everything in one place: the full details, an AI-written summary in plain English, and direct links to every document — no more digging around on SAM.gov to find what you need.",
  ],
  "deadline-calendar": [
    "One calendar showing every deadline from every contract you're tracking — nothing to type in yourself, it fills in automatically.",
    "Each deadline is color-coded so you know how urgent it is at a glance: red means 3 days or less, orange means a week or less, yellow means two weeks or less, green means you've still got time.",
    "One click downloads a file you can import straight into Google Calendar, Outlook, or Apple Calendar — so your deadlines show up wherever you already look.",
  ],
  "past-award-analysis": [
    "Type in any industry code and instantly see 3-5 years of real contracts the government has already awarded in that space.",
    "See exactly who won — real company names, how much they were paid, and which agency awarded it, all pulled straight from USASpending.gov, the government's own public spending records.",
    "Know what the going rate actually is before you write your bid, instead of guessing a number and hoping it's competitive.",
  ],
  "saved-opportunities": [
    "See a contract you like? Click \"Save to My List\" from anywhere on the site and it's yours to track.",
    "Move each saved contract through simple stages as you work it: Saved, Researching, Drafting, Submitted, Won or Lost — so you always know where things stand.",
    "Anything you've saved shows up automatically inside Go/No-Go, the Proposal Builder, and every other AI tool — no re-entering the same contract twice.",
  ],
  "matched-opportunities": [
    "Every hour, we check SAM.gov against the exact industry codes your business is registered under — so new matches show up without you lifting a finger.",
    "Every match gets a clear score from 0 to 100%, so you can tell at a glance how good a fit it really is for your company.",
    "Pick how often you want to hear from us: instant alerts, a daily digest, or a weekly summary — whatever fits how you work.",
  ],
  "ai-summarize": [
    "Click one button on any contract and the AI reads the entire posting for you — every page of it, not just the short summary.",
    "In seconds you get a clear breakdown: what the work actually involves, what you need to submit, how the government will judge it, who to contact, and anything that looks like a red flag.",
    "The AI checks your industry codes, certifications, and past wins against this specific contract and gives you an honest read on whether it's actually a good fit for your company.",
  ],
  "bid-analysis": [
    "The AI pulls 25 real, recent contract awards in your exact industry — actual companies, actual dollar amounts — so you're not guessing who you're up against.",
    "Eight different factors get scored, from how well you match the requirements to how much competition you're likely facing, so you can see exactly where you stand and why.",
    "You get a real win percentage and a suggested price range, both grounded in what similar contracts have actually gone for — not a guess.",
  ],
  "proposal-builder": [
    "Pick a contract from your saved list, or enter the details — either way, everything about it loads in automatically, no retyping.",
    "The AI writes all seven required sections for you — Cover Letter, Executive Summary, Technical Approach, Management Plan, Past Performance, Pricing, and Conclusion — using your company's real information, not a generic template.",
    "Pick a color theme and download a polished, professional PDF, ready to review and submit.",
  ],
  "go-no-go": [
    "Pick any contract you're tracking, and every piece of information about it — including the full scope of work — loads automatically. Nothing to copy and paste.",
    "The AI looks at four real sources at once: the full contract from SAM.gov, real competitor data, your company profile, and your own past wins.",
    "Ten different factors get scored with real evidence behind each one, adding up to a clear total and a straightforward recommendation — plus exactly what to do next.",
  ],
  "competitive-analysis": [
    "The AI pulls real companies that have actually won contracts in your industry — how many they've won and how much money it added up to — straight from public government spending records.",
    "For each competitor, see how many contracts they've won, their total dollar volume, which agencies they work with, and how big a threat they really are to you.",
    "See where you're stronger than the competition, where they have the edge, gaps in the market nobody's filling yet, and who might be worth teaming up with instead of competing against.",
  ],
  "risk-assessment": [
    "The AI reads the complete scope of work and requirements for the contract — not just the title, the whole thing.",
    "Seven different types of risk get checked — things like technical difficulty, budget, timeline, competition, paperwork compliance, and your ability to actually deliver — each rated Low, Medium, or High.",
    "Every single rating comes with real evidence behind it: your past contract sizes, how dominant the competition looks, and whether the timeline is realistic for your team.",
  ],
  "rfp-analyzer": [
    "Pick a saved contract, paste in the text, or upload the RFP file directly — an RFP is just the government's formal document laying out exactly what they want and how they'll judge it.",
    "The AI reads the entire document and pulls out everything that matters: the must-have requirements, how you'll be scored, key dates, and any certifications you'll need.",
    "You get a clear checklist of 15-20 specific things your proposal has to cover, plus a straightforward go-or-no-go recommendation.",
  ],
  "capability-statement": [
    "Fill in your certifications (like 8(a), WOSB, or HUBZone), what your company is best at, and a few highlights from past work.",
    "The AI turns that into a clean, professional one-page document with your industry codes, what sets you apart, and your contact information — formatted the way contracting officers expect to see it.",
    "Copy it or download it as a PDF, ready to hand out at industry events or agency meetings.",
  ],
  "sources-sought": [
    "Pick a saved Sources Sought notice or enter the details yourself — a Sources Sought notice is the government quietly asking \"who out there can do this?\" before the real contract is even posted.",
    "The AI writes a complete, professional response covering who you are, your relevant experience, your approach, and your interest — all eight sections the government expects to see.",
    "Respond early and you get noticed by the agency before most of your competitors even know the opportunity exists.",
  ],
  "bid-pipeline": [
    "Save a contract you're interested in and it automatically becomes a card on your pipeline board — nothing extra to set up.",
    "Drag each card through the stages as you work it: Saved, Researching, Drafting, Submitted, Won or Lost — a visual snapshot of everything you're working on at once.",
    "See your real conversion rate — how many bids you've submitted versus how many you've actually won — so you know if your strategy is working.",
  ],
  "past-performance": [
    "Enter each past contract once: the title, the agency, the dollar value, the dates, your role, and your performance rating.",
    "One click turns that into an SF-330 citation — the exact format the government expects for past performance references — ready to paste straight into any proposal.",
    "Every AI tool on the platform automatically pulls from your stored history, so you never have to dig up the same project details twice.",
  ],
  "teaming-finder": [
    "Search for real businesses with the industry codes and certifications that complement yours — the pieces you're missing to go after bigger contracts.",
    "See each potential partner's real profile: their company name, industry codes, certifications, and how to reach them.",
    "Reach out directly, right inside the platform, for a joint venture, a mentor-protégé arrangement, or a straightforward prime-sub relationship.",
  ],
  "contract-vehicles": [
    "One click adds the vehicles most contractors care about most — GSA Schedule, SEWP V, CIO-SP3, Alliant 2, 8(a) STARS III, VETS 2, OASIS+, and more — no manual data entry.",
    "Add any other vehicle by hand: the type (GWAC, IDIQ, BPA, or GSA Schedule), whether it's currently open to new vendors, its dollar ceiling, and which industry codes and certifications it requires — real structure, not just a name and a date.",
    "The moment you save it, Sambid checks it against your real industry codes and active certifications and tells you plainly: \"You Likely Qualify,\" \"May Not Qualify Yet,\" or an honest \"add more info to check\" instead of guessing.",
    "Every vehicle shows a color-coded countdown to its expiration — red under 30 days, yellow under 90, green if you're safe — so you always know how much time is left, and never miss your window to renew or apply.",
  ],
  "company-workspace": [
    "Enter your 12-character Unique Entity ID and CAGE code, and Sambid verifies it live against SAM.gov, pulling in your official business name and registration status automatically.",
    "Keep every certification you hold — 8(a), WOSB, HUBZone, SDVOSB, and more — along with your industry codes and what your company does, all in one place. You'll get an alert before any certification is about to expire.",
    "Invite your team and give each person a real role — Admin, Capture Manager, Proposal Writer, Reviewer, or Member — so everyone sees exactly what they should, and nothing they shouldn't.",
    "One shared library for proposals, past performance write-ups, templates, and more — searchable, organized, and open to comments, so nothing important is buried in someone's personal inbox.",
  ],
  "managed-service": [
    "Apply, and our team reviews your company profile, industry codes, and certifications — you'll hear back within 24 to 48 hours with your commission rate confirmed.",
    "From there, our team finds real matching contracts and writes and submits professional proposals for you, using your company's actual history — never a generic template.",
    "The moment you win, a real project gets set up automatically with clear milestones, all visible in your dashboard — no waiting around to get started.",
    "We only bill our commission as the government actually pays each milestone of the contract — never one big surprise bill the moment you win.",
  ],
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI_API);
  for (const [slug, descriptions] of Object.entries(updates)) {
    const f = await FeatureShowcase.findOne({ slug });
    if (!f) { console.warn("!! missing slug:", slug); continue; }
    descriptions.forEach((desc, i) => { if (f.steps[i]) f.steps[i].description = desc; });
    await f.save();
    console.log(slug, "-> updated", descriptions.length, "step descriptions");
  }
  console.log("\nDone.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
