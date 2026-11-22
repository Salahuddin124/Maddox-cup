// Round Robin bracket and standings. Like the elimination formats, every value
// and callback is supplied through props by MatchSchemes.

import { BracketSection, ChampionCard } from "./BracketParts";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

export default function RoundRobin({
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
      <div className="bracket-board" data-format="round-robin">
        {sections.map((section) => (
          <BracketSection key={section.key} section={section} {...roundProps} />
        ))}

        <ChampionCard
          champion={champion}
          championPlayers={championPlayers}
          championAverage={championAverage}
          eyebrow="Round robin winner"
          emptyText="Play every match"
        />
      </div>

      <section
        className="round-robin-standings"
        aria-labelledby="round-robin-standings-heading"
      >
        <div className="round-robin-standings-head">
          <h4 id="round-robin-standings-heading">Standings</h4>
          <span>{decidedCount} of {matchCount} matches decided</span>
        </div>

        <div className="round-robin-table-wrap">
          <table className="round-robin-table">
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
                  <tr key={row.teamId} className={index === 0 && champion ? "is-leader" : ""}>
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
