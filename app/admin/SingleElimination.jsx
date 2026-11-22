
import { useRef } from "react";

import {
  BracketSection,
  BracketConnections,
  ChampionCard,
} from "./BracketParts";

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
  const boardRef = useRef(null);

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
    <div
      className="bracket-board"
      data-format="single"
      ref={boardRef}
    >
      <BracketConnections boardRef={boardRef} />

      {sections.map((section) => (
        <BracketSection
          key={section.key}
          section={section}
          {...roundProps}
        />
      ))}

      <ChampionCard
        champion={champion}
        championPlayers={championPlayers}
        championAverage={championAverage}
      />
    </div>
  );
}
