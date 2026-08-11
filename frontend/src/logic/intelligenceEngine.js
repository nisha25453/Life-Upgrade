import { LIFE_AREAS } from "./assessmentModel";

// ---------- Base scoring ----------
export const calculateScore = (ratings) =>
  Math.round((Object.values(ratings).reduce((sum, value) => sum + Number(value), 0) / 6) * 10);

export const getLowestArea = (ratings) =>
  LIFE_AREAS.reduce((low, area) => (Number(ratings[area.key]) < Number(ratings[low.key]) ? area : low), LIFE_AREAS[0]);

export const getStrongestArea = (ratings) =>
  LIFE_AREAS.reduce((s, area) => (Number(ratings[area.key]) > Number(ratings[s.key]) ? area : s), LIFE_AREAS[0]);

export const getInsight = (score) =>
  score >= 8 ? "A steady foundation to build from." : score >= 5 ? "A clear opportunity for your next small move." : "A gentle place to begin with one small step.";

const frictionsFor = (assessment, key) => (assessment[key] && assessment[key].frictions) || [];

// Read the multi-select obstacles array (with legacy string fallback for safety).
const getObstacleList = (assessment) => {
  if (Array.isArray(assessment.obstacles)) return assessment.obstacles;
  if (typeof assessment.obstacle === "string" && assessment.obstacle.trim()) return [assessment.obstacle];
  return [];
};

export const getPrimaryObstacle = (assessment) => getObstacleList(assessment)[0] || "";

export const getObstacleSummary = (assessment) => {
  const list = getObstacleList(assessment);
  if (list.length === 0) return "";
  if (list.length === 1) return list[0].toLowerCase();
  if (list.length === 2) return `${list[0].toLowerCase()} and ${list[1].toLowerCase()}`;
  return list.slice(0, -1).map((value) => value.toLowerCase()).join(", ") + `, and ${list[list.length - 1].toLowerCase()}`;
};

// ---------- Top 2 Opportunities ----------
export const getTopOpportunities = (assessment) => {
  const candidateAreas = assessment.selectedAreas && assessment.selectedAreas.length
    ? LIFE_AREAS.filter((area) => assessment.selectedAreas.includes(area.key))
    : LIFE_AREAS;
  const sorted = [...candidateAreas].sort((a, b) => assessment.ratings[a.key] - assessment.ratings[b.key]);
  return sorted.slice(0, 2).map((area, index) => {
    const friction = frictionsFor(assessment, area.key)[0] || getPrimaryObstacle(assessment) || "inconsistent routine";
    const goalText = (assessment.goal || "make meaningful progress").trim();
    const reason = index === 0
      ? `${area.label} is at ${assessment.ratings[area.key]}/10 and is your clearest lever right now. Your goal to ${goalText.toLowerCase()} runs into ${friction.toLowerCase()} — a small, scheduled move here compounds fastest.`
      : `${area.label} is at ${assessment.ratings[area.key]}/10 and is a strong second focus once your first move is holding. Same friction pattern — ${friction.toLowerCase()} — so a shared cue can serve both.`;
    return { area, rank: index + 1, score: assessment.ratings[area.key], reason };
  });
};

// ---------- Cross-domain Life Twin synthesis ----------
export const buildTwinInsights = (assessment) => {
  const strongest = getStrongestArea(assessment.ratings);
  const lowest = getLowestArea(assessment.ratings);
  const [op1, op2] = getTopOpportunities(assessment);
  const consistent = assessment.consistency === "Very consistent" || assessment.consistency === "Usually";
  const goalText = (assessment.goal || "improve").trim();

  return [
    `${strongest.label} (${assessment.ratings[strongest.key]}/10) is currently your strongest area — a useful anchor to attach a small ${lowest.label.toLowerCase()} action to.`,
    op2
      ? `${op1.area.label} and ${op2.area.label} are your two clearest levers for the goal to ${goalText.toLowerCase()} — a single scheduled cue can serve both.`
      : `${op1.area.label} is your single clearest lever for the goal to ${goalText.toLowerCase()}.`,
    consistent
      ? `Your ${assessment.consistency.toLowerCase()} rhythm is an asset — pair one fixed daily cue with a 20-minute action so ${op1.area.label.toLowerCase()} becomes automatic.`
      : `${assessment.consistency || "Inconsistent"} rhythm is your main constraint — shrink the first action until ${getObstacleSummary(assessment) || "friction"} can no longer stop it.`,
  ];
};

// ---------- Next Best Action (What / When / How long / Why) ----------
const NEXT_ACTION_TEMPLATES = {
  health: (a) => ({
    what: "Take a brisk 20-minute walk outdoors",
    when: "After lunch today",
    how: "20 minutes at a comfortable, conversational pace",
    why: `A gentle, low-friction move that improves ${a.health?.energy ? a.health.energy.toLowerCase() : "energy"} and stress before compounding into a routine.`,
  }),
  career: (a) => ({
    what: `List three skills required for ${a.career?.targetRole || "your next role"} and mark the one clearest gap`,
    when: "At 6:00pm today",
    how: "20 minutes, on paper or a single doc — no research rabbit holes",
    why: `Names a concrete direction before applications, which reduces ${(frictionsFor(a, "career")[0] || "career uncertainty").toLowerCase()}.`,
  }),
  money: (a) => ({
    what: "Review one week of discretionary spending and circle the biggest recurring leak",
    when: "Before dinner today",
    how: "20 minutes with your bank or UPI history — no new tools",
    why: `Turns a vague money worry into one small, visible edit — the fastest path to ${(a.money?.goals || "financial breathing room").toLowerCase()}.`,
  }),
  productivity: (a) => ({
    what: "Complete one 20-minute focus block on your most postponed priority",
    when: "Before opening any non-essential app or meeting",
    how: "20 minutes, phone in another room, one browser tab",
    why: `Directly counters ${(frictionsFor(a, "productivity")[0] || "distractions").toLowerCase()} while proving to yourself that starting is possible.`,
  }),
  learning: (a) => ({
    what: `Spend 20 minutes on one project-based lesson toward ${a.learning?.targetSkill || "your target skill"}`,
    when: "Tonight",
    how: "20 minutes, one free resource — no course collecting",
    why: `Small, project-based reps beat course collecting, especially when time is limited to ${a.learning?.time || "a modest weekly budget"}.`,
  }),
  relationships: (a) => ({
    what: "Send one thoughtful message that opens a calm conversation",
    when: "Tonight before bed",
    how: "Three to five sentences — no problem-solving in the message",
    why: `Small, specific messages rebuild rhythm with your ${(a.relationships?.area || "person").toLowerCase()} without pressure to resolve everything at once.`,
  }),
};

export const buildNextAction = (assessment) => {
  const [top] = getTopOpportunities(assessment);
  const template = NEXT_ACTION_TEMPLATES[top.area.key](assessment);
  return { ...template, area: top.area };
};

// ---------- Future Self · 30 days · 3 scenarios ----------
export const buildFutureScenarios = (score, assessment) => {
  const [top] = getTopOpportunities(assessment);
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
  return [
    {
      key: "current",
      label: "Current pace",
      projected: clamp(score + 3),
      delta: "+3",
      note: `Sticking with today's rhythm, ${top.area.label} inches upward. Progress is real but slow — a good baseline to compare against.`,
    },
    {
      key: "improved",
      label: "Improved consistency",
      projected: clamp(score + 10),
      delta: "+10",
      note: `Ten to twelve small, scheduled ${top.area.label.toLowerCase()} actions across 30 days compound noticeably — most of the gain sits here.`,
    },
    {
      key: "low",
      label: "Low consistency",
      projected: clamp(score - 4),
      delta: "-4",
      note: `Skipped actions and unmanaged ${getObstacleSummary(assessment) || "friction"} slowly erode your baseline — the risk case, not a prediction.`,
    },
  ];
};

// ---------- Life Risk Radar ----------
const levelFromScore = (score) => (score <= 3 ? "HIGH" : score <= 6 ? "MEDIUM" : "LOW");

export const buildRiskRadar = (assessment) => {
  const r = assessment.ratings;
  const health = assessment.health || {};
  const career = assessment.career || {};
  const money = assessment.money || {};
  const productivity = assessment.productivity || {};
  const learning = assessment.learning || {};

  const goalRisk = assessment.consistency === "Rarely" ? "HIGH" : assessment.consistency === "Sometimes" ? "MEDIUM" : "LOW";
  const stressLoad = health.stress === "High" ? 8 : health.stress === "Moderate" ? 5 : 2;
  const sleepStrain = health.sleep === "Poor" || health.sleep === "Fair";
  const burnoutLevel = (stressLoad >= 7 && sleepStrain) || (r.productivity <= 3 && stressLoad >= 5)
    ? "HIGH"
    : stressLoad >= 5 || sleepStrain
      ? "MEDIUM"
      : "LOW";

  const goalPreview = assessment.goal ? assessment.goal.trim().slice(0, 60) + (assessment.goal.length > 60 ? "…" : "") : "unspecified";

  return [
    {
      key: "goal",
      label: "Goal follow-through risk",
      level: goalRisk,
      why: `${assessment.consistency || "Unclear"} consistency + goal "${goalPreview}" makes big-jump commitments fragile.`,
      response: "Shrink the goal to the next 20-minute scheduled action.",
    },
    {
      key: "burnout",
      label: "Stress / burnout signal",
      level: burnoutLevel,
      why: `${health.stress || "Unrated"} stress meets ${health.sleep || "unrated"} sleep and ${health.energy || "unrated"} energy — a load pattern worth watching.`,
      response: "Choose one recovery action (walk, sleep window, screen-off block); consult a qualified professional if concerns persist.",
    },
    {
      key: "wellness",
      label: "Health signal",
      level: levelFromScore(r.health),
      why: `${r.health}/10 health rating with ${health.exercise || "unrated"} exercise cadence.`,
      response: "Anchor one movement action to an existing daily habit (after lunch, before shower).",
    },
    {
      key: "career",
      label: "Career direction risk",
      level: r.career <= 3 || (career.goal === "Career switch" && !career.targetRole) ? "HIGH" : r.career <= 6 ? "MEDIUM" : "LOW",
      why: `${r.career}/10 career score${career.targetRole ? ` and target role "${career.targetRole}"` : " with no target role named yet"}.`,
      response: "Name one target role and one skill gap before applying anywhere.",
    },
    {
      key: "money",
      label: "Financial resilience signal",
      level: r.money <= 3 || money.emergency === "None" || money.debt === "Yes" ? "HIGH" : r.money <= 6 ? "MEDIUM" : "LOW",
      why: `${r.money}/10 money score with a ${money.emergency || "unrated"} emergency fund and ${money.debt || "unrated"} high-interest debt.`,
      response: "Write a small emergency-fund milestone; verify major decisions with a qualified financial professional.",
    },
    {
      key: "learning",
      label: "Skill gap signal",
      level: levelFromScore(r.learning),
      why: `${r.learning}/10 learning score with ${learning.time || "unrated"} weekly time reserved for ${learning.targetSkill || "the target skill"}.`,
      response: "Reserve the time you selected for one free, project-based resource.",
    },
    {
      key: "productivity",
      label: "Focus and follow-through signal",
      level: r.productivity <= 3 || productivity.postponing === "Very often" ? "HIGH" : r.productivity <= 6 ? "MEDIUM" : "LOW",
      why: `${r.productivity}/10 productivity score with ${productivity.postponing || "unrated"} postponement and ${productivity.unfinished || "unrated"} unfinished priorities.`,
      response: "Protect one 20-minute block before non-essential apps or meetings.",
    },
  ];
};

// ---------- Per-dimension helper for expandable card ----------
export const getDimensionSummary = (assessment, key) => {
  const score = assessment.ratings[key];
  const frictions = frictionsFor(assessment, key);
  const risks = buildRiskRadar(assessment);
  const dimensionRisk = risks.find((risk) => {
    if (key === "health") return risk.key === "wellness";
    if (key === "productivity") return risk.key === "productivity";
    return risk.key === key;
  }) || risks[0];
  return { score, frictions, dimensionRisk };
};
