import ProblemShowcase from '../models/ProblemShowcase.js';

export const getAllProblems = async (req, res) => {
  try {
    const problems = await ProblemShowcase.find({ isActive: true }).sort({ order: 1 }).lean();
    res.json({ success: true, data: problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await ProblemShowcase.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, data: problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const adminListProblems = async (req, res) => {
  try {
    const problems = await ProblemShowcase.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: problems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProblem = async (req, res) => {
  try {
    const problem = await ProblemShowcase.create(req.body);
    res.status(201).json({ success: true, data: problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProblem = async (req, res) => {
  try {
    const problem = await ProblemShowcase.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, data: problem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProblem = async (req, res) => {
  try {
    await ProblemShowcase.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Problem deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const seedDefaults = async (req, res) => {
  try {
    const existing = await ProblemShowcase.countDocuments();
    if (existing > 0) return res.json({ success: false, message: `${existing} problems already exist. Delete them first or edit individually.` });

    const defaults = [
      { num: '01', slug: 'wrong-naics-code', title: 'Wrong NAICS Code: A $4B Opportunity Invisible to Everyone',
        subtitle: 'One human mistake can make a billion-dollar contract disappear from every search that should have found it.',
        timelinePoints: [
          'A contracting officer enters the wrong NAICS code on a posting. He\'s human - it happens all the time.',
          'That contract could be worth four billion dollars, and it never shows up in a standard NAICS search.',
          'Every single month, roughly 3 to 4 percent of all posted opportunities get filed under the wrong code - and every one of them goes straight into the trash. Nobody sees them. Nobody bids.',
        ],
        solve: 'We don\'t trust the NAICS code alone. Every day, Sambid downloads every single new posting from SAM.gov with no category filter applied, then runs a second pass: a keyword search across the actual title and description text, matched against your specific industry terms. So even when the code is wrong, the words inside the posting still get read - and a mislabeled four-billion-dollar contract still lands in your feed, correctly matched, the same day it\'s posted. No other platform does this double pass.' },

      { num: '02', slug: 'go-no-go-decision', title: 'Go / No-Go Decision: 3 Days of Consultant Time Becomes 30 Seconds',
        subtitle: 'The most expensive question in this business: should I bid, or should I walk away?',
        timelinePoints: [
          'You can only afford to enter a few "races" (bids) per year - each one costs real money and weeks of work.',
          'Today, that decision is made on gut feeling, or by paying a consultant and waiting three days.',
          'Even after the wait, the answer is still mostly a guess - no real data behind it.',
        ],
        solve: 'The AI reads the full opportunity, every page, then cross-checks it against your Company Profile and USASpending\'s historical award data at the same time. It gives you a straight answer: Go, Lean Go, or No-Go, backed by the 12 specific factors behind the call, so you understand exactly why, not just what. Three days and consultant fees becomes thirty seconds.' },

      { num: '03', slug: 'missed-deadlines', title: 'Deadline Passed at 4:50 PM: You Opened It at 4:55 PM',
        subtitle: 'Federal deadlines are hard stops - one minute late means automatic disqualification, no exceptions.',
        timelinePoints: [
          'Government deadlines work like a school gate that closes at exactly 8:00 - not 8:01.',
          'The deadline passed at 4:50. You opened the portal at 4:55 - five minutes late.',
          'Automatic disqualification. No appeal. No mercy. Weeks of work, gone, over five minutes.',
        ],
        solve: 'The moment you save an opportunity, its deadline is registered with a background monitor running 24/7. It fires three separate alerts: 7 days before (plan your team), 24 hours before (email + push, final review), and 1 hour before (push to every device, last chance). To miss a deadline with Sambid, you\'d have to ignore three separate alerts, on purpose.' },

      { num: '04', slug: 'smart-filters', title: 'Smart Filters: Find Winnable Contracts in 10 Seconds',
        subtitle: '1,500 new solicitations pour out of SAM.gov every single day - and only a handful are actually right for you.',
        timelinePoints: [
          'Imagine standing at the bottom of a waterfall of paper - 1,500 new postings a day.',
          'Somewhere inside that waterfall, maybe 3 or 4 contracts are actually perfect for you.',
          'Someone on your team has to open each one, read it, and say "not for us" - hundreds of times, every day. That\'s not work, that\'s drowning.',
        ],
        solve: 'A real-time, multi-dimensional filter narrows it instantly: NAICS code, location, due-date window, set-aside type, specific agency, contract value range, and more, all combinable at once. Ten seconds, not ten hours of reading, and everything on your screen is worth your time.' },

      { num: '05', slug: 'incomplete-opportunity-data', title: 'Complete Opportunity Data: Nothing Missing, Direct SAM.gov Link',
        subtitle: 'Like buying a puzzle with half the pieces missing - no description, no contact, no attachments.',
        timelinePoints: [
          'You open an opportunity, excited - and find no description, no attachments, no contact person.',
          'So you become a detective: other websites, emails into the dark, phone numbers hoping someone answers.',
          'While you\'re playing detective, your competitors with bigger research teams already have the answers.',
        ],
        solve: 'Every night, Sambid pulls every single field SAM.gov\'s own system returns for that posting - the full agency chain, PSC code, place of performance, every point of contact, every attached document, and more, all displayed on one page. A direct "View on SAM.gov" button is always there too, so you\'re never taking our word for it.' },

      { num: '06', slug: 'deadline-calendar-chaos', title: 'Submission Deadline Calendar: Every Active Bid, Visible at Once',
        subtitle: 'Teams track deadlines in shared spreadsheets that get out of sync - and someone always has the wrong date.',
        timelinePoints: [
          'Monday, someone creates the deadline spreadsheet. Tuesday, someone updates it but forgets to tell the others.',
          'Wednesday, someone opens last week\'s copy from their email, not knowing there\'s a newer one.',
          'Thursday, someone says the deadliest sentence in government contracting: "Wait, I thought it was due Friday."',
        ],
        solve: 'Every opportunity you save automatically plots itself onto a shared team calendar, by its actual response deadline, with zero manual entry. The calendar color-codes urgency automatically as the date approaches, and every team member sees the exact same live view, updated the same second something changes.' },

      { num: '07', slug: 'bidding-blind-vs-incumbent', title: 'Who Won: Stop Bidding Blind, Know the Incumbent',
        subtitle: 'You bid $2.1M. The incumbent renewed at $1.8M for the 4th time. You had no idea they existed.',
        timelinePoints: [
          'It\'s like entering a race where one runner has already won this exact race four times - and you don\'t know it.',
          'You bid a solid number, thinking it\'s competitive.',
          'The same company has held this contract for years and just renewed it lower. Your price was too high, and you never even knew why you lost.',
        ],
        solve: 'Sambid automatically matches the active opportunity against USASpending\'s historical award database using the same NAICS code, agency, and contract type. It surfaces who won it before, what they were paid, and how many times it\'s been renewed - so you see the real price and real competition before you spend a single hour on a proposal.' },

      { num: '08', slug: 'smart-alerts', title: 'Smart Alerts: Relevant Opportunities Find You in Real Time',
        subtitle: 'Being right but late is the same as being wrong in this business.',
        timelinePoints: [
          'The moment a solicitation comes out of the oven, the clock starts - like a fresh pizza getting cold.',
          'By the time you manually stumble onto it weeks later, the best teaming partners are already taken.',
          'Half the deadline is already burned before you even knew the opportunity existed.',
        ],
        solve: 'Set custom alert rules once - keyword, NAICS code, agency, set-aside type, contract value range. The moment something matches, three things fire at once: in-app notification, email, and a push notification straight to your desktop or phone, even if the browser is closed. You stop searching, forever.' },

      { num: '09', slug: 'proposal-cost-wall', title: 'AI Proposal Builder: Full Draft in 3 Minutes, Not 3 Weeks',
        subtitle: 'The invisible wall that stops most small businesses before they even start: the proposal cost wall.',
        timelinePoints: [
          'A professional proposal writer charges $5,000 to $50,000 - for one proposal, win or lose.',
          'It\'s like a lottery ticket that costs fifty thousand dollars - if you lose, that money is gone, no refund.',
          'Small businesses can\'t afford to lose several tickets in a row, so most simply never buy one at all. That\'s the wall.',
        ],
        solve: 'Upload the full RFP, and the AI reads the entire document, extracting every requirement and format rule. It writes a structured, compliant draft covering the executive summary, technical approach, management plan, past performance, and pricing narrative. Three minutes, not three weeks - then you take over, review, and make it yours.' },

      { num: '10', slug: 'past-performance-digging', title: 'Past Performance: Your Win History Becomes a Competitive Weapon',
        subtitle: 'Every proposal asks "show us what you\'ve done before" - and answering it used to take days.',
        timelinePoints: [
          'You dig through old contracts, old emails, and that folder called "IMPORTANT, do not delete."',
          'Days pass, like an archaeologist excavating your own company\'s history.',
          'Every project ends up described in a different style, because you wrote each one at midnight, from memory.',
        ],
        solve: 'Your UEI number is your ID card with the federal government - Sambid uses it to automatically import your entire federal award history, no manual typing. When the AI Proposal Builder runs, it selects the 3 most relevant citations automatically based on scope match, formatted the same professional way every time.' },

      { num: '11', slug: 'sources-sought-ignored', title: 'Sources Sought Generator: Turn Market Research Notices into Pipeline',
        subtitle: 'Almost everyone ignores this early-stage notice - and the few who respond often win the follow-on contract.',
        timelinePoints: [
          'Before writing the big test, the teacher quietly asks the class: "who here knows this subject?"',
          'Most students stay silent, waiting for the real test - most companies do the same with Sources Sought notices.',
          'The few who respond shape the requirements, and often go on to win the contract that follows.',
        ],
        solve: 'When you save a Sources Sought notice, Sambid AI drafts a response automatically: a capability narrative tailored to the requirement, relevant codes attached, certifications highlighted, and a concise past-performance example. What used to be a half-day project becomes a two-minute action.' },

      { num: '12', slug: 'capability-statement-generator', title: 'Capability Statement Generator: One Page That Opens Doors',
        subtitle: 'A procurement officer looks at hundreds of these and gives yours about five seconds.',
        timelinePoints: [
          'It\'s your business card, your CV, and your brochure - all on one page.',
          'Agencies keep these on file and search through them when they need a vendor.',
          'If it\'s outdated or generic, it\'s in the trash before second six.',
        ],
        solve: 'Sambid pulls directly from your Company Profile - UEI, CAGE, NAICS codes, capabilities, certifications, differentiators, past-performance highlights - and generates a formatted, one-page federal capability statement automatically, with a tailored version available per opportunity.' },

      { num: '13', slug: 'rfp-analyzer', title: 'RFP Analyzer: 400-Page Document Understood in 3 Minutes',
        subtitle: 'Every contractor meets this monster eventually - and small businesses often just close the tab.',
        timelinePoints: [
          'Twelve attachments, four hundred pages of dense government language.',
          'A mandatory requirement hides on page 12. A dangerous clause hides on page 383.',
          'Miss just one, and your entire proposal gets stamped "non-responsive."',
        ],
        solve: 'Upload the RFP PDF, and the AI extracts every mandatory requirement, the evaluation criteria with point weights, a submission checklist, key dates, and red-flag clauses. What comes back is a compliance matrix: every requirement marked green, yellow, or red, all in one glance.' },

      { num: '14', slug: 'teaming-finder', title: 'Teaming Finder: Win Contracts That Are Too Big to Win Alone',
        subtitle: 'A $50M opportunity needs capabilities you don\'t have - alone, you simply can\'t do it.',
        timelinePoints: [
          'It\'s like being asked to carry a giant table up the stairs that needs four people.',
          'So who usually wins these contracts today? Whoever happened to meet the right partner at a conference last year.',
          'Not the best company - the luckiest one, the one who shook the right hand at the right coffee break.',
        ],
        solve: 'Sambid first identifies exactly which capabilities the requirement needs that your profile doesn\'t cover. Then it searches the federal vendor registry, over 140,000 registered businesses, for companies with those complementary capabilities and compatible certifications - ranked and ready to contact.' },

      { num: '15', slug: 'market-intelligence', title: 'Market Intelligence: Know Where the Money Is Going Before Others Do',
        subtitle: 'A silent killer that doesn\'t fail loudly - it fails quietly, over years.',
        timelinePoints: [
          'You run a lemonade stand on a busy street - business is okay.',
          'What you don\'t know: the city is building a new park two blocks away, and foot traffic is quietly shifting there.',
          'Nobody sends you a letter about it - you just keep bidding on an emptying street.',
        ],
        solve: 'Market Intelligence aggregates USASpending\'s historical award data by agency, NAICS, quarter, and fiscal year. It shows which agencies increased spending recently, which NAICS codes have high volume but low competition, and which contracts are coming up for recompete soon.' },

      { num: '16', slug: 'contract-vehicle-windows', title: 'Contract Vehicle Tracker: Stop Missing On-Ramp Windows',
        subtitle: 'The doors to GSA Schedule, SEWP, and OASIS only open once every few years.',
        timelinePoints: [
          'A huge share of government buying happens only inside these membership-club-like vehicles.',
          'The doors open once every few years - not on your schedule.',
          'Miss the window, and you can be locked out for five to ten years.',
        ],
        solve: 'Sambid tracks all the major contract vehicles - type, eligibility, current status (open, closed, upcoming), expiration dates, and which agencies use them most. It automatically matches your certifications and NAICS codes against each vehicle\'s rules and flags exactly which ones you qualify for today.' },

      { num: '17', slug: 'scattered-company-data', title: 'Company Workspace: One Source of Truth for Everything',
        subtitle: 'The final problem - the one that holds all sixteen others together.',
        timelinePoints: [
          'Your UEI number is buried in an email from 2022. Your certifications live in a folder called "New Folder (3)."',
          'Your old proposals sit on a hard drive in a drawer, and your team\'s knowledge lives only in their heads.',
          'Every proposal starts from zero, and the same mistakes repeat, because nothing learned is ever saved in one place.',
        ],
        solve: 'Your Company Profile becomes the single shared context layer that every one of the 17 AI features reads from automatically. Team Management, a Document Library, and even a fully Managed Service all sit on top of that one profile - fill it once, and every tool reads from that one accurate source, never generic, always about your actual company.' },
    ];

    const created = await ProblemShowcase.insertMany(defaults.map((d, i) => ({ ...d, order: i })));
    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
