// Double Elimination bracket. This component owns the upper/lower/grand-final
// layout; every value and callback arrives through props from MatchSchemes.

import { BracketSection, ChampionCard } from "./BracketParts";

export default function DoubleElimination({
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

  const upper = sections.find((section) => section.key === "upper");
  const rest = sections.filter((section) => section.key !== "upper");

  return (
    <div className="bracket-board" data-format="double">
      {upper ? <BracketSection section={upper} {...roundProps} /> : null}
      {rest.map((section) => (
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
