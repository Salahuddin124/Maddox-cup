
import { useRef } from "react";

import {
  BracketSection,
  BracketConnections,
  ChampionCard,
} from "./BracketParts";

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

  const upper = sections.find(
    (section) => section.key === "upper",
  );

  const lower = sections.find(
    (section) => section.key === "lower",
  );

  const grandFinal = sections.find(
    (section) =>
      section.key === "grand-final" ||
      section.key === "final",
  );

  const otherSections = sections.filter(
    (section) =>
      !["upper", "lower", "grand-final", "final"].includes(
        section.key,
      ),
  );

  return (
    <div
      className="bracket-board bracket-double-board"
      data-format="double"
      ref={boardRef}
    >
      <BracketConnections boardRef={boardRef} />

      <div className="double-bracket-lanes">
        {upper && (
          <div className="double-bracket-lane upper-lane">
            <BracketSection
              section={upper}
              {...roundProps}
            />
          </div>
        )}

        {lower && (
          <div className="double-bracket-lane lower-lane">
            <BracketSection
              section={lower}
              {...roundProps}
            />
          </div>
        )}

        {otherSections.map((section) => (
          <div
            className="double-bracket-lane"
            key={section.key}
          >
            <BracketSection
              section={section}
              {...roundProps}
            />
          </div>
        ))}
      </div>

      {grandFinal && (
        <div className="double-grand-final">
          <BracketSection
            section={grandFinal}
            {...roundProps}
          />
        </div>
      )}

      <ChampionCard
        champion={champion}
        championPlayers={championPlayers}
        championAverage={championAverage}
      />
    </div>
  );
}
