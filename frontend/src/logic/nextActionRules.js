export const buildNextAction = ({ goal, obstacle, lowestArea }) => {
  const goalText = goal.trim() || `improve your ${lowestArea.label.toLowerCase()}`;
  return `Spend 20 minutes taking one concrete step toward ${goalText.toLowerCase()} — starting with ${lowestArea.label.toLowerCase()} despite ${obstacle.toLowerCase()}.`;
};