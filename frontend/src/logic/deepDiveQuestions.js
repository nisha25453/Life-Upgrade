import { FRICTIONS } from "./assessmentModel";

// Deep-dive schema per dimension. Each item renders as a compact row inside a single step.
export const DEEP_DIVE = {
  health: {
    label: "Health · a closer look",
    intro: "A short read on how your body feels, moves, and recovers.",
    fields: [
      { key: "sleep", label: "How is your sleep quality?", type: "radio", options: ["Poor", "Fair", "Good", "Excellent"] },
      { key: "energy", label: "How are your daily energy levels?", type: "radio", options: ["Low", "Moderate", "High"] },
      { key: "stress", label: "How would you rate your stress?", type: "radio", options: ["Low", "Moderate", "High"] },
      { key: "exercise", label: "How often do you exercise?", type: "radio", options: ["Rarely", "1–2 days/week", "3–4 days/week", "5+ days/week"] },
      { key: "frictions", label: "What is getting in the way? (select any)", type: "multi", options: FRICTIONS.health },
    ],
  },
  career: {
    label: "Career · a closer look",
    intro: "Text-only résumé fields. Nothing leaves your browser.",
    fields: [
      { key: "designation", label: "Current role or designation", type: "text", placeholder: "e.g. Product Manager" },
      { key: "years", label: "Years of experience", type: "text", placeholder: "e.g. 4" },
      { key: "industry", label: "Current industry", type: "text", placeholder: "e.g. Fintech" },
      { key: "targetRole", label: "Target role or next step", type: "text", placeholder: "e.g. Senior PM at a growth-stage SaaS company" },
      { key: "skills", label: "Top three skills you'd bring", type: "text", placeholder: "e.g. Roadmap planning, user research, SQL" },
      { key: "resume", label: "Paste key résumé highlights (optional, text only)", type: "textarea", placeholder: "Achievements, certifications, notable projects…" },
      { key: "goal", label: "Your career goal", type: "radio", options: ["Promotion", "Career switch", "Skill development", "Higher salary", "Better work-life balance"] },
      { key: "frictions", label: "What is holding you back? (select any)", type: "multi", options: FRICTIONS.career },
    ],
  },
  money: {
    label: "Money · a closer look",
    intro: "General patterns only. No account numbers, no linking.",
    fields: [
      { key: "savings", label: "Do you save consistently?", type: "radio", options: ["Yes, monthly", "Sometimes", "Rarely", "No"] },
      { key: "emergency", label: "Emergency fund status", type: "radio", options: ["None", "Less than 1 month", "1–3 months", "3–6 months", "6+ months"] },
      { key: "debt", label: "Do you have high-interest debt?", type: "radio", options: ["Yes", "Some", "No"] },
      { key: "investments", label: "Do you invest regularly?", type: "radio", options: ["None", "Occasional", "Regular"] },
      { key: "goals", label: "Primary money goal", type: "radio", options: ["Emergency fund", "Pay off debt", "Invest for future", "Buy a home", "Retirement planning"] },
      { key: "frictions", label: "What's slowing your money goals? (select any)", type: "multi", options: FRICTIONS.money },
    ],
  },
  productivity: {
    label: "Productivity · a closer look",
    intro: "How your attention and follow-through are behaving lately.",
    fields: [
      { key: "focusHours", label: "Daily deep-focus hours (average)", type: "radio", options: ["Less than 1", "1–3", "3–5", "5+"] },
      { key: "energyPeriod", label: "When are you most focused?", type: "radio", options: ["Morning", "Afternoon", "Evening", "Night"] },
      { key: "postponing", label: "How often do you postpone important tasks?", type: "radio", options: ["Rarely", "Sometimes", "Often", "Very often"] },
      { key: "unfinished", label: "Unfinished priorities right now", type: "radio", options: ["0", "1–3", "4–6", "7+"] },
      { key: "frictions", label: "What is breaking your focus? (select any)", type: "multi", options: FRICTIONS.productivity },
    ],
  },
  learning: {
    label: "Learning · a closer look",
    intro: "One skill, one small commitment — that is enough for now.",
    fields: [
      { key: "targetSkill", label: "The one skill you want to build", type: "text", placeholder: "e.g. Data analysis with SQL" },
      { key: "goal", label: "Why this skill? (short)", type: "text", placeholder: "e.g. Move into an analyst role next year" },
      { key: "time", label: "Weekly learning time you can commit", type: "radio", options: ["Less than 1 hour", "1–3 hours", "3–5 hours", "5+ hours"] },
      { key: "format", label: "Preferred format", type: "radio", options: ["Free", "Paid", "Project-based", "Certified"] },
      { key: "frictions", label: "What's blocking your learning? (select any)", type: "multi", options: FRICTIONS.learning },
    ],
  },
  relationships: {
    label: "Relationships · a closer look",
    intro: "Focus on one relationship where a small move would matter most.",
    fields: [
      { key: "area", label: "Which relationship needs attention?", type: "radio", options: ["Partner", "Family", "Friends", "Work", "Community"] },
      { key: "focus", label: "What are you looking to improve?", type: "radio", options: ["Communication", "Trust", "Boundaries", "Time together", "Conflict resolution"] },
      { key: "frictions", label: "What is getting in the way? (select any)", type: "multi", options: FRICTIONS.relationships },
      { key: "notes", label: "Anything else you want to note (optional)", type: "textarea", placeholder: "A specific situation, a name you want to remember…" },
    ],
  },
};

export const isDeepDiveComplete = (assessment, key) => {
  const schema = DEEP_DIVE[key];
  if (!schema) return true;
  return schema.fields.every((field) => {
    const value = assessment[key]?.[field.key];
    if (field.type === "multi") return true; // frictions optional
    if (field.type === "textarea") return true; // notes/resume optional
    if (field.type === "text" && (field.key === "resume" || field.key === "notes")) return true;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
};
