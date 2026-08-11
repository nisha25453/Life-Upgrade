import { blankAssessment } from "./assessmentModel";

const STORAGE_KEY = "life-upgrade-ai-state";

// Migrate any legacy single-value `obstacle` field into the new `obstacles` array.
// Also fill in any missing defaults so newly-added fields don't crash older sessions.
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
  return { ...state, assessment };
};

export const loadState = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw) return null;
    const migrated = normalize(raw);
    // Persist the normalized shape so the legacy `obstacle` key is cleaned up on disk too.
    if (raw.assessment && (raw.assessment.obstacle !== undefined || !Array.isArray(raw.assessment.obstacles))) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return null;
  }
};

export const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
export const clearState = () => localStorage.removeItem(STORAGE_KEY);
