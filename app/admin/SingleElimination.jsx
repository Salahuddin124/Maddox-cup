// Single Elimination bracket. This component owns only the single-bracket
// layout; every value and callback arrives through props from MatchSchemes.

import { BracketSection, ChampionCard } from "./BracketParts";

export default function SingleElimination({
  sections = [],
  boardSlots = {},
  teamsById,
  winners = {},
  eliminated,
  champion,
  championPlayers = [],
  championAverage = 0,
  onPickWinner,
  onDragStart,
  onDrop,
}) {
  const roundProps = {
    boardSlots,
    teamsById,
    winners,
    eliminated,
    onPickWinner,
    onDragStart,
    onDrop,
  };

  return (
    <div className="bracket-board" data-format="single">
      {sections.map((section) => (
        <BracketSection key={section.key} section={section} {...roundProps} />
      ))}

      <ChampionCard
        champion={champion}
        championPlayers={championPlayers}
        championAverage={championAverage}
      />
    </div>
  );
}
