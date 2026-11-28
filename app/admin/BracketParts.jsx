
import { useEffect, useState } from "react";
import "./bracket-connections.css";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export function BracketSlot({
  slotKey,
  matchKey,
  team,
  isSeed,
  isWinner,
  isOut,
  onPickWinner,
  onDragStart,
  onDrop,
}) {
  return (
    <div
      className={`bracket-slot ${team ? "is-filled" : ""} ${
        isSeed ? "is-seed" : ""
      } ${isWinner ? "is-winner" : ""} ${isOut ? "is-out" : ""}`}
      draggable={Boolean(team && isSeed)}
      onDragStart={
        team && isSeed ? (event) => onDragStart(event, slotKey) : undefined
      }
      onDragOver={isSeed ? (event) => event.preventDefault() : undefined}
      onDrop={isSeed ? (event) => onDrop(event, slotKey) : undefined}
      title={team && isSeed ? "Drag to change the order" : undefined}
    >
      {team ? (
        <>
          {isSeed ? (
            <span className="bracket-slot-grip" aria-hidden="true">
              ⠿
            </span>
          ) : null}

          <span className="bracket-slot-name">{team.teamName}</span>

          {isOut ? (
            <span className="bracket-out-tag">OUT</span>
          ) : null}

          <button
            type="button"
            className={`bracket-win-btn ${isWinner ? "is-active" : ""}`}
            onClick={() => onPickWinner(matchKey, Number(team.id))}
            aria-pressed={isWinner}
            aria-label={`${isWinner ? "Unmark" : "Mark"} ${team.teamName} as the winner`}
            title={isWinner ? "Winner — click to undo" : "Mark as winner"}
          >
            W
          </button>
        </>
      ) : (
        <span className="bracket-slot-empty">
          {isSeed ? "Empty slot" : "Awaiting winner"}
        </span>
      )}
    </div>
  );
}

/**
 * Draws SVG connectors based on the actual positions of match cards.
 * Supports straight connections and two-to-one merge connections.
 */
export function BracketConnections({ boardRef }) {
  const [paths, setPaths] = useState([]);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    let animationFrame = 0;

    const measure = () => {
      cancelAnimationFrame(animationFrame);

      animationFrame = requestAnimationFrame(() => {
        const boardRect = board.getBoundingClientRect();

        const width = Math.max(
          board.scrollWidth,
          board.clientWidth,
        );

        const height = Math.max(
          board.scrollHeight,
          board.clientHeight,
        );

        setDimensions((previous) => {
          if (
            previous.width === width &&
            previous.height === height
          ) {
            return previous;
          }

          return { width, height };
        });

        const sections = new Map();

        board
          .querySelectorAll(".bracket-round[data-round-index]")
          .forEach((roundElement) => {
            const sectionKey = roundElement.dataset.sectionKey;

            if (!sections.has(sectionKey)) {
              sections.set(sectionKey, []);
            }

            sections.get(sectionKey).push(roundElement);
          });

        const nextPaths = [];

        sections.forEach((rounds) => {
          rounds.sort(
            (a, b) =>
              Number(a.dataset.roundIndex) -
              Number(b.dataset.roundIndex),
          );

          rounds.forEach((sourceRound) => {
            const connect = sourceRound.dataset.connect;

            if (
              connect !== "straight" &&
              connect !== "merge"
            ) {
              return;
            }

            const sourceIndex = Number(
              sourceRound.dataset.roundIndex,
            );

            const targetRound = rounds.find(
              (round) =>
                Number(round.dataset.roundIndex) === sourceIndex + 1,
            );

            if (!targetRound) return;

            const sourceMatches = [
              ...sourceRound.querySelectorAll(".bracket-match"),
            ];

            const targetMatches = [
              ...targetRound.querySelectorAll(".bracket-match"),
            ];

            const incoming = new Map();

            sourceMatches.forEach((sourceMatch, index) => {
              const targetIndex =
                connect === "merge"
                  ? Math.floor(index / 2)
                  : index;

              const targetMatch = targetMatches[targetIndex];

              if (!targetMatch) return;

              if (!incoming.has(targetIndex)) {
                incoming.set(targetIndex, {
                  targetMatch,
                  sources: [],
                });
              }

              incoming.get(targetIndex).sources.push(sourceMatch);
            });

            incoming.forEach(({ targetMatch, sources }) => {
              const targetRect = targetMatch.getBoundingClientRect();

              const targetX =
                targetRect.left -
                boardRect.left +
                board.scrollLeft;

              const targetY =
                targetRect.top +
                targetRect.height / 2 -
                boardRect.top +
                board.scrollTop;

              const sourcePositions = sources.map((source) => {
                const rect = source.getBoundingClientRect();

                return {
                  x:
                    rect.right -
                    boardRect.left +
                    board.scrollLeft,
                  y:
                    rect.top +
                    rect.height / 2 -
                    boardRect.top +
                    board.scrollTop,
                };
              });

              const sourceRight = Math.max(
                ...sourcePositions.map((position) => position.x),
              );

              const middleX =
                sourceRight + (targetX - sourceRight) / 2;

              if (sourcePositions.length === 1) {
                const source = sourcePositions[0];

                nextPaths.push(
                  `M ${source.x} ${source.y} H ${middleX} V ${targetY} H ${targetX}`,
                );

                return;
              }

              // Individual horizontal branches from source matches.
              sourcePositions.forEach((source) => {
                nextPaths.push(
                  `M ${source.x} ${source.y} H ${middleX}`,
                );
              });

              // Shared vertical junction.
              const junctionYs = [
                ...sourcePositions.map((position) => position.y),
                targetY,
              ];

              nextPaths.push(
                `M ${middleX} ${Math.min(...junctionYs)} V ${Math.max(...junctionYs)}`,
              );

              // Final horizontal segment into the target match.
              nextPaths.push(
                `M ${middleX} ${targetY} H ${targetX}`,
              );
            });
          });
        });

        setPaths(nextPaths);
      });
    };

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;

    resizeObserver?.observe(board);

    board
      .querySelectorAll(".bracket-match")
      .forEach((match) => resizeObserver?.observe(match));

    const mutationObserver = new MutationObserver(measure);

    mutationObserver.observe(board, {
      childList: true,
      subtree: true,
    });

    window.addEventListener("resize", measure);
    board.addEventListener("scroll", measure);

    measure();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", measure);
      board.removeEventListener("scroll", measure);
    };
  }, [boardRef]);

  return (
   <svg
  className="bracket-connections"
  aria-hidden="true"
  preserveAspectRatio="none"
  viewBox={`0 0 ${dimensions.width || 1} ${dimensions.height || 1}`}
  style={{
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
  }}
>
      {paths.map((path, index) => (
        <g key={index}>
          <path
            className="bracket-wire-glow"
            d={path}
          />
          <path
            className="bracket-wire-core"
            d={path}
          />
        </g>
      ))}
    </svg>
  );
}

export function BracketRound({
  round,
  roundIndex,
  section,
  boardSlots,
  teamsById,
  winners,
  eliminated,
  onPickWinner,
  onDragStart,
  onDrop,
  schedule,
  onScheduleChange,
  showSchedule = false,
}) {
  const next = section.rounds[roundIndex + 1];
  const scheduled = schedule?.[round.key] ?? {};
  const canSchedule = Boolean(showSchedule && onScheduleChange);

  const connect =
    round.connect ??
    (next
      ? next.matches.length === round.matches.length
        ? "straight"
        : "merge"
      : "none");

  const isSeedRound =
    section.key === "upper" && roundIndex === 0;

  return (
    <div
      className={`bracket-round ${roundIndex > 0 ? "has-incoming" : ""}`}
      data-section-key={section.key}
      data-round-index={roundIndex}
      data-connect={connect}
    >
      <p className="bracket-round-label">{round.label}</p>

      {canSchedule ? (
        <div className="bracket-round-schedule">
          <input
            type="date"
            className="bracket-schedule-input"
            value={scheduled.date ?? ""}
            aria-label={`Date for ${section.label ?? "bracket"} ${round.label}`}
            onChange={(event) =>
              onScheduleChange(round.key, "date", event.target.value)
            }
          />
          <input
            type="time"
            className="bracket-schedule-input"
            value={scheduled.time ?? ""}
            aria-label={`Time for ${section.label ?? "bracket"} ${round.label}`}
            onChange={(event) =>
              onScheduleChange(round.key, "time", event.target.value)
            }
          />
        </div>
      ) : null}

      {canSchedule && (scheduled.date || scheduled.time) ? (
        <p className="bracket-schedule-print">
          {[scheduled.date, scheduled.time].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      {round.matches.map((match, matchIndex) => (
        <div
          className="bracket-match"
          data-match-index={matchIndex}
          key={match.key}
        >
          {[0, 1].map((side) => {
            const slotKey = `${match.key}-${side}`;
            const teamId = boardSlots[slotKey];

            const team =
              teamId === undefined
                ? null
                : teamsById.get(Number(teamId)) ?? null;

            const isWinner = Boolean(
              team &&
                winners[match.key] !== undefined &&
                Number(winners[match.key]) === Number(team.id),
            );

            const isOut = Boolean(
              team && eliminated.has(Number(team.id)),
            );

            return (
              <BracketSlot
                key={side}
                slotKey={slotKey}
                matchKey={match.key}
                team={team}
                isSeed={isSeedRound}
                isWinner={isWinner}
                isOut={isOut}
                onPickWinner={onPickWinner}
                onDragStart={onDragStart}
                onDrop={onDrop}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function BracketSection({ section, ...roundProps }) {
  return (
    <div className="bracket-section">
      <p className="bracket-section-label">{section.label}</p>

      <div className="bracket-section-rounds">
        {section.rounds.map((round, index) => (
          <BracketRound
            key={round.key}
            round={round}
            roundIndex={index}
            section={section}
            {...roundProps}
          />
        ))}
      </div>
    </div>
  );
}

export function ChampionCard({
  champion,
  championPlayers,
  championAverage,
  eyebrow = "Maddoxx Cup winner",
  emptyText = "Awaiting the final",
}) {
  return (
    <div className="bracket-section bracket-champion-section">
      <p className="bracket-section-label">Champion</p>

      <div className="bracket-section-rounds">
        <div className="bracket-round bracket-champion">
          <p className="bracket-round-label">&nbsp;</p>

          <div className={`champion-card ${champion ? "is-filled" : ""}`}>
            <span className="champion-crown" aria-hidden="true">
              ♛
            </span>

            {champion ? (
              <>
                <span className="champion-eyebrow">
                  {eyebrow}
                </span>

                <span className="champion-name">
                  {champion.teamName}
                </span>

                <span className="champion-meta">
                  {championPlayers.length} players · avg{" "}
                  {NUMBER_FORMAT.format(championAverage)} MMR
                </span>
              </>
            ) : (
              <>
                <span className="champion-eyebrow">
                  {eyebrow}
                </span>

                <span className="champion-empty">
                  {emptyText}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
