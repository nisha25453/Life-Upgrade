import { LIFE_AREAS } from "./assessmentModel";
import { DISCLAIMER, getBehaviour, getPrimarySource, getSources } from "./recommendationCatalog";

// =============================================================================
// SCORING SEMANTICS (v2)
// -----------------------------------------------------------------------------
//   1 = strongest / lowest need for attention
//   10 = weakest / highest need for attention
//
// Dimension score interpretation:
//   1–2  strong
//   3–4  good
//   5–6  moderate
//   7–8  needs attention
//   9–10 critical priority
//
// The Life Score displayed as X / 100 stays "higher is better" (inverted from
// the 1–10 dimension scale) so the headline number matches user intuition.
// =============================================================================

// ---------- Base scoring ----------
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export const averageRating = (ratings) =>
  Object.values(ratings).reduce((sum, value) => sum + Number(value), 0) / 6;

export const calculateScore = (ratings) => {
  const avg = averageRating(ratings);
  // Map 1 → 100, 5.5 → 50, 10 → 0.
  return Math.round(clamp((10 - avg) * 100 / 9, 0, 100));
};

export const getStrongestArea = (ratings) =>
  LIFE_AREAS.reduce((best, area) => (Number(ratings[area.key]) < Number(ratings[best.key]) ? area : best), LIFE_AREAS[0]);

export const getMostUrgentArea = (ratings) =>
  LIFE_AREAS.reduce((most, area) => (Number(ratings[area.key]) > Number(ratings[most.key]) ? area : most), LIFE_AREAS[0]);

// Backward-compatible alias (was `getLowestArea` under old semantics).
export const getLowestArea = getMostUrgentArea;

export const dimensionLabel = (rating) => {
  const r = Number(rating);
  if (r <= 2) return "Strong";
  if (r <= 4) return "Good";
  if (r <= 6) return "Moderate";
  if (r <= 8) return "Needs attention";
  return "Critical priority";
};

export const getInsight = (rating) => {
  const r = Number(rating);
  if (r <= 2) return "Currently strong — a useful anchor for other areas.";
  if (r <= 4) return "Broadly good — protect what is working.";
  if (r <= 6) return "Moderate — small, specific moves compound fastest here.";
  if (r <= 8) return "Needs attention — a scheduled action this week would matter.";
  return "Critical priority — treat this as the next focus.";
};

// ---------- Obstacle helpers ----------
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
  return list.slice(0, -1).map((v) => v.toLowerCase()).join(", ") + `, and ${list[list.length - 1].toLowerCase()}`;
};

const frictionsFor = (assessment, key) => (assessment[key] && assessment[key].frictions) || [];

// ---------- MY CURRENT STATE ----------
export const buildCurrentState = (assessment) => {
  const strongest = getStrongestArea(assessment.ratings);
  const urgent = getMostUrgentArea(assessment.ratings);
  const goal = (assessment.goal || "").trim();
  const mainFriction = frictionsFor(assessment, urgent.key)[0] || getPrimaryObstacle(assessment) || "an unclear routine";
  const strengthScore = assessment.ratings[strongest.key];
  const urgentScore = assessment.ratings[urgent.key];

  const goalClause = goal
    ? ` Your stated goal is to ${goal.toLowerCase().replace(/\.$/, "")}.`
    : " You have not stated a headline goal yet — naming one sharpens everything below.";

  return {
    strongest,
    urgent,
    summary: `Your strongest area is ${strongest.label} at ${strengthScore}/10 (lower is stronger), while ${urgent.label} is currently your biggest gap at ${urgentScore}/10.${goalClause} The friction most likely slowing you down is ${mainFriction.toLowerCase()}.`,
  };
};

// ---------- PRIORITY ENGINE ----------
const GOAL_KEYWORDS = {
  health: ["health", "weight", "sleep", "energy", "fit", "run", "gym", "diet", "stress"],
  career: ["career", "promot", "job", "role", "salary", "raise", "switch", "manager"],
  money: ["money", "save", "saving", "finance", "invest", "debt", "sip", "retire", "emergency", "insurance", "tax"],
  productivity: ["productiv", "focus", "procrast", "priorit", "meeting", "task", "deadline"],
  learning: ["learn", "skill", "course", "study", "certif", "power bi", "sql", "python", "language"],
  relationships: ["relationship", "family", "partner", "spouse", "friend", "communicat", "team", "conflict"],
};

const goalMentionsArea = (goalText, areaKey) => {
  const g = (goalText || "").toLowerCase();
  return (GOAL_KEYWORDS[areaKey] || []).some((keyword) => g.includes(keyword));
};

const consistencyPenalty = (consistency) => {
  if (consistency === "Rarely") return 1.0;
  if (consistency === "Sometimes") return 0.5;
  return 0;
};

export const buildPriorityScores = (assessment) => {
  const goal = assessment.goal || "";
  const consistency = assessment.consistency || "";
  return LIFE_AREAS.map((area) => {
    const rating = Number(assessment.ratings[area.key]);
    const frictions = frictionsFor(assessment, area.key);
    const goalBoost = goalMentionsArea(goal, area.key) ? 1.5 : 0;
    const frictionBoost = Math.min(frictionsFor(assessment, area.key).length, 3) * 0.3;
    const consistencyBoost = consistencyPenalty(consistency);
    const urgency = rating + goalBoost + frictionBoost + consistencyBoost;
    return { area, rating, frictions, goalBoost, urgency };
  }).sort((a, b) => b.urgency - a.urgency);
};

const TIERS = ["URGENT", "IMPORTANT", "OPPORTUNITY"];

const buildProblemLine = (entry, assessment) => {
  const friction = entry.frictions[0] || getPrimaryObstacle(assessment) || "an inconsistent routine";
  const goalMention = entry.goalBoost > 0 ? " and it lines up with your stated goal" : "";
  return `${entry.area.label} is at ${entry.rating}/10 with ${friction.toLowerCase()}${goalMention}.`;
};

const areaGoalText = (assessment, areaKey) => {
  const area = assessment[areaKey] || {};
  if (areaKey === "career" && area.targetRole) return `Move toward ${area.targetRole}`;
  if (areaKey === "career" && area.goal) return area.goal;
  if (areaKey === "learning" && area.goal) return area.goal;
  if (areaKey === "learning" && area.targetSkill) return `Build ${area.targetSkill}`;
  if (areaKey === "money" && Array.isArray(area.moneyGoals) && area.moneyGoals.length) return area.moneyGoals.join(", ");
  if (areaKey === "relationships" && area.focus) return area.focus;
  return assessment.goal || "Improve this area";
};

export const getTopThreePriorities = (assessment, actions = {}) => {
  const ranked = buildPriorityScores(assessment).slice(0, 3);
  return ranked.map((entry, index) => {
    const behaviour = getBehaviour(entry.area.key, assessment);
    const source = getPrimarySource(entry.area.key);
    const priorityKey = `priority-${entry.area.key}`;
    const state = actions[priorityKey] || { status: "pending" };
    return {
      key: priorityKey,
      tier: TIERS[index] || "OPPORTUNITY",
      area: entry.area,
      currentScore: entry.rating,
      goal: areaGoalText(assessment, entry.area.key),
      problem: buildProblemLine(entry, assessment),
      recommendation: behaviour,
      benefit: behaviour.benefit,
      consequence: behaviour.consequence,
      source,
      disclaimer: DISCLAIMER[entry.area.key],
      status: state.status,
      completedAt: state.completedAt || null,
    };
  });
};

// ---------- LIFE TWIN (coach synthesis, 3 rich paragraphs) ----------
export const buildTwinInsights = (assessment) => {
  const state = buildCurrentState(assessment);
  const priorities = getTopThreePriorities(assessment);
  const top = priorities[0];
  if (!top) return [];
  const consistency = (assessment.consistency || "Inconsistent").toLowerCase();
  const summary = getObstacleSummary(assessment) || "current friction";

  return [
    `What is happening — ${state.summary} The rating pattern suggests ${top.area.label.toLowerCase()} is what most needs a decision this week.`,
    `Why it matters — ${top.area.label} at ${top.currentScore}/10 collides with ${summary}. Under a ${consistency} rhythm, without a specific behaviour to break the cycle, this area is unlikely to move on its own.`,
    `What to do vs. what happens if you don't — ${top.recommendation.what.toLowerCase()} on ${top.recommendation.when.toLowerCase()}. If you do this consistently, ${top.benefit.toLowerCase()} If you don't, ${top.consequence.toLowerCase()}`,
  ];
};

// ---------- NEXT BEST ACTION ----------
export const buildNextAction = (assessment, actions = {}) => {
  const [top] = getTopThreePriorities(assessment, actions);
  if (!top) return null;
  return {
    key: "nba",
    what: top.recommendation.what,
    when: top.recommendation.when,
    howOften: top.recommendation.howOften,
    why: `${top.area.label} is at ${top.currentScore}/10 and ranks as your most urgent lever right now — ${top.problem.toLowerCase()}`,
    ifYouDo: top.benefit,
    ifYouDont: top.consequence,
    timeRequired: "About 30 minutes today, then a repeat cadence",
    area: top.area,
    priorityKey: top.key,
    status: (actions.nba && actions.nba.status) || "pending",
    completedAt: (actions.nba && actions.nba.completedAt) || null,
  };
};

// ---------- FUTURE SELF · HORIZONS ----------
const projectAt = (currentScore, deltaPer10Days, days) => clamp(Math.round(currentScore + (deltaPer10Days * days) / 10), 0, 100);

export const buildFutureHorizons = (score, assessment, actions = {}) => {
  const top = buildNextAction(assessment, actions);
  const areaKey = top ? top.area.key : "productivity";
  const areaLabel = top ? top.area.label : "your top priority";
  const acted = top && top.status === "completed";

  const perAreaHorizon = {
    health: {
      days10: "If activity remains consistent for 10 days and food intake supports a mild calorie deficit, a small gradual improvement in weight or energy may be possible (approximately 0.5 kg for some people; results vary substantially).",
      days30: "If activity remains consistent for 30 days, walking pace and daily energy may steady, and sleep quality may improve modestly.",
      year1: "If the routine holds for a year, movement volume compounds and baseline fitness may improve meaningfully — the exact change depends on nutrition, sleep, and health history.",
      years10: "Over a decade, consistent daily movement is associated with a lower risk of several chronic conditions — not a guarantee, but a strong direction.",
    },
    career: {
      days10: `If ${areaLabel.toLowerCase()} skill practice starts within 10 days, you should have one clear skill map and a first evidence project underway.`,
      days30: "If practice continues for 30 days, one demonstrable project can be attached to your résumé — increasing readiness for roles that require it.",
      year1: "If practice compounds for a year, portfolio depth may unlock interviews for roles at the next level — outcomes depend on market and role fit.",
      years10: "Over a decade, deliberate compounding on a small number of durable skills tends to widen career optionality — not a promise of a specific role.",
    },
    money: {
      days10: "If the review runs within 10 days, one recurring leak can be reduced and a first savings target named.",
      days30: "If the habit runs 30 days, savings discipline may increase and one emergency-fund milestone may be reachable — actual amounts depend on income and essentials.",
      year1: "For example, if ₹5,000 per month is set aside for one year, contributions alone would total ₹60,000 before considering any returns. Actual investment value depends on the vehicle and market conditions.",
      years10: "Over ten years, disciplined contributions and diversified allocation may accumulate significantly — real outcomes depend on returns and are not guaranteed.",
    },
    productivity: {
      days10: "If the daily focus block runs on 5 weekdays across 10 days, the number of overdue priorities is likely to visibly drop.",
      days30: "If the block runs across 30 days, deadline pressure and rework may reduce, and one recurring meeting may be cuttable.",
      year1: "If the habit holds a year, a compounding effect on annual output is likely — the exact change depends on the work being protected.",
      years10: "Over a decade, protected deep-work time is a strong lever for expert-level output — not automatic, but well-observed.",
    },
    learning: {
      days10: "If 3 project-based sessions run in 10 days, one small artefact exists — enough to demonstrate initial capability.",
      days30: "If sessions continue 30 days, one complete project can be shipped and shared, which improves readiness for related roles.",
      year1: "If the routine holds a year, you may develop portfolio-grade depth in the target skill — job outcomes still depend on market fit.",
      years10: "Over a decade, deep skill compounding is one of the more reliable career levers, though outcomes depend on how the skill is applied.",
    },
    relationships: {
      days10: "If the message is sent and the conversation happens in 10 days, coordination or closeness may steady.",
      days30: "If honest conversations continue for 30 days, unresolved friction may reduce and trust may compound.",
      year1: "Over a year, sustained repair practices tend to widen the range of what the relationship can absorb — not a guarantee, but a strong signal.",
      years10: "Over a decade, small repeated repair actions accumulate — outcomes depend on both people's engagement.",
    },
  };

  const per = perAreaHorizon[areaKey];
  const currentPace = acted ? 3 : 0;
  const trendNote = acted ? "You have completed the recommended action — the projection reflects momentum from that decision." : "You have not yet completed the recommended action — this projection assumes you begin today.";

  return {
    today: {
      label: "Today",
      note: top ? `Complete: ${top.what}.` : "Take the assessment first.",
    },
    days10: {
      label: "10 days",
      projected: projectAt(score, currentPace + 3, 10),
      note: per.days10,
    },
    days30: {
      label: "30 days",
      projected: projectAt(score, currentPace + 3, 30),
      note: per.days30,
    },
    year1: {
      label: "1 year",
      projected: clamp(score + currentPace + 12, 0, 100),
      note: per.year1,
    },
    years10: {
      label: "10 years",
      projected: clamp(score + currentPace + 20, 0, 100),
      note: per.years10,
    },
    trendNote,
  };
};

// ---------- FUTURE SELF · 3 TRAJECTORIES ----------
export const buildFutureScenarios = (score, assessment, actions = {}) => {
  const [top] = getTopThreePriorities(assessment, actions);
  const areaLabel = top ? top.area.label : "your top area";
  const acted = top && top.status === "completed";
  const upgradeGain = acted ? 14 : 10;
  return [
    {
      key: "current",
      label: "Current trajectory",
      projected: clamp(score + 3, 0, 100),
      delta: "+3",
      note: `If today's rhythm continues, ${areaLabel.toLowerCase()} moves slowly. Progress is real but modest — a useful baseline.`,
    },
    {
      key: "upgrade",
      label: "Upgrade trajectory",
      projected: clamp(score + upgradeGain, 0, 100),
      delta: `+${upgradeGain}`,
      note: `If the recommended ${areaLabel.toLowerCase()} behaviour is performed consistently, most of the 30-day gain sits here — assuming actions are actually taken.`,
    },
    {
      key: "neglect",
      label: "Neglect trajectory",
      projected: clamp(score - 5, 0, 100),
      delta: "-5",
      note: `If important actions are repeatedly ignored, ${(getObstacleSummary(assessment) || "current friction").toLowerCase()} may compound and baseline may erode. Risk case, not a prediction.`,
    },
  ];
};

// ---------- LIFE RISK RADAR ----------
const levelFromScore = (rating) => (rating >= 9 ? "HIGH" : rating >= 7 ? "MEDIUM" : rating >= 5 ? "MEDIUM" : "LOW");

// If the action associated with an area has been completed, downgrade risk one step and mark as "Improving".
const improvedLevel = (level) => (level === "HIGH" ? "MEDIUM" : level === "MEDIUM" ? "LOW" : "LOW");

const areaCompleted = (actions, areaKey) => {
  const entry = actions[`priority-${areaKey}`];
  return entry && entry.status === "completed";
};

export const buildRiskRadar = (assessment, actions = {}) => {
  const r = assessment.ratings;
  const health = assessment.health || {};
  const career = assessment.career || {};
  const money = assessment.money || {};
  const productivity = assessment.productivity || {};
  const learning = assessment.learning || {};

  const goalRisk = assessment.consistency === "Rarely" ? "HIGH" : assessment.consistency === "Sometimes" ? "MEDIUM" : "LOW";
  const stressLoad = health.stress === "High" ? 8 : health.stress === "Moderate" ? 5 : 2;
  const sleepStrain = health.sleep === "Poor" || health.sleep === "Fair";
  const burnoutLevel = (stressLoad >= 7 && sleepStrain) || (r.productivity >= 7 && stressLoad >= 5) ? "HIGH" : stressLoad >= 5 || sleepStrain ? "MEDIUM" : "LOW";
  const goalPreview = assessment.goal ? assessment.goal.trim().slice(0, 60) + (assessment.goal.length > 60 ? "…" : "") : "unspecified";

  const raw = [
    { key: "goal", areaKey: null, label: "Goal follow-through risk", level: goalRisk, why: `${assessment.consistency || "Unclear"} consistency + goal "${goalPreview}" makes big-jump commitments fragile.`, response: "Shrink the goal to the next 30-minute scheduled action." },
    { key: "burnout", areaKey: "health", label: "Stress signal", level: burnoutLevel, why: `${health.stress || "Unrated"} stress meets ${health.sleep || "unrated"} sleep and ${health.energy || "unrated"} energy — a load pattern worth watching.`, response: "Choose one recovery action (walk, sleep window, screen-off block). Consult a qualified professional if concerns persist." },
    { key: "wellness", areaKey: "health", label: "Health / wellness risk", level: levelFromScore(r.health), why: `${r.health}/10 health rating with ${health.exercise || "unrated"} exercise cadence.`, response: "Anchor one movement action to an existing daily habit (after lunch, before shower)." },
    { key: "career", areaKey: "career", label: "Career direction risk", level: r.career >= 9 || (career.goal === "Career switch" && !career.targetRole) ? "HIGH" : r.career >= 7 ? "MEDIUM" : "LOW", why: `${r.career}/10 career score${career.targetRole ? ` and target role "${career.targetRole}"` : " with no target role named yet"}.`, response: "Name one target role and one skill gap before applying anywhere." },
    { key: "money", areaKey: "money", label: "Financial discipline risk", level: r.money >= 9 || money.emergency === "None" || money.debt === "Yes" ? "HIGH" : r.money >= 7 ? "MEDIUM" : "LOW", why: `${r.money}/10 money score with a ${money.emergency || "unrated"} emergency fund and ${money.debt || "unrated"} high-interest debt.`, response: "Write a small emergency-fund milestone; verify decisions with a qualified financial professional." },
    { key: "learning", areaKey: "learning", label: "Skill gap risk", level: levelFromScore(r.learning), why: `${r.learning}/10 learning score with ${learning.time || "unrated"} weekly time reserved for ${learning.targetSkill || "the target skill"}.`, response: "Reserve the selected time for one free, project-based resource." },
    { key: "productivity", areaKey: "productivity", label: "Focus and follow-through risk", level: r.productivity >= 9 || productivity.postponing === "Very often" ? "HIGH" : r.productivity >= 7 ? "MEDIUM" : "LOW", why: `${r.productivity}/10 productivity score with ${productivity.postponing || "unrated"} postponement.`, response: "Protect one 30-minute block before non-essential apps or meetings." },
  ];

  return raw.map((risk) => {
    if (risk.areaKey && areaCompleted(actions, risk.areaKey)) {
      return { ...risk, level: improvedLevel(risk.level), improving: true, response: `${risk.response} — improving now that a specific action has been logged.` };
    }
    return { ...risk, improving: false };
  });
};

// ---------- Per-dimension helper for expandable card ----------
export const getDimensionSummary = (assessment, key) => {
  const score = assessment.ratings[key];
  const frictions = frictionsFor(assessment, key);
  const risks = buildRiskRadar(assessment, {});
  const dimensionRisk = risks.find((risk) => risk.areaKey === key) || risks[0];
  return { score, frictions, dimensionRisk, sources: getSources(key), behaviour: getBehaviour(key, assessment), disclaimer: DISCLAIMER[key] };
};
