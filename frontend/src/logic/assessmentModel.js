export const LIFE_AREAS = [
  { key: "health", label: "Health", icon: "✦" },
  { key: "career", label: "Career", icon: "↗" },
  { key: "money", label: "Money", icon: "◌" },
  { key: "productivity", label: "Productivity", icon: "◒" },
  { key: "learning", label: "Learning", icon: "⌁" },
  { key: "relationships", label: "Relationships", icon: "♡" },
];

export const OBSTACLES = ["Procrastination", "Stress", "Lack of time", "Lack of motivation", "Career uncertainty", "Financial pressure", "Poor habits"];
export const CONSISTENCY = ["Rarely", "Sometimes", "Usually", "Very consistent"];

export const blankAssessment = {
  goal: "",
  selectedAreas: [],
  ratings: LIFE_AREAS.reduce((result, area) => ({ ...result, [area.key]: 5 }), {}),
  obstacle: "",
  consistency: "",
};