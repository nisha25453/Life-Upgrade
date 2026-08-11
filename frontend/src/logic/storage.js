import { blankAssessment, SCHEMA_VERSION } from "./assessmentModel";

const STORAGE_KEY = "life-upgrade-ai-state";
const UPGRADED_FLAG = "life-upgrade-ai-upgraded";

// Bumped when scoring semantics or storage shape changed materially.
// If we see an older/absent version we clear state so users retake with the correct meaning.

const normalize = (state) => {
  if (!state || !state.assessment) return state;
  const raw = state.assessment;
  const legacyObstacles = Array.isArray(raw.obstacles)
    ? raw.obstacles
    : typeof raw.obstacle === "string" && raw.obstacle.trim()
      ? [raw.obstacle]
      : [];
  const assessment = { ...blankAssessment, ...raw, obstacles: legacyObstacles };
  delete assessment.obstacle;
  // money.moneyGoals normalization (legacy `money.goals` string → array)
  const legacyMoney = raw.money || {};
  const moneyGoals = Array.isArray(legacyMoney.moneyGoals)
    ? legacyMoney.moneyGoals
    : typeof legacyMoney.goals === "string" && legacyMoney.goals.trim()
      ? [legacyMoney.goals]
      : [];
  assessment.money = { ...blankAssessment.money, ...(raw.money || {}), moneyGoals };
  delete assessment.money.goals;
  assessment.schemaVersion = SCHEMA_VERSION;
  const actions = state.actions && typeof state.actions === "object" ? state.actions : {};
  return { ...state, assessment, actions };
};

export const loadState = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw) return null;
    // Force re-take if schema is missing or older than current.
    if (!raw.assessment || raw.assessment.schemaVersion !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(UPGRADED_FLAG, "1");
      return null;
    }
    return normalize(raw);
  } catch {
    return null;
  }
};

export const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(UPGRADED_FLAG);
};

export const consumeUpgradedFlag = () => {
  const value = localStorage.getItem(UPGRADED_FLAG);
  if (value) localStorage.removeItem(UPGRADED_FLAG);
  return !!value;
};
