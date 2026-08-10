import { LIFE_AREAS } from "./assessmentModel";

export const calculateScore = (ratings) => Math.round((Object.values(ratings).reduce((sum, value) => sum + Number(value), 0) / 6) * 10);
export const getLowestArea = (ratings) => LIFE_AREAS.reduce((lowest, area) => Number(ratings[area.key]) < Number(ratings[lowest.key]) ? area : lowest, LIFE_AREAS[0]);
export const getStrongestArea = (ratings) => LIFE_AREAS.reduce((strongest, area) => Number(ratings[area.key]) > Number(ratings[strongest.key]) ? area : strongest, LIFE_AREAS[0]);
export const getInsight = (score) => score >= 8 ? "A steady foundation to build from." : score >= 5 ? "A clear opportunity for your next small move." : "A gentle place to begin with one small step.";