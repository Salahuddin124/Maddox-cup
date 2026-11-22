// Shared presentational pieces for both elimination formats. Everything is
// passed in through props so the format components stay pure and reusable.

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
            <span className="bracket-slot-grip" aria-hidden="true">⠿</span>
          ) : null}
          <span className="bracket-slot-name">{team.teamName}</span>
          {isOut ? <span className="bracket-out-tag">OUT</span> : null}
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
}) {
  const next = section.rounds[roundIndex + 1];
  const connect = round.connect ?? (
    next
      ? next.matches.length === round.matches.length ? "straight" : "merge"
      : "none"
  );
  const merge = connect === "merge" && round.matches.length > 1;
  const isSeedRound = section.key === "upper" && roundIndex === 0;

  return (
    <div className={`bracket-round ${roundIndex > 0 ? "has-incoming" : ""}`}>
      <p className="bracket-round-label">{round.label}</p>
      {round.matches.map((match, matchIndex) => (
        <div
          className={`bracket-match ${
            merge
              ? matchIndex % 2 === 0 ? "pair-start" : "pair-end"
              : connect === "straight" ? "is-straight" : ""
          }`}
          key={match.key}
        >
          {[0, 1].map((side) => {
            const slotKey = `${match.key}-${side}`;
            const teamId = boardSlots[slotKey];
            const team =
              teamId === undefined ? null : teamsById.get(Number(teamId)) ?? null;
            const isWinner = Boolean(
              team &&
                winners[match.key] !== undefined &&
                Number(winners[match.key]) === Number(team.id),
            );
            const isOut = Boolean(team && eliminated.has(Number(team.id)));

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
          {connect !== "none" ? (
            <span className="bracket-connector" aria-hidden="true" />
          ) : null}
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
            <span className="champion-crown" aria-hidden="true">♛</span>
            {champion ? (
              <>
                <span className="champion-eyebrow">{eyebrow}</span>
                <span className="champion-name">{champion.teamName}</span>
                <span className="champion-meta">
                  {championPlayers.length} players · avg{" "}
                  {NUMBER_FORMAT.format(championAverage)} MMR
                </span>
              </>
            ) : (
              <>
                <span className="champion-eyebrow">{eyebrow}</span>
                <span className="champion-empty">{emptyText}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
