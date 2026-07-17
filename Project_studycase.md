# Sambid (FedNotify) — Project Study Case

> **Purpose of this file:** Single source of truth for any new Claude/AI session.
> Read THIS file first instead of scanning the whole codebase. It explains what the
> platform is, every feature, every page, the backend architecture, and exactly
> which file to open for each area. Only open source files when you need to change them.

---

## 1. What is this platform?

**Sambid** (repo folder name: FedNotify) is a **SaaS platform for US federal government
contract discovery and bidding**, live at **https://sambid.co**.

It automatically pulls contract opportunities from **SAM.gov** (plus USASpending, FPDS,
SBA, GovDeals), matches them to each subscriber's company profile (NAICS codes,
set-asides, keywords), and delivers them via dashboard, email, and push notifications.
On top of discovery it layers **AI tools** (RFP analysis, proposal generation, go/no-go,
predictions), a **company workspace** for teams, a **managed bid service**, and a
**referral/support-agent earnings program**.

- **Business model:** subscription plans (trial → free → starter → pro → enterprise) + AI credit top-ups + managed service fees.
- **Owner/dev:** Zia (git user Ranazia943). Repo origin: `Vtcsolution/sambid`.
- **Deployment:** VPS 141.136.44.84, pm2 process `sambid`, nginx reverse proxy, MongoDB Atlas cluster `cluster0786`. See `DEPLOY.md`, `ecosystem.config.cjs`, `nginx.conf`.
- **NOTE:** sambid.com (with .com) is NOT ours — only sambid.co.

---

## 2. Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express 5 (ES modules), MongoDB + Mongoose 8, Socket.IO, node-cron |
| Auth | JWT, bcrypt, speakeasy (2FA/OTP), email verification |
| Payments | Stripe, PayPal (`@paypal/paypal-server-sdk`), Payoneer |
| AI providers | Anthropic SDK (Claude — primary), OpenAI, Google Gemini — API keys managed from admin panel |
| Email | nodemailer (`services/emailService.js`) + scheduled campaigns |
| Push | web-push (VAPID) |
| Frontend | React 19 + Vite 7, Tailwind CSS, framer-motion, react-router-dom 7, i18next, lucide-react, jsPDF exports, react-helmet-async (SEO) |
| Realtime | socket.io-client ↔ `backend/socket.js` |

Backend runs on port 8000 (`backend/server.js`). Frontend is a Vite SPA (`frontend/`),
built to `frontend/dist`, served by nginx. `.env` files exist in both apps (gitignored).

---

## 3. Core product pipeline (the heart of the app)

File: `backend/services/schedulerService.js` — **two-phase pipeline**:

1. **Master Fetch (every 30 min, production only):** SAM.gov API → global `Opportunity`
   collection. Quota-guarded: max 5 NAICS codes/cycle, 5s between calls, skips if last
   run < 28 min ago. Bulk CSV path in `samBulkService.js` backfills descriptions and
   resource links.
2. **Distribution (hourly + midnight):** global `Opportunity` → per-user
   `UserOpportunity`, with a **match score**: exact NAICS = 50 pts, same 4-digit NAICS
   family = 35, keyword-matched NAICS = 25, plus set-aside bonuses. Reasons are stored
   and shown to the user.

**Plan limits applied during distribution:**

| Plan | Opportunity limit | Source window |
|---|---|---|
| trial | 3/day | 7 days |
| free | 3/day | 7 days |
| starter | 500/month | 14 days |
| pro | 3000/month | 60 days |
| enterprise | unlimited | 180 days |
| expired | 0 | — |

⚠️ **Schedulers are production-only** (`NODE_ENV=production` or `ENABLE_SCHEDULERS=true`).
Local dev must NOT run them — it shares the SAM.gov API quota with the live VPS.

Other schedulers: `projectSchedulerService.js` (managed-project milestones),
`emailSchedulerService.js` (email campaigns/reminders), deadline alerts
(`deadlineAlertService.js`: upcoming / 1-day / final-hour checks).

---

## 4. Plans, pricing & AI credits

- Plans live in the **`Plan` DB collection** — **all prices are DB-driven, nothing
  hardcoded** (commit 506ef6e). Seed defaults in `backend/scripts/initPlans.js`:
  Free $0, Starter $29/mo ($278/yr), Pro $79/mo ($758/yr), Enterprise $499/mo ($4788/yr).
  **Always read live prices from DB/`planPricingService.js`, not from seeds.**
- **7-day trial**: 3 opps/day, 50 AI credits, locked high-score matches shown as upsell
  (commits 5159165, bd78118), paywall enforced server-side (a4b2c33).
- **AI credit system** (`backend/config/aiCredits.js` + `services/aiCreditService.js` +
  `middleware/aiCreditMiddleware.js`): every AI feature call costs **15 credits**.
  Monthly allocation: trial 50, free 0, starter 300, pro 1000, enterprise 5000.
  Top-ups purchasable (`creditTopupController.js`, model `CreditPurchase`), usage logged
  (`CreditUsageLog`, `AITokenUsage`).

**AI features (each = 15 credits):** summarize, ask_question, capability_statement,
sources_sought, past_performance, analyze_attachment, market_research, bid_analysis,
risk_assessment, competitive_analysis, rfp_analyzer, incumbent, ai_predictions,
full_proposal, go_no_go.

---

## 5. Feature map (what the platform does)

### User-facing
- **Opportunity discovery** — auto-matched feed, search/filter, detail pages with AI summary, save, export (PDF/CSV)
- **Alerts** — saved-search alerts, deadline calendar, deadline emails (7-day/1-day/final-hour), web push, in-app notifications (Socket.IO)
- **AI toolkit** — RFP Analyzer, Go/No-Go, Proposal Builder, Capability Statement generator, Sources Sought responses, AI Predictions, Market Research, Bid/Risk/Competitive analysis, Incumbent intel
- **Bid Pipeline** — kanban-style tracking of pursued opportunities
- **Winning Bids analysis** — historical award data (USASpending/FPDS)
- **Teaming Finder** — find partner companies (SAM entity data, `SamCompany` model)
- **Contract Vehicles, Market Research, Sources Sought** — research pages
- **Past Performance** — user's project history for proposals
- **Company Workspace** — multi-user company accounts: profile, team management, document library, join-by-invite (`Company`, `CompanyDocument` models; `workspaceController.js`; separate workspace login)
- **Managed Bid Service** — done-for-you bidding: projects, milestones, subcontractor quotes (`ManagedService`, `ManagedProject`, `ManagedBid`, `ProjectMilestone`, `SubcontractorQuote`)
- **Referral program** — commission tracking, invoices, withdrawals (`Referral`, `CommissionInvoice`, `Withdrawal`; reconciled on server startup)
- **Support agent program** — separate support login/dashboard, earnings, withdrawals (`SupportReferral`, `SupportWithdrawal`)
- **Billing** — Stripe / PayPal / Payoneer checkout, invoices, plan upgrades, annual plan requests, credit top-ups
- **Tickets & Suggestions** — support tickets and feature suggestions
- **Chatbots** — public support chatbot + in-app AI panel
- **Settings** — profile, NAICS codes, email preferences, 2FA, dark mode, push toggle

### Admin panel (~38 pages, `/admin`)
Users, Plans (CRUD → drives live pricing), Payments, Invoices, Plan/Annual/Credit
requests, Opportunities + Hybrid Fetch control, AI Keys (provider API keys), AI
Insights, Credit Usage, Prospects + Prospect Outreach (cold-email with open/click
tracking via public `/api/track`), Campaigns, Marketing Panel, User Segments, Revenue
Forecast, Platform Health, Content Generator, Media Manager (page media CMS), Feature
Showcase CMS, Contact Inquiries, Tickets, Suggestions, Companies, Company Workspaces,
Managed Service/Projects, Support Management + Earnings + Guide, Admin Management
(role/permission-based, `PermissionGuard.jsx` + `useAdminPermission.js`), Notifications,
Email Settings, Settings.

---

## 6. Backend structure (`backend/`)

```
server.js            entry: security, CORS, rate limits, mounts all routes, Socket.IO
socket.js            Socket.IO setup (realtime notifications)
config/db.js         Mongo connection     config/aiCredits.js   credit config
middleware/          authMiddleware, adminAuth(+flexAdmin), companyMiddleware,
                     aiCreditMiddleware, securityMiddleware (NoSQLi/XSS/length/file guards),
                     loginLimiter, rate limits, upload variants (multer), validation
controllers/  (34)   one per domain — auth, opportunity, payment, ai, admin*, alert,
                     dashboard, referral, support, partner, prediction, prospect,
                     ticket, suggestion, company, workspace, managedService/Project,
                     creditTopup, pastPerformance, chatbot, contact, push, tracking,
                     twoFactor, savedController …
routes/       (33)   mirror the controllers; mounted in server.js under /api/*
services/     (40)   samApiService, samBulkService, samCsvService, samEntityService,
                     samRateLimiter, usaspendingApiService, fpdsService, sbaService,
                     govDealsService, opportunityFetchService, schedulerService,
                     projectSchedulerService, emailSchedulerService, emailService,
                     emailReminderService, deadlineAlertService, alertService,
                     notificationService, pushService, stripeService, paypalService,
                     payoneerService, planPricingService, aiCreditService,
                     aiPredictionService, advancedAIService, geminiService,
                     companyIntelService, companyMergeService, contactEnrichmentService,
                     prospectFetchService, prospectEmailService, websiteFinderAI,
                     settingsService, codeDescriptions …
models/       (37)   User, Admin, Plan, PlanRequest, Company, CompanyDocument,
                     Opportunity, UserOpportunity, SavedOpportunity, Alert,
                     AlertNotification, DeadlineAlert, UserNotification, Invoice,
                     CreditPurchase, CreditUsageLog, AITokenUsage, Referral,
                     CommissionInvoice, Withdrawal, SupportReferral, SupportWithdrawal,
                     ManagedService, ManagedProject, ManagedBid, ProjectMilestone,
                     SubcontractorQuote, Prospect, SamCompany, PastPerformance,
                     UserCertification, Ticket, Suggestion, ContactInquiry,
                     PartnerApplication, FeatureShowcase, PageMedia, PushSubscription
scripts/             initPlans, initSettings, seedAdmins, fix-* / dedupe / cleanup utilities
uploads/             user-uploaded files (served with download-forcing headers)
```

**API route prefixes** (all in `server.js`): `/api/auth`, `/api/opportunities`,
`/api/saved`, `/api/payment`, `/api/ai`, `/api/admin`, `/api/admin/plans`,
`/api/alerts`, `/api/dashboard`, `/api/push`, `/api/contact`, `/api/admin-auth`,
`/api/admin-ai`, `/api/referral`, `/api/support`, `/api/partner`, `/api/predictions`,
`/api/chatbot`, `/api/tickets`, `/api/admin/tickets`, `/api/suggestions`,
`/api/admin/suggestions`, `/api/admin/prospects`, `/api/track` (public),
`/api/past-performance`, `/api/credits`, `/api/media`, `/api/features`, `/api/footer`,
`/api/company`, `/api/admin/company-workspaces`, `/api/managed-service`,
`/api/admin/managed-service`, `/api/admin/managed-projects`.

---

## 7. Frontend structure (`frontend/src/`)

- **Routing:** ALL real routes live in **`App.jsx`** (~90 routes).
  ⚠️ `routes/AppRoutes.jsx` is a stale leftover from an old template — ignore it.
- **API layers:** `services/api.js` (user), `services/adminApi.js` (admin),
  `services/referralApi.js`, `services/notificationService.js`.
- **Hooks:** `useAuth`, `usePlans`, `useUserPlan`, `useWorkspace`, `useSocket`,
  `usePushNotifications`, `useDarkMode`, `usePayPalClientId`, `useAdminPermission`.
- **Key components:** `PlanGate` / `UpgradeModal` / `TrialBanner` (plan gating),
  `PaymentModal` + `StripePayment` / `PayPalPayment` / `PayoneerPayment`,
  `CreditTopUpModal`, `AICreditsBar`, `AIPanel`, `OpportunityCard`, `Sidebar`,
  `Navbar`, `Footer`, `ChatBot`, `SupportChatbot`, `SEOHead`, `ExportButton`.

### Page map (route → file in `frontend/src/pages/`)

**Public:** `/` home.jsx · `/about` · `/contact` · `/how-it-works` · `/features` (+
`/features/:slug` FeatureShowcase.jsx) · `/faq` · `/pricing` · legal: `/terms`
`/privacy` `/dpa` `/security` `/nda` · auth: `/login` `/signup` `/forgot-password`
`/reset-password` `/verify-email/:token` `/onboarding`

**User app:** `/dashboard` · `/opportunities` (+ `/opportunity/:id`) · `/saved` ·
`/alerts` · `/calendar` DeadlineCalendar · `/pipeline` BidPipeline · `/winning-bids` ·
`/rfp-analyzer` · `/go-no-go` · `/proposal-builder` · `/capability-statement` ·
`/sources-sought` · `/ai-predictions` · `/teaming-finder` · `/contract-vehicles` ·
`/market-research` · `/past-performance` · `/referral` · `/billing` ·
`/annual-plan-request` · `/suggestions` · `/settings` `/profile` `/notifications`
`/help` · `/payment/payoneer/return`

**Company workspace:** `/company/profile` `/company/team` `/company/documents`
`/company/managed-service` `/company/join` `/workspace/login`

**Support agents:** `/support/login` `/support/dashboard`

**Admin (`/admin/...`, files in `pages/admin/`):** login, dashboard, users, plans,
plan-requests, annual-requests, credit-requests, payments, invoices, opportunities,
hybrid-fetch, ai-keys, ai-insights, credit-usage, prospects, prospect-outreach,
campaigns, marketing-panel, user-segments, revenue-forecast, platform-health,
content-generator, media-manager, feature-showcase, contact-inquiries, tickets,
suggestions, companies, company-workspaces, managed-service, managed-projects,
support-management, my-earnings, earning-guide, admin-management, notifications,
email-settings, settings.

---

## 8. Other folders in the repo

- **`aiagent/`** — "Jagger" AI agent: chat agent + sambid.co browser tour recorder.
  Phase 3 (voice) pending an ElevenLabs key. Separate from the main app.
- **`Sambid_video_script/`** — marketing video scripts.
- **Root docs:** `README.md`, `DEPLOY.md` (deployment steps), `CLIENT_REPORT.md`,
  `SAMBID_REPORT.md`, `COMPETITORS.md`, `posts.md`.

---

## 9. Where to go for common tasks (quick index)

| Task | Open these files |
|---|---|
| Change pricing/plans | Admin panel or `models/Plan.js`, `services/planPricingService.js`, `pages/Pricing.jsx`, `hooks/usePlans.js` |
| Opportunity fetching/matching | `services/schedulerService.js`, `samApiService.js`, `samBulkService.js`, `models/Opportunity.js`, `UserOpportunity.js` |
| AI features | `controllers/aiController.js`, `services/advancedAIService.js`, `config/aiCredits.js`, `middleware/aiCreditMiddleware.js`, frontend `components/AIPanel.jsx` |
| Payments | `controllers/paymentController.js`, `services/stripeService.js` / `paypalService.js` / `payoneerService.js`, `components/PaymentModal.jsx` |
| Emails | `services/emailService.js`, `emailSchedulerService.js`, `emailReminderService.js`, admin `AdminEmailSettings.jsx` |
| Email open tracking (admin notifications) | `models/TrackedEmail.js`, `sendTrackedMail()` in `emailService.js`, `trackEmailOpen` in `trackingController.js` (route `/api/track/email-open/:id`), socket event `email:opened` → `NotificationDropdown.jsx`. Tracks ONLY plan/payment/trial/campaign emails — never bulk opportunity/deadline emails. Notifies once per email (first open only). |
| Trial/paywall logic | `schedulerService.js` (PLAN_CONFIG), `components/PlanGate.jsx`, `TrialBanner.jsx`, recent commits a4b2c33/bd78118/5159165 |
| Auth/2FA | `controllers/authController.js`, `twoFactorController.js`, `middleware/authMiddleware.js`, pages Login/Signup |
| Admin permissions | `middleware/adminAuth.js`, `flexAdminMiddleware.js`, `components/admin/PermissionGuard.jsx`, `hooks/useAdminPermission.js` |
| Referral/commissions | `controllers/referralController.js` (incl. startup reconciliation), `models/Referral.js`, `CommissionInvoice.js` |
| Deployment | `DEPLOY.md`, `ecosystem.config.cjs`, `nginx.conf` — pm2 app "sambid" on 141.136.44.84 |

---

## 10. Important cautions for AI sessions

1. **Never enable schedulers locally** — they share SAM.gov quota with production.
2. **Prices come from the DB** — never hardcode; `initPlans.js` is seed-only.
3. **Paywall is server-side** — don't leak locked opportunity data to trial/free users.
4. **Trashed/deleted users get no emails or feed distribution** (commit edae44a).
5. `.env` files are gitignored — secrets live on the VPS and local machines only.
6. `frontend/src/routes/AppRoutes.jsx` is dead code — routing is in `App.jsx`.
7. Old database data was abandoned — current DB is cluster `cluster0786`.

*Last updated: 2026-07-17. Keep this file current when features/plans/pages change.*
