import { getLowestArea, getStrongestArea } from "./scoreEngine";

export const buildTwinInsights = ({ ratings, consistency }) => {
  const strongest = getStrongestArea(ratings);
  const lowest = getLowestArea(ratings);
  const consistencyText = consistency === "Very consistent" || consistency === "Usually" ? "Your consistency is a useful asset." : "Small, repeatable actions can make consistency feel easier.";
  return [
    `Your strongest area is ${strongest.label}.`,
    `Your biggest growth opportunity is ${lowest.label}.`,
    consistencyText,
  ];
};