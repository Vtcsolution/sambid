import HowItWorksContent from '../models/HowItWorksContent.js';

const KEY = 'main';

// ── Public: get the page content ─────────────────────────────────────────
export const getContent = async (req, res) => {
  try {
    const doc = await HowItWorksContent.findOne({ key: KEY }).lean();
    if (!doc) return res.json({ success: true, data: null }); // frontend falls back to its own defaults
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: same read, no isActive gating needed (single doc) ────────────
export const adminGetContent = getContent;

// ── Admin: upsert the whole document (or a partial merge from the client) ─
export const updateContent = async (req, res) => {
  try {
    const doc = await HowItWorksContent.findOneAndUpdate(
      { key: KEY },
      { $set: { ...req.body, key: KEY } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: seed with the current live copy (only if nothing exists yet) ──
export const seedDefaults = async (req, res) => {
  try {
    const existing = await HowItWorksContent.findOne({ key: KEY });
    if (existing) return res.json({ success: false, message: 'Content already exists. Edit it directly instead of reseeding.' });

    const defaults = {
      key: KEY,
      hero: {
        badge: 'Intelligence Brief: Expert Edition',
        titleLine1: 'Federal BD Intelligence.',
        titleLine2: 'Automated.',
        subtitle: 'Sambid replaces a 20-person BD team with 17 automated workflows: daily contract discovery, AI-drafted proposals, deadline alerts, and Go/No-Go decisions. One platform, one person, maximum wins.',
      },
      compareSection: {
        tag: 'The Problem We Solve',
        title: 'What Changes When You Use Sambid',
        subtitle: 'Five things every contractor will recognize - each pain, and exactly what it becomes.',
        items: [
          { icon: 'Users', topic: 'Team Size', before: '20-person team monitoring SAM.gov manually, every day', after: '1–2 people - discovery runs fully automated while you sleep' },
          { icon: 'SlidersHorizontal', topic: 'Daily Noise', before: '150 solicitations/day - 90% completely irrelevant', after: 'Only matched, scored & ranked opportunities reach you' },
          { icon: 'FileText', topic: 'Proposal Cost', before: '$50,000 per proposal for a human proposal writer', after: 'AI drafts the full proposal in under 3 minutes' },
          { icon: 'BellRing', topic: 'Deadlines', before: 'Missed deadlines, wrong NAICS codes, lost bids', after: 'Alerts at 7 days / 24 hours / 1 hour - on every device' },
          { icon: 'Timer', topic: 'Bid Decision', before: '3 days of analysis + consultant fees per decision', after: 'Data-backed Go/No-Go answer in 30 seconds' },
        ],
        summaryLine: "20 people → 2. $50,000 → 3 minutes. 3 days → 30 seconds. That's the change.",
      },
      aiEngineSection: {
        tag: 'The Intelligence Layer',
        title: 'One AI Engine Powers All 17 Workflows',
        subtitle: 'Every feature draws from the same intelligence layer. The output is never generic. It knows your registrations, certifications, capabilities, and past contracts before it writes a single word.',
        flow: [
          { label: 'SAM.gov Opportunity', kind: 'in' }, { sep: '+' },
          { label: 'Company Profile', kind: 'in' }, { sep: '+' },
          { label: 'USASpending Awards', kind: 'gold' }, { sep: '→' },
          { label: 'Sambid AI Engine', kind: 'eng' }, { sep: '→' },
          { label: 'Company-Specific Output', kind: 'out' },
        ],
      },
      painPointsSection: {
        tag: '17 Problems. 17 Solutions.',
        title: 'What Is Costing You Contracts',
        subtitle: 'Every pain point a federal contractor faces, and exactly how Sambid eliminates it, with the full automated workflow shown.',
      },
      painPoints: [
        { num: '01', title: 'Wrong NAICS Code: A $4B Opportunity Invisible to Everyone',
          pain: 'Contracting Officer enters wrong NAICS → your filter never sees it → competitor wins unopposed',
          solve: 'Sambid downloads every SAM.gov solicitation daily with no category filter, then runs a secondary keyword search per industry ("IT services", "cybersecurity", "cloud infrastructure") to catch postings where the contracting officer used the wrong code. A $4B IT contract mislabeled under a different industry code still lands in your feed. No other platform does this.',
          flow: [
            { label: 'All SAM.gov solicitations, no filter', kind: 'in' }, { sep: '→' },
            { label: 'Industry keyword cross-check', kind: 'in' }, { sep: '→' },
            { label: 'Marked relevant to your business', kind: 'in' }, { sep: '→' },
            { label: 'Your feed, including misclassified contracts', kind: 'out' },
          ] },
        { num: '02', title: 'Go / No-Go Decision: 3 Days of Consultant Time → 30 Seconds',
          pain: 'Bid decisions made on gut feel or skipped entirely, wasting proposal budget on unwinnable contracts',
          solve: 'AI reads the full opportunity (scope, set-aside, timeline, incumbent signals, value) against your Company Profile (UEI, CAGE, certifications, NAICS, capabilities) and USASpending history. Outputs a confidence-scored recommendation, Go, Lean Go, or No-Go, with the 12 specific factors behind the call.',
          flow: [
            { label: 'Full opportunity + attachments', kind: 'in' }, { sep: '+' },
            { label: 'Company profile (UEI/CAGE/certs)', kind: 'in' }, { sep: '+' },
            { label: 'USASpending incumbent data', kind: 'gold' }, { sep: '→' },
            { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
            { label: 'Scored Go/No-Go + rationale', kind: 'out' },
          ] },
        { num: '03', title: 'Deadline Passed at 4:50 PM: You Opened It at 4:55 PM',
          pain: 'Federal deadlines are hard stops. One minute late means automatic disqualification, no exceptions, no appeal',
          solve: 'Three-stage automated alert system per opportunity: 7-day email (plan your team), 24-hour email + push notification (final review), 1-hour push to all devices + browser tab badge (last chance). If response deadline passes, opportunity is flagged "Expired / Do Not Submit" and removed from active pipeline automatically.',
          flow: [
            { label: 'Your saved opportunity deadlines', kind: 'in' }, { sep: '→' },
            { label: 'Background monitor (24/7)', kind: 'in' }, { sep: '→' },
            { label: '7-day / 24-hour / 1-hour triggers', kind: 'in' }, { sep: '→' },
            { label: 'Email + Chrome push + in-app, all at once', kind: 'out' },
          ] },
        { num: '04', title: 'Smart Filters: Find Winnable Contracts in 10 Seconds',
          pain: '1,500 new solicitations daily. Your team reads hundreds of irrelevant ones before finding one worth pursuing',
          solve: 'Multi-dimensional real-time filter: NAICS code or industry keyword, city/state location, due date range (next 7/15/30/60/90 days), days left to apply, notice type, set-aside type, specific agency (DoD, NASA, VA...), contract value bracket, PSC code, and custom posted-date range.',
          flow: [
            { label: 'Your filter selections', kind: 'in' }, { sep: '→' },
            { label: 'Instant search across all live solicitations', kind: 'in' }, { sep: '→' },
            { label: 'Only the contracts that fit, ranked by match score', kind: 'out' },
          ] },
        { num: '05', title: 'Complete Opportunity Data: Nothing Missing, Direct SAM.gov Link',
          pain: 'Incomplete listings with no description, no attachments, and no contact waste hours chasing information that should be instant',
          solve: 'Sambid fetches every field SAM.gov returns: title, agency chain (department → subTier → office), NAICS + description, PSC code, set-aside type, place of performance, all points of contact, resource/attachment links, notice type, archive date, award details, and performance period. Every opportunity shows a direct "View on SAM.gov" button.',
          flow: [
            { label: 'SAM.gov daily download, all categories', kind: 'in' }, { sep: '→' },
            { label: 'Every field captured and stored', kind: 'in' }, { sep: '→' },
            { label: 'Matched and scored against your profile', kind: 'in' }, { sep: '→' },
            { label: 'Complete listing + one-click SAM.gov link', kind: 'out' },
          ] },
        { num: '06', title: 'Submission Deadline Calendar: Every Active Bid, Visible at Once',
          pain: 'Teams track deadlines in shared spreadsheets that get out of sync, and someone always has the wrong date',
          solve: 'Full calendar view of every opportunity in your bid pipeline with response deadlines plotted by day. Color-coded urgency (green → yellow → red as deadline approaches). Team members all see the same live calendar, no spreadsheet, no manual updates.',
          flow: [
            { label: 'Your saved and pipeline opportunities', kind: 'in' }, { sep: '→' },
            { label: 'Auto-plotted on shared team calendar', kind: 'in' }, { sep: '→' },
            { label: 'Live deadline view, same for every team member', kind: 'out' },
          ] },
        { num: '07', title: 'Who Won: Stop Bidding Blind, Know the Incumbent',
          pain: 'You bid $2.1M. Incumbent renewed at $1.8M for the 4th time. You had no idea they existed.',
          solve: "USASpending.gov historical award data matched against the active opportunity by NAICS code, agency, and contract type. Sambid shows who won this or a similar contract before, what they were paid, what certifications they hold, and how many times they've renewed, turning history into tactical advantage.",
          flow: [
            { label: 'USASpending past awards', kind: 'in' }, { sep: '+' },
            { label: 'Opportunity NAICS + agency', kind: 'in' }, { sep: '+' },
            { label: 'Your company profile', kind: 'in' }, { sep: '→' },
            { label: 'Incumbent ID + price benchmarks + your advantage points', kind: 'out' },
          ] },
        { num: '08', title: 'Smart Alerts: Relevant Opportunities Find You in Real Time',
          pain: 'By the time your team finds a new solicitation manually, the best teaming partners are already taken',
          solve: 'Custom alert rules by keyword, NAICS code, agency name, set-aside type, and contract value range. When a match fires: in-app notification, email digest (real-time for Pro/Enterprise, daily for Starter), and Chrome push notification to desktop/mobile even when the browser tab is closed.',
          flow: [
            { label: 'New opportunity posted', kind: 'in' }, { sep: '→' },
            { label: 'Alert rule match check', kind: 'in' }, { sep: '→' },
            { label: 'Email + Chrome push + in-app, simultaneously', kind: 'out' },
          ] },
        { num: '09', title: 'AI Proposal Builder: Full Draft in 3 Minutes, Not 3 Weeks',
          pain: "$5,000–$50,000 per proposal for a human writer. Lose the bid, lose the investment. Most small businesses can't afford to bid.",
          solve: "AI reads the full RFP (including attached PDFs), extracts all technical requirements, evaluation criteria, and submission format rules, then writes a structured, compliant proposal draft: Executive Summary, Technical Approach, Management Plan, Past Performance, and Pricing Narrative. Upload a sample winning proposal and the AI adopts its structure and tone.",
          flow: [
            { label: 'RFP full text + attachments', kind: 'in' }, { sep: '+' },
            { label: 'Company profile + past performance', kind: 'in' }, { sep: '+' },
            { label: 'Sample proposal (optional)', kind: 'gold' }, { sep: '→' },
            { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
            { label: 'Complete compliant proposal draft', kind: 'out' },
          ] },
        { num: '10', title: 'Past Performance: Your Win History Becomes a Competitive Weapon',
          pain: 'Every proposal needs Past Performance citations. Pulling them from old contracts takes days and produces inconsistent write-ups.',
          solve: 'Structured Past Performance database inside your Company Profile. USASpending integration auto-imports your historical federal awards by UEI, no manual entry for existing federal work. When AI Proposal Builder runs, it selects and formats the 3 most relevant citations automatically based on scope match.',
          flow: [
            { label: 'Federal award history (auto-imported by UEI)', kind: 'in' }, { sep: '+' },
            { label: 'Manually added past contracts', kind: 'in' }, { sep: '→' },
            { label: 'Saved as ready-to-use citations', kind: 'in' }, { sep: '→' },
            { label: 'Best-fit citations auto-selected in every proposal', kind: 'out' },
          ] },
        { num: '11', title: 'Sources Sought Generator: Turn Market Research Notices into Pipeline',
          pain: 'Most companies ignore Sources Sought notices, but the companies that respond shape the requirement and often win the follow-on contract.',
          solve: 'When you save a Sources Sought notice, Sambid AI drafts a response: capability narrative tailored to the stated requirement, relevant NAICS and PSC codes, certifications highlighted (8(a), WOSB, HUBZone, SDVOSB), and a concise past performance example from your profile. Responding is now a 2-minute action, not a half-day project.',
          flow: [
            { label: 'Saved Sources Sought notice', kind: 'in' }, { sep: '+' },
            { label: 'Company profile + certs + past perf', kind: 'in' }, { sep: '→' },
            { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
            { label: 'Targeted response, ready to submit', kind: 'out' },
          ] },
        { num: '12', title: 'Capability Statement Generator: One Page That Opens Doors',
          pain: "A federal cap statement that's outdated, generic, or formatted wrong gets discarded by procurement officers in under 5 seconds.",
          solve: 'Pulls directly from your Company Profile (UEI, CAGE, NAICS codes with descriptions, core capabilities, certifications, differentiators, past performance highlights, contact info) and generates a formatted, one-page federal capability statement. Tailored version available per opportunity.',
          flow: [
            { label: 'Company Profile (all fields)', kind: 'in' }, { sep: '+' },
            { label: 'Target opportunity (optional)', kind: 'gold' }, { sep: '→' },
            { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
            { label: 'Formatted 1-page federal cap statement PDF', kind: 'out' },
          ] },
        { num: '13', title: 'RFP Analyzer: 400-Page Document Understood in 3 Minutes',
          pain: 'A 400-page RFP with 12 attachments takes 3 days for a compliance team to parse. Small businesses simply skip it and lose.',
          solve: "Upload any RFP PDF. AI extracts: mandatory requirements (M-sections), evaluation criteria with point weights, submission format checklist, key dates, incumbent information, and red-flag clauses (unusual IP ownership, unrealistic timelines, vague acceptance criteria). Outputs a compliance matrix marked green, yellow, or red on every requirement.",
          flow: [
            { label: 'RFP PDF (uploaded or from SAM.gov)', kind: 'in' }, { sep: '+' },
            { label: 'Company capabilities', kind: 'in' }, { sep: '→' },
            { label: 'Sambid AI', kind: 'eng' }, { sep: '→' },
            { label: 'Compliance matrix + red-flag report', kind: 'out' },
          ] },
        { num: '14', title: 'Teaming Finder: Win Contracts That Are Too Big to Win Alone',
          pain: "A $50M contract needs capabilities you don't have. The contract goes to someone who found a partner at last year's conference.",
          solve: "Sambid identifies which capabilities the opportunity requires that your company doesn't cover, then searches the federal vendor registry (140K+ registered businesses) for verified companies with complementary expertise, active federal registrations, and compatible set-aside certifications.",
          flow: [
            { label: 'Your capability gaps vs opportunity requirements', kind: 'in' }, { sep: '→' },
            { label: 'Federal vendor registry (140K+ businesses)', kind: 'in' }, { sep: '→' },
            { label: 'Ranked teaming partner suggestions, ready to contact', kind: 'out' },
          ] },
        { num: '15', title: 'Market Intelligence: Know Where the Money Is Going Before Others Do',
          pain: "You're bidding in markets that agencies are quietly exiting, while missing sectors where spending is accelerating.",
          solve: 'USASpending historical award data aggregated by agency, NAICS, quarter, and fiscal year. Shows which agencies increased spending in the last 4 quarters, which NAICS codes have the highest award volume and lowest competition density, and which agencies have upcoming recompete cycles.',
          flow: [
            { label: 'Federal award history (multiple years)', kind: 'in' }, { sep: '+' },
            { label: 'Your industry and certifications', kind: 'in' }, { sep: '→' },
            { label: 'Spend trends + competition density + recompete radar', kind: 'out' },
          ] },
        { num: '16', title: 'Contract Vehicle Tracker: Stop Missing On-Ramp Windows',
          pain: 'GSA Schedule, SEWP V, CIO-SP3, and OASIS+ on-ramp windows open once every few years. Missing them locks you out for the next 5–10 years.',
          solve: 'Tracks all major IDIQ, GWAC, and BPA contract vehicles: type, eligibility requirements, current on-ramp status (open / closed / upcoming), expiration dates, ceiling values, and which agencies use them most. Matches your Company Profile against eligibility and flags vehicles you qualify for today.',
          flow: [
            { label: 'Contract vehicle database', kind: 'in' }, { sep: '+' },
            { label: 'Company certs + NAICS', kind: 'in' }, { sep: '→' },
            { label: 'Eligibility match + on-ramp alerts', kind: 'out' },
          ] },
        { num: '17', title: 'Company Workspace: One Source of Truth for Everything',
          pain: 'Company info scattered across email threads, SharePoint folders, and old proposal hard drives. Every proposal starts from scratch, repeating the same mistakes.',
          solve: "Company Profile (UEI, CAGE, certifications, NAICS codes, core capabilities) is the single context layer all 17 AI features pull from. Team Management with role-based access (admin / analyst / viewer). Document Library for past proposals, cap statements, teaming agreements. Managed Service: Sambid's team monitors, writes, and submits bids on your behalf.",
          flow: [
            { label: 'Company profile (registrations, certs, capabilities)', kind: 'in' }, { sep: '→' },
            { label: 'Powers all 17 features as shared context', kind: 'in' }, { sep: '→' },
            { label: 'Team roles control what each person sees', kind: 'in' }, { sep: '→' },
            { label: 'Every output is company-specific, never generic', kind: 'out' },
          ] },
      ],
      closing: {
        title: 'The Bottom Line for Expert Contractors',
        text: "Every contract you lost in the last 12 months had a reason. A solicitation your team never saw. A deadline missed by hours. A proposal that read like a template. An incumbent you didn't know existed. None of those are failures of capability. They are failures of intelligence. Your competitors aren't smarter. They just had better information, faster. Sambid is that information.",
      },
    };

    const doc = await HowItWorksContent.create(defaults);
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
