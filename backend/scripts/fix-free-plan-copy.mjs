// One-time content fix: the Free Trial plan's description/feature list still
// described the old self-serve "5-day, 3/day, no AI tools" trial. Since the
// automatic signup promo now grants full Enterprise access (all AI tools,
// unlimited matches, API access) for the first 7 days, the pricing page was
// actively contradicting itself - showing AI tools/priority support/API
// access as NOT included right under a "7 Days Free" badge promising the
// opposite. Brings the DB content in line with what actually happens.
import "dotenv/config";
import mongoose from "mongoose";
import Plan from "../models/Plan.js";

async function main() {
  await mongoose.connect(process.env.MONGO_URI_API);

  const updated = await Plan.findOneAndUpdate(
    { name: "free" },
    {
      description: "Every feature unlocked free for 7 days, no credit card required",
      features: [
        { name: "All Enterprise features unlocked for 7 days", included: true },
        { name: "Unlimited contract matches during your free week", included: true },
        { name: "SAM.gov + FPDS + USASpending search", included: true },
        { name: "AI proposal writer, compliance matrix & more", included: true },
        { name: "150 AI credits included", included: true },
        { name: "Priority support", included: true },
        { name: "API access", included: true },
        { name: "Then continues on a standard 5-day trial", included: true },
      ],
    },
    { new: true }
  );

  console.log("Updated Free plan:");
  console.log(JSON.stringify(updated.toObject(), null, 2));
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
