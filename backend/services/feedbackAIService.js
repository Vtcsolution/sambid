// backend/services/feedbackAIService.js
// Turns raw user feedback (Suggestion docs - bug reports, improvement asks,
// general complaints, feature requests) into a short AI summary + concrete
// bullet points for the admin notification, instead of admins having to read
// the raw free-text every time. Falls back to no summary (plain notification
// still goes out) when no AI key is configured - never blocks submission.
import { openaiChat } from './geminiService.js';

const SYSTEM_PROMPT = `You are a sharp product manager reviewing user feedback for Sambid, an AI-powered federal contract discovery platform (SAM.gov matching, AI proposal writing, bid analysis, etc). A contractor company just submitted feedback. Read it and extract what actually needs to change, in plain, specific language a busy founder can act on in 10 seconds.

Return ONLY this JSON, no markdown fence, no extra text:
{"summary":"one blunt sentence naming the core problem or request","bullets":["specific actionable point","...","..."]}

Rules:
- 2-5 bullets, each one specific and actionable - never vague ("improve UX") without saying what's actually wrong or wanted
- If the feedback is negative/a complaint, bullets should name the specific pain point(s), not just restate "user is unhappy"
- If it's a feature request, bullets should describe what the feature would need to actually do
- Never invent details the feedback didn't mention
- Plain text only inside the JSON strings, no markdown bold/bullets inside the bullet strings themselves`;

export async function summarizeFeedback({ title, category, description, companyName }) {
  const userPrompt = `CATEGORY: ${category || 'general'}
COMPANY: ${companyName || 'unknown'}
TITLE: ${title}
FEEDBACK:
${description}`;

  const raw = await openaiChat(SYSTEM_PROMPT, userPrompt, 500);
  const clean = raw.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  const parsed = JSON.parse(clean);
  if (!parsed.summary || !Array.isArray(parsed.bullets) || parsed.bullets.length === 0) {
    throw new Error('AI returned an incomplete summary');
  }
  return { summary: parsed.summary, bullets: parsed.bullets.slice(0, 5) };
}
