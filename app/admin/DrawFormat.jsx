"use client";

import { useDispatch } from "react-redux";
import MysteryBallDraw from "../../components/MysteryBallDraw";
import { setSeed } from "./schemeStore";

const normalizeName = (value) =>
  String(value ?? "").replace(/^\*\*|\*\*$/g, "").trim().toLowerCase();

const teamAverage = (players, key) => {
  const values = players
    .map((player) => Number(player[key]) || 0)
    .filter((value) => value > 0);

  if (values.length === 0) return null;
  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length,
  );
};

// The draw ceremony is presentational; this wrapper connects its finished
// fixture order to the same cached seed used by every Match Schemes format.
export default function DrawFormat({ teams = [], onApplied }) {
  const dispatch = useDispatch();

  // Registered teams arrive from /api/admin with player MMRs, not rolled-up
  // averages, so shape them into the fields the draw component understands.
  const drawTeams = teams.map((team) => {
    const players = Array.isArray(team.players) ? team.players : [];

    return {
      name: team.teamName ?? team.name,
      code: team.reference ?? team.code ?? team.registrationCode ?? team.id,
      avgMmr: teamAverage(players, "currentMmr") ?? team.avgMmr ?? null,
      peakMmr: teamAverage(players, "peakMmr") ?? team.avgPeak ?? null,
      players: players.length,
    };
  });

  const applyDrawOrder = (orderedTeamNames = []) => {
    if (orderedTeamNames.length !== teams.length || teams.length === 0) return;

    const byName = new Map(
      teams.map((team) => [normalizeName(team.teamName ?? team.name), team]),
    );
    const slots = {};

    orderedTeamNames.forEach((name, index) => {
      const team = byName.get(normalizeName(name));
      if (!team) return;

      // Matches the exact Round 1 slot order in Match Schemes:
      // [M1 Radiant, M1 Dire, M2 Radiant, M2 Dire, ...]
      slots[`u-0-${Math.floor(index / 2)}-${index % 2}`] = Number(team.id);
    });

    // Never replace a valid bracket with a partial mapping.
    if (Object.keys(slots).length !== teams.length) return;

    dispatch(setSeed({
      signature: teams.map((team) => Number(team.id)).join(","),
      slots,
    }));

    if (typeof onApplied === "function") onApplied();
  };

  return (
    <MysteryBallDraw
      embed
      teams={drawTeams}
      onApplyToBracket={(orderedTeamNames) => applyDrawOrder(orderedTeamNames)}
    />
  );
}
