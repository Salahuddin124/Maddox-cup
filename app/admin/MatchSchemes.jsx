"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { buildBlueprint, getDownstream, resolveBracket } from "./bracket";
import DoubleElimination from "./DoubleElimination";
import SingleElimination from "./SingleElimination";
import { MATCH_SCHEME_STYLES } from "./match-scheme-styles";
import RoundRobin from "./RoundRobin";
import { buildRoundRobin, resolveRoundRobin } from "./roundRobin";
import Swiss from "./Swiss";
import { buildSwiss, getSwissDownstream, resolveSwiss } from "./swiss";
import {
  moveTeam,
  resetBracket,
  selectScheme,
  setFormat,
  setSeed,
  setWinner,
} from "./schemeStore";

const NUMBER_FORMAT = new Intl.NumberFormat("en-US");

function average(values) {
  if (values.length === 0) return 0;

  return Math.round(
    values.reduce((total, value) => total + Number(value || 0), 0) /
      values.length,
  );
}

function MatchSchemesPanel({ teams = [] }) {
  const dispatch = useDispatch();
  const { format, slots, winners, seed } = useSelector(selectScheme);

  const teamsById = new Map(teams.map((team) => [Number(team.id), team]));
  const signature = teams.map((team) => Number(team.id)).join(",");

  const size = Math.max(2, 2 ** Math.ceil(Math.log2(Math.max(teams.length, 2))));
  const upperCount = size / 2;
  const isRoundRobin = format === "round-robin";
  const isSwiss = format === "swiss";

  // Seed order is shared by every format. The opening pairs define it, and
  // round robin uses the same order to build its all-play-all schedule.
  const seedOrderIds = useMemo(() => {
    const ordered = [];

    for (let match = 0; match < upperCount; match += 1) {
      [0, 1].forEach((side) => {
        const id = seed.slots[`u-0-${match}-${side}`];
        if (id !== undefined && !ordered.includes(Number(id))) {
          ordered.push(Number(id));
        }
      });
    }

    // A cache from an older shape can miss a team; append it defensively.
    signature.split(",").filter(Boolean).map(Number).forEach((id) => {
      if (!ordered.includes(id)) ordered.push(id);
    });

    return ordered;
  }, [seed.slots, signature, upperCount]);

  const blueprint = useMemo(
    () => isSwiss
      ? buildSwiss(seedOrderIds, winners)
      : isRoundRobin
        ? buildRoundRobin(seedOrderIds)
        : buildBlueprint(format, upperCount),
    [format, isRoundRobin, isSwiss, seedOrderIds, upperCount, winners],
  );

  // Teams start in a standard 1v8 / 4v5 / 2v7 / 3v6 style spread. The seed is
  // stored in Redux (and therefore cached) so a reload restores the positions.
  // A cache whose signature matches but whose slots are empty/incomplete (left
  // by an older build) must be reseeded, otherwise Round 1 renders blank.
  const seededIds = Object.values(seed.slots).map(Number);
  const seedReady =
    signature !== "" &&
    seed.signature === signature &&
    seededIds.length > 0 &&
    teams.every((team) => seededIds.includes(Number(team.id)));

  useEffect(() => {
    if (signature === "" || seedReady) return;

    const ids = signature.split(",").map(Number);
    const ordered = [];

    for (let index = 0; index < Math.ceil(ids.length / 2); index += 1) {
      ordered.push(ids[index]);
      const opponent = ids[ids.length - 1 - index];
      if (opponent !== undefined && opponent !== ids[index]) {
        ordered.push(opponent);
      }
    }
    for (const id of ids) {
      if (!ordered.includes(id)) ordered.push(id);
    }

    const seeded = {};
    for (let match = 0; match < upperCount; match += 1) {
      for (let side = 0; side < 2; side += 1) {
        const id = ordered[match * 2 + side];
        if (id !== undefined) seeded[`u-0-${match}-${side}`] = id;
      }
    }

    dispatch(setSeed({ signature, slots: seeded }));
    // seed.slots identity changes when the cache hydrates. Without it here a
    // stale cached seed can overwrite a fresh one and leave Round 1 blank.
  }, [dispatch, seed.slots, seedReady, signature, upperCount]);

  // Only the seeded round is stored. Elimination brackets derive later slots
  // and drops; round robin derives the full schedule and live standings.
  const resolved = useMemo(
    () => isSwiss
      ? resolveSwiss(blueprint, winners)
      : isRoundRobin
        ? resolveRoundRobin(blueprint, winners)
        : resolveBracket(blueprint, slots, winners),
    [blueprint, isRoundRobin, isSwiss, slots, winners],
  );
  const { boardSlots, eliminated, matchCount, standings } = resolved;

  const decidedCount = Object.keys(winners).length;

  const championId = isRoundRobin || isSwiss
    ? resolved.championId
    : winners[blueprint.finalKey];
  const champion =
    championId === undefined ? null : teamsById.get(Number(championId)) ?? null;
  const championPlayers =
    champion && Array.isArray(champion.players) ? champion.players : [];
  const championAverage = average(
    championPlayers.map((player) => Number(player.currentMmr) || 0),
  );

  const seedOrder = new Map(seedOrderIds.map((id, index) => [id, index + 1]));

  const handleDragStart = (event, slotKey) => {
    event.dataTransfer.setData("text/plain", slotKey);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event, slotKey) => {
    event.preventDefault();
    const from = event.dataTransfer.getData("text/plain");
    if (from) dispatch(moveTeam({ from, to: slotKey }));
  };

  const handleWinner = (matchKey, teamId) => {
    dispatch(setWinner({
      matchKey,
      teamId,
      downstream: isSwiss
        ? getSwissDownstream(blueprint, matchKey)
        : getDownstream(blueprint, matchKey),
    }));
  };

  // Everything the format components need is passed explicitly through props.
  // They stay presentational; Redux access and callbacks remain in this container.
  const bracketProps = {
    sections: blueprint.sections,
    boardSlots,
    teamsById,
    winners,
    eliminated,
    standings,
    decidedCount,
    matchCount,
    champion,
    championPlayers,
    championAverage,
    onPickWinner: handleWinner,
    onDragStart: handleDragStart,
    onDrop: handleDrop,
  };

  return (
    <>
      <section className="scheme-builder" aria-labelledby="builder-heading">
        <div className="builder-head">
          <div>
            <h3 id="builder-heading">Bracket preview</h3>
            <p>
              Round 1 teams are locked in — drag them to change the order. Click
              <strong> W </strong> on a team to pick the winner.
              {format === "double" ? (
                <> In Double Elimination, upper-bracket losers drop to the lower bracket instead of going out; the last team standing is crowned at the end.</>
              ) : null}
              {isRoundRobin ? (
                <> In Round Robin, every team plays every other team once; standings decide the winner.</>
              ) : null}
              {isSwiss ? (
                <> In the Swiss stage, teams are paired by record each round with no eliminations; standings decide the winner.</>
              ) : null}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => dispatch(resetBracket())}
          >
            Reset bracket
          </button>
        </div>

        <div className="format-switch" role="group" aria-label="Match format">
          <button
            type="button"
            className={format === "single" ? "is-active" : ""}
            aria-pressed={format === "single"}
            onClick={() => dispatch(setFormat("single"))}
          >
            Single Elimination
          </button>
          <button
            type="button"
            className={format === "double" ? "is-active" : ""}
            aria-pressed={format === "double"}
            onClick={() => dispatch(setFormat("double"))}
          >
            Double Elimination
          </button>
          <button
            type="button"
            className={format === "round-robin" ? "is-active" : ""}
            aria-pressed={format === "round-robin"}
            onClick={() => dispatch(setFormat("round-robin"))}
          >
            Round Robin
          </button>
          <button
            type="button"
            className={format === "swiss" ? "is-active" : ""}
            aria-pressed={format === "swiss"}
            onClick={() => dispatch(setFormat("swiss"))}
          >
            Swiss
          </button>
        </div>

        <p className="builder-status">
          {decidedCount} of {matchCount} matches decided
        </p>

        {format === "single" ? (
          <SingleElimination {...bracketProps} />
        ) : format === "double" ? (
          <DoubleElimination {...bracketProps} />
        ) : isRoundRobin ? (
          <RoundRobin {...bracketProps} />
        ) : (
          <Swiss {...bracketProps} />
        )}
      </section>

      <section className="schemes-teams" aria-labelledby="schemes-teams-heading">
        <div className="schemes-teams-head">
          <h3 id="schemes-teams-heading">Starting positions</h3>
          <span>{teams.length} teams · locked</span>
        </div>

        {teams.length === 0 ? (
          <p className="schemes-empty">No teams have registered yet.</p>
        ) : (
          <div className="schemes-team-grid">
            {teams.map((team) => {
              const players = Array.isArray(team.players) ? team.players : [];
              const teamAverage = average(
                players.map((player) => Number(player.currentMmr) || 0),
              );
              const seedNumber = seedOrder.get(Number(team.id));
              const isOut = eliminated.has(Number(team.id));

              return (
                <div className={`schemes-team ${isOut ? "is-out" : ""}`} key={team.id}>
                  <span className="schemes-team-avatar" aria-hidden="true">
                    {String(team.teamName ?? "?").trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="schemes-team-info">
                    <span className="schemes-team-name">{team.teamName}</span>
                    <span className="schemes-team-meta">
                      {players.length} players · avg{" "}
                      {NUMBER_FORMAT.format(teamAverage)} MMR
                    </span>
                  </span>
                  {isOut ? (
                    <span className="schemes-team-tag is-out">OUT</span>
                  ) : seedNumber ? (
                    <span className="schemes-team-tag">Seed {seedNumber}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

export default function MatchSchemes({ teams = [] }) {
  return (
    <>
      <style>{MATCH_SCHEME_STYLES}</style>
      <MatchSchemesPanel teams={teams} />
    </>
  );
}
