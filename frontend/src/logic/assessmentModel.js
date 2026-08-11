export const LIFE_AREAS = [
  { key: "health", label: "Health", icon: "✦" },
  { key: "career", label: "Career", icon: "↗" },
  { key: "money", label: "Money", icon: "◌" },
  { key: "productivity", label: "Productivity", icon: "◒" },
  { key: "learning", label: "Learning", icon: "⌁" },
  { key: "relationships", label: "Relationships", icon: "♡" },
];

export const OBSTACLES = ["Procrastination", "Stress", "Lack of time", "Lack of motivation", "Career uncertainty", "Financial pressure", "Poor habits", "Lack of direction"];
export const CONSISTENCY = ["Rarely", "Sometimes", "Usually", "Very consistent"];

export const FRICTIONS = {
  health: ["Procrastination", "Lack of time", "Lack of motivation", "Stress", "Poor eating habits", "Poor sleep", "Lack of knowledge", "Inconsistent routine"],
  career: ["Lack of skills", "Lack of direction", "Lack of confidence", "Resume weakness", "Interview difficulty", "Lack of opportunities", "Career uncertainty", "Lack of time"],
  money: ["Overspending", "Lack of savings", "Debt", "Lack of investment knowledge", "Inconsistent investing", "No emergency fund", "Insurance uncertainty", "Lack of financial planning"],
  productivity: ["Procrastination", "Distractions", "Too many meetings", "Poor planning", "Low energy", "Stress", "Digital overload", "Lack of priorities"],
  learning: ["Lack of time", "Too many options", "Weak fundamentals", "No project practice", "Motivation drops", "Cost concerns", "No mentor", "Digital distractions"],
  relationships: ["Communication", "Conflict", "Trust", "Boundaries", "Lack of time", "Misunderstanding", "Stress", "Emotional distance"],
};

const fieldDefaults = {
  health: { sleep: "", energy: "", stress: "", exercise: "", frictions: [] },
  career: { designation: "", years: "", industry: "", targetRole: "", skills: "", resume: "", goal: "", frictions: [] },
  money: { savings: "", emergency: "", debt: "", investments: "", goals: "", frictions: [] },
  productivity: { focusHours: "", energyPeriod: "", postponing: "", unfinished: "", frictions: [] },
  learning: { targetSkill: "", time: "", format: "", goal: "", frictions: [] },
  relationships: { area: "", focus: "", notes: "", frictions: [] },
};

export const blankAssessment = {
  goal: "",
  selectedAreas: LIFE_AREAS.map((area) => area.key),
  ratings: { health: 5, career: 5, money: 5, productivity: 5, learning: 5, relationships: 5 },
  obstacles: [],
  consistency: "",
  ...fieldDefaults,
};
