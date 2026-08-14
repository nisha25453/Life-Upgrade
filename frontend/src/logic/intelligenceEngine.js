import { LIFE_AREAS } from "./assessmentModel";
import { DISCLAIMER, getBehaviour, getPrimarySource, getSources, inferSkillTrack } from "./recommendationCatalog";

// =============================================================================
// SCORING SEMANTICS (v2)
//   1 = strongest, 10 = needs most attention.
//   Life Score X / 100 stays "higher is better" (inverted headline number).
// v3 INSIGHT UPGRADE (2026-02-11):
//   Every insight now derives from ≥ 2 of the user's actual answers.
//   New pattern detector powers the Life Twin ("Patterns worth noticing").
//   Current State returns 2–3 findings; Next Best Action names goal + area + obstacle.
// =============================================================================

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export const averageRating = (ratings) =>
  Object.values(ratings).reduce((sum, value) => sum + Number(value), 0) / 6;

export const calculateScore = (ratings) => {
  const avg = averageRating(ratings);
  return Math.round(clamp((10 - avg) * 100 / 9, 0, 100));
};

export const getStrongestArea = (ratings) =>
  LIFE_AREAS.reduce((best, area) => (Number(ratings[area.key]) < Number(ratings[best.key]) ? area : best), LIFE_AREAS[0]);

export const getMostUrgentArea = (ratings) =>
  LIFE_AREAS.reduce((most, area) => (Number(ratings[area.key]) > Number(ratings[most.key]) ? area : most), LIFE_AREAS[0]);

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

// =============================================================================
// PATTERN DETECTOR — new in v3
// Detects meaningful combinations of answers across dimensions. Each pattern
// carries: pattern name, what it suggests, one specific tip, and a priority
// number for sorting. Used by Life Twin ("Patterns worth noticing").
// =============================================================================

const detectPatterns = (assessment) => {
  const r = assessment.ratings;
  const money = assessment.money || {};
  const career = assessment.career || {};
  const health = assessment.health || {};
  const productivity = assessment.productivity || {};
  const learning = assessment.learning || {};
  const relationships = assessment.relationships || {};
  const obstacles = getObstacleList(assessment);
  const moneyFrictions = frictionsFor(assessment, "money");
  const relFrictions = frictionsFor(assessment, "relationships");
  const patterns = [];

  // Wealth-building foundation
  if (r.money >= 6 && (money.debt === "Yes" || money.emergency === "None" || money.investments === "None")) {
    const parts = [];
    if (money.debt === "Yes") parts.push("high-interest debt");
    if (money.emergency === "None") parts.push("no emergency fund");
    if (money.investments === "None") parts.push("no regular investing");
    const joined = parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] : parts[0];
    patterns.push({
      key: "wealth-foundation",
      pattern: "Wealth-building foundation is thin",
      suggests: `You flagged ${joined}. Foundational blocks come before wealth products.`,
      tip: "Before any new investment, size a first emergency-fund milestone equal to one month of essentials and list any debts above 12% interest. SEBI Investor and AMFI both have free investor-education modules that walk through this without product pitches.",
      priority: 1,
    });
  }

  // Recovery/routine stack
  const sleepPoor = health.sleep === "Poor" || health.sleep === "Fair";
  const lowExercise = health.exercise === "Rarely" || health.exercise === "1–2 days/week";
  if (sleepPoor && health.stress === "High" && lowExercise) {
    patterns.push({
      key: "recovery",
      pattern: "Recovery routine is under-load",
      suggests: `Poor sleep (${health.sleep}), high stress and ${health.exercise} exercise are stacking — each amplifies the other.`,
      tip: "Fix the sleep window first: same lights-off time for 10 nights, phone left outside the bedroom. WHO's physical-activity guidance plus a 10-minute walk after lunch adds movement without willpower cost.",
      priority: 1,
    });
  }

  // Career transition without a bridge
  if (career.goal === "Career switch" && career.targetRole && r.career >= 5) {
    const track = inferSkillTrack(career.targetRole);
    patterns.push({
      key: "career-transition",
      pattern: "Career transition needs a bridge, not a leap",
      suggests: `You're targeting "${career.targetRole}" while your career is at ${r.career}/10 today. Applications tend to underperform when the skill map isn't specific yet.`,
      tip: `List three skills the target role expects that your current role does not build. Pick one gap. ${track.course} is a good first bridge, closed with one small evidence project.`,
      priority: 2,
    });
  }

  // Career + Learning misalignment
  if (career.targetRole && r.career >= 5 && r.learning >= 6) {
    patterns.push({
      key: "career-learning-misalign",
      pattern: "Career and learning are moving in opposite directions",
      suggests: `You want to move toward "${career.targetRole}" but learning is at ${r.learning}/10 while career is at ${r.career}/10. Career gains without learning gains rarely stick.`,
      tip: `Pick one specific skill your target role requires and complete two short modules this week. Microsoft Learn's role-based paths give a starting map without paywalls.`,
      priority: 2,
    });
  }

  // Execution loop
  if (obstacles.includes("Procrastination")
    && (productivity.unfinished === "4–6" || productivity.unfinished === "7+")
    && (assessment.consistency === "Rarely" || assessment.consistency === "Sometimes")) {
    patterns.push({
      key: "execution",
      pattern: "Execution loop is broken, not effort",
      suggests: `You have ${productivity.unfinished} unfinished priorities, procrastination as a stated obstacle, and ${assessment.consistency.toLowerCase()} consistency — that's a scheduling problem, not a motivation problem.`,
      tip: "Pick the priority whose delay hurts most. Do a single 30-minute focus block on it before opening email tomorrow. Then close one other unfinished item during the same block over the next three days.",
      priority: 2,
    });
  }

  // Skill-development budget too small
  if (learning.targetSkill && r.learning >= 5 && (learning.time === "Less than 1 hour" || obstacles.includes("Lack of time"))) {
    patterns.push({
      key: "skill-dev",
      pattern: "Skill-development time budget is undersized",
      suggests: `You named "${learning.targetSkill}" as the skill to build, but limited weekly time can stall project-based learning.`,
      tip: `Compress rather than skip: three 30-minute sessions on ${learning.targetSkill} beat one 90-minute session. SWAYAM, NPTEL and Microsoft Learn all have modular tracks matched to that pace.`,
      priority: 3,
    });
  }

  // Investment knowledge before investment decisions
  if (moneyFrictions.includes("Lack of investment knowledge") && (money.investments === "None" || money.investments === "Occasional")) {
    patterns.push({
      key: "money-knowledge",
      pattern: "Investment knowledge gap before investment decisions",
      suggests: "You flagged limited investment knowledge and irregular investing. Knowledge before product reduces expensive early mistakes.",
      tip: "Complete SEBI Investor's Financial Planning primer and AMFI's Mutual Fund modules before any product decision. If retirement is a stated goal, PFRDA's NPS resources are the official starting point.",
      priority: 3,
    });
  }

  // Communication debt
  if (r.relationships >= 6 && (relFrictions.includes("Conflict") || relFrictions.includes("Communication"))) {
    patterns.push({
      key: "communication-debt",
      pattern: "Communication debt is compounding",
      suggests: `${relationships.area || "The relationship"} you flagged is at ${r.relationships}/10 with ${relFrictions.includes("Conflict") ? "unresolved conflict" : "communication friction"}. Small clarifications now prevent large repairs later.`,
      tip: "Book one 15-minute focused conversation this week — one thing you appreciate, one thing you'd like different, one small ask. Greater Good Science Center has short research-backed prompts you can adapt.",
      priority: 2,
    });
  }

  // Meetings-eat-focus pattern
  const prodFrictions = frictionsFor(assessment, "productivity");
  if (prodFrictions.includes("Too many meetings") && r.productivity >= 6) {
    patterns.push({
      key: "meetings-eat-focus",
      pattern: "Meetings are eating focus time",
      suggests: `Productivity is at ${r.productivity}/10 with 'too many meetings' selected as friction. Focus time can't be created without editing the calendar.`,
      tip: "Audit the past two weeks and mark three recurring meetings you can decline, shorten or move async. Microsoft Copilot / Otter can summarise the ones that stay so you don't have to attend live.",
      priority: 2,
    });
  }

  // Goal ambiguity
  if (!assessment.goal || assessment.goal.trim().length < 12) {
    patterns.push({
      key: "goal-clarity",
      pattern: "The headline goal isn't specific yet",
      suggests: "A short or missing goal makes every recommendation below less sharp.",
      tip: "Rewrite your goal so it names one measurable outcome and a time-box (e.g., 'complete Power BI basics and ship one dashboard in 30 days'). This alone often changes what shows up in Top 3 below.",
      priority: 4,
    });
  }

  return patterns.sort((a, b) => a.priority - b.priority);
};

// =============================================================================
// MY CURRENT STATE — v3
// Returns 2–3 findings joined into one paragraph so the existing panel
// renders unchanged. Every finding uses ≥ 2 of the user's actual answers.
// =============================================================================

export const buildCurrentState = (assessment) => {
  const strongest = getStrongestArea(assessment.ratings);
  const urgent = getMostUrgentArea(assessment.ratings);
  const strengthScore = assessment.ratings[strongest.key];
  const urgentScore = assessment.ratings[urgent.key];
  const goal = (assessment.goal || "").trim();
  const findings = [];

  // Finding 1 — Strongest anchor
  findings.push(`Your strongest area is ${strongest.label} at ${strengthScore}/10 (lower is stronger) — that's a real anchor for the moves below.`);

  // Finding 2 — Urgent area with goal or friction cross-reference
  const urgentFriction = frictionsFor(assessment, urgent.key)[0] || getPrimaryObstacle(assessment);
  if (urgent.key === "career" && (assessment.career || {}).targetRole) {
    const track = inferSkillTrack(assessment.career.targetRole);
    findings.push(`${urgent.label} is currently your biggest gap at ${urgentScore}/10, while your target is "${assessment.career.targetRole}". Your existing background is a strength, but the answers suggest a specific ${track.label} skill gap.`);
  } else if (urgent.key === "money" && Array.isArray(assessment.money?.moneyGoals) && assessment.money.moneyGoals.length) {
    findings.push(`${urgent.label} is at ${urgentScore}/10 with money goals ${assessment.money.moneyGoals.join(", ")}. The current answers suggest foundational steps (emergency fund, basic investor education) come before any product decision.`);
  } else if (urgent.key === "learning" && (assessment.learning || {}).targetSkill) {
    findings.push(`${urgent.label} is at ${urgentScore}/10 while your target skill is "${assessment.learning.targetSkill}". The time budget and format you selected are the levers that matter here — not more courses.`);
  } else if (urgentFriction) {
    findings.push(`${urgent.label} is at ${urgentScore}/10 with ${urgentFriction.toLowerCase()} flagged as friction${goal ? ` against your goal to ${goal.toLowerCase().replace(/\.$/, "")}` : ""}.`);
  } else if (goal) {
    findings.push(`${urgent.label} is at ${urgentScore}/10 against your stated goal to ${goal.toLowerCase().replace(/\.$/, "")} — that's the mismatch to close first.`);
  } else {
    findings.push(`${urgent.label} is at ${urgentScore}/10 and needs attention before other goals can move.`);
  }

  // Finding 3 — One meaningful pattern (top-priority detected pattern)
  const patterns = detectPatterns(assessment);
  if (patterns[0]) {
    findings.push(`Pattern worth noticing: ${patterns[0].pattern.toLowerCase()} — ${patterns[0].suggests}`);
  }

  return {
    strongest,
    urgent,
    findings,
    summary: findings.join(" "),
  };
};

// =============================================================================
// LIFE TWIN — v3
// Returns three "patterns worth noticing" strings. Each includes:
//   PATTERN — what it suggests, and ONE specific tip.
// If < 3 patterns detected, fills in with a specific-not-generic guidance line.
// =============================================================================

export const buildTwinInsights = (assessment) => {
  const patterns = detectPatterns(assessment);
  const chosen = patterns.slice(0, 3);
  const insights = chosen.map((p) => `${p.pattern} — ${p.suggests} ${p.tip}`);
  if (insights.length < 3) {
    const strongest = getStrongestArea(assessment.ratings);
    const urgent = getMostUrgentArea(assessment.ratings);
    const fallbackLine = insights.length < 3
      ? `Anchor pattern — ${strongest.label} at ${assessment.ratings[strongest.key]}/10 can carry a small ${urgent.label.toLowerCase()} action. Pair a fixed cue you already keep (morning coffee, commute end) with a 30-minute ${urgent.label.toLowerCase()} block this week.`
      : null;
    if (fallbackLine && insights.length === 2) insights.push(fallbackLine);
    if (insights.length < 3) {
      const [top] = getTopThreePriorities(assessment);
      if (top) insights.push(`Action pattern — for ${top.area.label} at ${top.currentScore}/10, the specific move is: ${top.recommendation.what.toLowerCase()}, ${top.recommendation.when.toLowerCase()}.`);
    }
  }
  return insights.slice(0, 3);
};

// =============================================================================
// PRIORITY ENGINE (unchanged shape, tightened copy)
// =============================================================================

const GOAL_KEYWORDS = {
  health: ["health", "weight", "sleep", "energy", "fit", "run", "gym", "diet", "stress", "yoga"],
  career: ["career", "promot", "job", "role", "salary", "raise", "switch", "manager", "consult", "strategy", "product"],
  money: ["money", "save", "saving", "finance", "invest", "debt", "sip", "retire", "emergency", "insurance", "tax"],
  productivity: ["productiv", "focus", "procrast", "priorit", "meeting", "task", "deadline"],
  learning: ["learn", "skill", "course", "study", "certif", "power bi", "sql", "python", "language", "product management"],
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
    const frictionBoost = Math.min(frictions.length, 3) * 0.3;
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
    const whyThisMatters = entry.goalBoost > 0
      ? `Your goal (${(assessment.goal || "").toLowerCase().replace(/\.$/, "") || "the goal you stated"}) points here directly, and the ${entry.rating}/10 score means it will not move on its own.`
      : `A ${entry.rating}/10 score with ${(entry.frictions[0] || getPrimaryObstacle(assessment) || "current friction").toLowerCase()} means small drift becomes large drift without a scheduled action.`;
    return {
      key: priorityKey,
      tier: TIERS[index] || "OPPORTUNITY",
      area: entry.area,
      currentScore: entry.rating,
      goal: areaGoalText(assessment, entry.area.key),
      whyThisMatters,
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

// =============================================================================
// NEXT BEST ACTION — v3 (explicitly connects goal + urgent area + obstacle)
// =============================================================================

export const buildNextAction = (assessment, actions = {}) => {
  const [top] = getTopThreePriorities(assessment, actions);
  if (!top) return null;
  const goal = (assessment.goal || "").trim();
  const obstacle = getPrimaryObstacle(assessment);
  const goalClause = goal ? `your goal to ${goal.toLowerCase().replace(/\.$/, "")}` : "your assessment answers";
  const obstacleClause = obstacle ? ` and directly counters ${obstacle.toLowerCase()} as your stated obstacle` : "";
  return {
    key: "nba",
    what: top.recommendation.what,
    when: top.recommendation.when,
    howOften: top.recommendation.howOften,
    why: `${top.area.label} is at ${top.currentScore}/10 and is the most urgent lever for ${goalClause}${obstacleClause}.`,
    ifYouDo: top.benefit,
    ifYouDont: top.consequence,
    timeRequired: "About 30 minutes today, then a repeat cadence",
    area: top.area,
    priorityKey: top.key,
    status: (actions.nba && actions.nba.status) || "pending",
    completedAt: (actions.nba && actions.nba.completedAt) || null,
  };
};

// =============================================================================
// FUTURE SELF (unchanged — content-only spec kept these sections stable)
// =============================================================================

const projectAt = (currentScore, deltaPer10Days, days) =>
  clamp(Math.round(currentScore + (deltaPer10Days * days) / 10), 0, 100);

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
  const trendNote = acted
    ? "You have completed the recommended action — the projection reflects momentum from that decision."
    : "You have not yet completed the recommended action — this projection assumes you begin today.";

  return {
    today: { label: "Today", note: top ? `Complete: ${top.what}.` : "Take the assessment first." },
    days10: { label: "10 days", projected: projectAt(score, currentPace + 3, 10), note: per.days10 },
    days30: { label: "30 days", projected: projectAt(score, currentPace + 3, 30), note: per.days30 },
    year1: { label: "1 year", projected: clamp(score + currentPace + 12, 0, 100), note: per.year1 },
    years10: { label: "10 years", projected: clamp(score + currentPace + 20, 0, 100), note: per.years10 },
    trendNote,
  };
};

export const buildFutureScenarios = (score, assessment, actions = {}) => {
  const [top] = getTopThreePriorities(assessment, actions);
  const areaLabel = top ? top.area.label : "your top area";
  const acted = top && top.status === "completed";
  const upgradeGain = acted ? 14 : 10;
  return [
    { key: "current", label: "Current trajectory", projected: clamp(score + 3, 0, 100), delta: "+3",
      note: `If today's rhythm continues, ${areaLabel.toLowerCase()} moves slowly. Progress is real but modest — a useful baseline.` },
    { key: "upgrade", label: "Upgrade trajectory", projected: clamp(score + upgradeGain, 0, 100), delta: `+${upgradeGain}`,
      note: `If the recommended ${areaLabel.toLowerCase()} behaviour is performed consistently, most of the 30-day gain sits here — assuming actions are actually taken.` },
    { key: "neglect", label: "Neglect trajectory", projected: clamp(score - 5, 0, 100), delta: "-5",
      note: `If important actions are repeatedly ignored, ${(getObstacleSummary(assessment) || "current friction").toLowerCase()} may compound and baseline may erode. Risk case, not a prediction.` },
  ];
};

// =============================================================================
// LIFE RISK RADAR (unchanged shape; content already references user answers)
// =============================================================================

const levelFromScore = (rating) => (rating >= 9 ? "HIGH" : rating >= 7 ? "MEDIUM" : rating >= 5 ? "MEDIUM" : "LOW");
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

// =============================================================================
// Per-dimension helper
// =============================================================================
export const getDimensionSummary = (assessment, key) => {
  const score = assessment.ratings[key];
  const frictions = frictionsFor(assessment, key);
  const risks = buildRiskRadar(assessment, {});
  const dimensionRisk = risks.find((risk) => risk.areaKey === key) || risks[0];
  return {
    score,
    frictions,
    dimensionRisk,
    sources: getSources(key),
    behaviour: getBehaviour(key, assessment),
    disclaimer: DISCLAIMER[key],
  };
};
