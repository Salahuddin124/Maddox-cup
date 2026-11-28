"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MysteryBallDraw from "../../components/MysteryBallDraw";
import MatchSchemes from "./MatchSchemes";
import {
  hydrateTournament,
  resetAll,
  selectScheme,
  setFormat,
  setSeed,
} from "./schemeStore";

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

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

// Converts the revealed ball order into the exact Round 1 slot keys used by
// the Double Elimination bracket.
const slotsFromPicks = (picks = [], teams = []) => {
  const byName = new Map(
    teams.map((team) => [normalizeName(team.teamName ?? team.name), team]),
  );
  const slots = {};

  picks.forEach((pick, index) => {
    const team = byName.get(normalizeName(pick?.team));
    if (!team) return;
    slots[`u-0-${Math.floor(index / 2)}-${index % 2}`] = Number(team.id);
  });

  return slots;
};

const DRAW_PRINT_STYLES = `
  @media print {
    .admin-topbar,
    .dash-tabs,
    .summary,
    .mxd-actions,
    .mxd-tabs-bar,
    .mxd-btn,
    .bracket-schedule-input,
    .scheme-builder .btn-quiet {
      display: none !important;
    }

    .admin-shell,
    .dash-inner,
    .mxd-root,
    .mxd-card,
    .scheme-builder,
    .bracket-match,
    .bracket-champion .champion-card {
      background: #ffffff !important;
      color: #14213d !important;
      box-shadow: none !important;
    }

    .bracket-board {
      overflow: visible !important;
    }
  }
`;

// The ceremony is presentational; this wrapper keeps its draw order, the
// Double Elimination results, and the round schedule in the database.
export default function DrawFormat({ teams = [] }) {
  const dispatch = useDispatch();
  const { slots, winners } = useSelector(selectScheme);

  const signature = useMemo(
    () => teams.map((team) => Number(team.id)).join(","),
    [teams],
  );

  const drawTeams = useMemo(
    () =>
      teams.map((team) => {
        const players = Array.isArray(team.players) ? team.players : [];

        return {
          name: team.teamName ?? team.name,
          code: team.reference ?? team.code ?? team.registrationCode ?? team.id,
          avgMmr: teamAverage(players, "currentMmr") ?? team.avgMmr ?? null,
          peakMmr: teamAverage(players, "peakMmr") ?? team.avgPeak ?? null,
          players: players.length,
        };
      }),
    [teams],
  );

  const [picks, setPicks] = useState([]);
  const [loadError, setLoadError] = useState("");
  const readyRef = useRef(false);
  const persistTimer = useRef(null);
  const applyDrawOrderRef = useRef(() => {});
  const skipAutoApplyRef = useRef(false);
  const snapshotRef = useRef({
    signature: "",
    picks: [],
    slots: {},
    winners: {},
  });

  const saveTournament = useCallback(() => {
    if (!readyRef.current || teams.length !== 8) return;

    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      fetch("/api/tournament", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshotRef.current),
      }).catch(() => {});
    }, 400);
  }, [teams.length]);

  useEffect(() => {
    if (teams.length !== 8) return undefined;

    let cancelled = false;
    readyRef.current = false;

    fetch("/api/tournament", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then(async (result) => {
        const saved = result?.state;
        let savedPicks = Array.isArray(saved?.picks) ? saved.picks : [];

        // A changed roster makes an old draw meaningless. Discard it rather
        // than putting stale team IDs back into the bracket.
        if (
          saved &&
          typeof saved.signature === "string" &&
          saved.signature !== signature
        ) {
          savedPicks = [];
          await fetch("/api/tournament", {
            method: "DELETE",
            credentials: "same-origin",
          }).catch(() => {});
        }

        if (cancelled) return;

        const savedSlots = isRecord(saved?.slots) ? saved.slots : {};
        const seedSlots = {};

        for (const [key, teamId] of Object.entries(savedSlots)) {
          if (key.startsWith("u-0-")) seedSlots[key] = teamId;
        }
        if (Object.keys(seedSlots).length === 0 && savedPicks.length === 8) {
          Object.assign(seedSlots, slotsFromPicks(savedPicks, teams));
        }

        const bracketSlots =
          Object.keys(savedSlots).length > 0 ? savedSlots : seedSlots;

        dispatch(hydrateTournament({
          signature,
          picks: savedPicks,
          slots: bracketSlots,
          winners: isRecord(saved?.winners) ? saved.winners : {},
        }));

        snapshotRef.current = {
          signature,
          picks: savedPicks,
          slots: bracketSlots,
          winners: isRecord(saved?.winners) ? saved.winners : {},
        };
        // Restoring a finished draw must not replay the ceremony's auto-apply,
        // which would wipe winners restored from the database.
        skipAutoApplyRef.current = savedPicks.length === 8;
        setPicks(savedPicks);
        setLoadError(result && !result.ok ? "Couldn't load the saved draw." : "");
        readyRef.current = true;
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Couldn't load the saved draw.");
        readyRef.current = true;
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, signature, teams]);

  useEffect(() => () => clearTimeout(persistTimer.current), []);

  useEffect(() => {
    snapshotRef.current.signature = signature;
    dispatch(setFormat("double"));
    saveTournament();
  }, [dispatch, signature, saveTournament]);

  useEffect(() => {
    snapshotRef.current.slots = slots;
    snapshotRef.current.winners = winners;
    saveTournament();
  }, [slots, winners, saveTournament]);

  const handleDrawChange = useCallback(
    (nextPicks = []) => {
      const byName = new Map(
        teams.map((team) => [normalizeName(team.teamName ?? team.name), team]),
      );
      const enriched = nextPicks.map((pick) => ({
        ...pick,
        teamId: Number(byName.get(normalizeName(pick?.team))?.id) || null,
      }));

      snapshotRef.current.picks = enriched;
      setPicks(nextPicks);
      saveTournament();

      // Apply as soon as the eighth ball is revealed so the bracket beneath
      // the fixtures is already in the drawn order.
      if (nextPicks.length === 8) {
        if (skipAutoApplyRef.current) skipAutoApplyRef.current = false;
        else applyDrawOrderRef.current(nextPicks.map((pick) => pick.team));
      }
    },
    [saveTournament, teams],
  );

  const handleReset = useCallback(() => {
    readyRef.current = false;
    clearTimeout(persistTimer.current);
    snapshotRef.current = {
      signature,
      picks: [],
      slots: {},
      winners: {},
    };
    setPicks([]);
    dispatch(resetAll());

    Promise.all([
      fetch("/api/tournament", {
        method: "DELETE",
        credentials: "same-origin",
      }),
      fetch("/api/schedule", {
        method: "DELETE",
        credentials: "same-origin",
      }),
    ])
      .catch(() => {})
      .finally(() => {
        readyRef.current = true;
      });
  }, [dispatch, signature]);

  const applyDrawOrder = useCallback(
    (orderedTeamNames = []) => {
      if (orderedTeamNames.length !== teams.length || teams.length === 0) return;

      const nextSlots = slotsFromPicks(
        orderedTeamNames.map((team) => ({ team })),
        teams,
      );
      if (Object.keys(nextSlots).length !== teams.length) return;

      dispatch(setSeed({ signature, slots: nextSlots }));
      dispatch(setFormat("double"));
      snapshotRef.current.slots = nextSlots;
      snapshotRef.current.winners = {};
      saveTournament();
    },
    [dispatch, saveTournament, signature, teams],
  );

  applyDrawOrderRef.current = applyDrawOrder;

  const drawComplete = picks.length === 8;

  return (
    <>
      <style>{DRAW_PRINT_STYLES}</style>

      {loadError ? (
        <p className="form-error" role="alert">
          {loadError}
        </p>
      ) : null}

      {teams.length !== 8 ? (
        <p className="empty-state">
          The draw needs exactly 8 registered teams before it can start.
        </p>
      ) : (
        <>
          <MysteryBallDraw
            embed
            teams={drawTeams}
            initialPicks={picks}
            onDrawChange={handleDrawChange}
            onResetDraw={handleReset}
            onDrawComplete={(_fixtures, orderedTeamNames) =>
              applyDrawOrder(orderedTeamNames)
            }
            onApplyToBracket={applyDrawOrder}
            applyLabel="Save Draw"
          />

          {drawComplete ? (
            <div className="draw-bracket" aria-label="Double Elimination bracket">
              <MatchSchemes teams={teams} embedded />
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
