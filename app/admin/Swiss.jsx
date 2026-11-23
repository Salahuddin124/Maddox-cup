// Swiss stage bracket and standings. Presentational only — every value and
// callback arrives through props from MatchSchemes, like the other formats.

import { BracketSection, ChampionCard } from "./BracketParts";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export default function Swiss({
  sections = [],
  boardSlots = {},
  teamsById,
  winners = {},
  eliminated,
  standings = [],
  decidedCount = 0,
  matchCount = 0,
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
    <>
      <div className="bracket-board" data-format="swiss">
        {sections.map((section) => (
          <BracketSection key={section.key} section={section} {...roundProps} />
        ))}

        <ChampionCard
          champion={champion}
          championPlayers={championPlayers}
          championAverage={championAverage}
          eyebrow="Swiss stage winner"
          emptyText="Play every round"
        />
      </div>

      <section
        className="round-robin-standings swiss-standings"
        aria-labelledby="swiss-standings-heading"
      >
        <div className="round-robin-standings-head">
          <h4 id="swiss-standings-heading">Standings</h4>
          <span>{decidedCount} of {matchCount} matches decided</span>
        </div>

        <div className="round-robin-table-wrap">
          <table className="round-robin-table swiss-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Team</th>
                <th scope="col">W</th>
                <th scope="col">L</th>
                <th scope="col">Win rate</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => {
                const team = teamsById.get(Number(row.teamId));
                const teamName = team?.teamName ?? `Team ${row.teamId}`;

                return (
                  <tr
                    key={row.teamId}
                    className={index === 0 && champion ? "is-leader" : ""}
                  >
                    <td className="rr-rank">{index + 1}</td>
                    <td>
                      <span className="rr-team">
                        <span className="schemes-team-avatar" aria-hidden="true">
                          {String(teamName).trim().charAt(0).toUpperCase()}
                        </span>
                        <span className="rr-team-name">{teamName}</span>
                      </span>
                    </td>
                    <td className="rr-number">{row.wins}</td>
                    <td className="rr-number">{row.losses}</td>
                    <td className="rr-number">
                      {row.played === 0
                        ? "—"
                        : `${NUMBER_FORMAT.format(row.winRate)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
